/**
 * 同步管理器（SyncManager）
 * 负责将 PendingOps 队列批量同步到云端
 */

import { getPendingOps, removePendingOp, savePendingOps, getPendingCount } from './pending-ops'
import { db, COLLECTIONS } from '@/cloud-emas/database/database'
import { isQuotaError } from '@/cloud-emas/database/error'
import { touchCloudVersion } from './version-check'
import { useRecordStore } from '@/stores/record'
import { useProjectStore } from '@/stores/project'
import { getAccountId } from '@/utils/auth'

let _syncing = false
let _syncTimeout = null
const SYNC_DELAY = 5 * 1000

/**
 * 延迟同步：打卡后 5s 延迟触发，多次操作只保留最后一次计时
 * 5s 窗口内的互逆操作（打卡+取消）会被 addPendingOp 即时抵消
 */
export function debouncedSync() {
  if (_syncTimeout) clearTimeout(_syncTimeout)
  _syncTimeout = setTimeout(() => syncPendingOps(), SYNC_DELAY)
}

export async function syncPendingOps() {
  const accountId = getAccountId()
  if (_syncing || !accountId) return { synced: 0, remaining: 0 }

  let ops = getPendingOps(accountId)
  if (ops.length === 0) return { synced: 0, remaining: 0 }

  const before = ops.length
  ops = mergeOps(ops)
  if (ops.length < before) savePendingOps(accountId, ops)
  if (ops.length === 0) return { synced: 0, remaining: 0 }

  _syncing = true
  let syncedCount = 0

  const addGroups = {}
  const otherOps = []

  for (const op of ops) {
    if (op.op === 'add') {
      const key = op.collection
      if (!addGroups[key]) addGroups[key] = []
      addGroups[key].push(op)
    } else {
      otherOps.push(op)
    }
  }

  for (const [collection, groupedOps] of Object.entries(addGroups)) {
    try {
      const cleanData = groupedOps.map(op => {
        const d = { ...op.data }
        if (d._id && d._id.startsWith('local_')) delete d._id
        return d
      })
      await db.collection(collection).addBatch(cleanData)
      groupedOps.forEach(op => removePendingOp(accountId, op.id))
      syncedCount += groupedOps.length
    } catch (e) {
      if (isQuotaError(e)) {
        _syncing = false
        const r = getPendingCount(accountId)
        try { useRecordStore().pendingCount = r } catch (_) {}
        return { synced: syncedCount, remaining: r }
      }
      groupedOps.forEach(op => { op.retryCount++ })
      const remaining = groupedOps.filter(op => op.retryCount < 3)
      groupedOps.filter(op => op.retryCount >= 3).forEach(op => {
        console.warn('[Sync] 丢弃重试超限的操作:', op.id)
        removePendingOp(accountId, op.id)
      })
      if (remaining.length > 0) savePendingOps(accountId, getPendingOps(accountId))
    }
  }

  for (const op of otherOps) {
    try {
      if (op.op === 'remove') {
        await db.collection(op.collection).where(op.where).remove()
      } else if (op.op === 'update') {
        await db.collection(op.collection).doc(op.docId).update(op.data)
      }
      removePendingOp(accountId, op.id)
      syncedCount++
    } catch (e) {
      if (isQuotaError(e)) break
      op.retryCount++
      if (op.retryCount >= 3) {
        console.warn('[Sync] 丢弃重试超限的操作:', op.id)
        removePendingOp(accountId, op.id)
      }
      break
    }
  }

  if (syncedCount > 0) {
    await touchCloudVersion(accountId)
    try { useProjectStore().markDirty() } catch (_) {}
  }

  _syncing = false

  const remaining = getPendingCount(accountId)
  try {
    const recordStore = useRecordStore()
    recordStore.pendingCount = remaining
  } catch (e) {}

  return { synced: syncedCount, remaining }
}

/**
 * 同步前的兜底合并：将互逆操作(add/remove)标记为 merged 后过滤掉
 *
 * 正常情况下 addPendingOp 已在入队时做了即时抵消，
 * 这里是防御性措施，处理极端时序（如并发写入）导致遗漏的情况。
 *
 * 算法：正向遍历，用 Map 记录未配对的操作。
 * 遇到同 key(collection+projectId+date) 的相反操作时，标记两者 merged。
 * 支持 add→remove 和 remove→add 两种顺序。
 */
export function mergeOps(ops) {
  const opKey = (op) => {
    if (op.collection !== COLLECTIONS.RECORDS) return null
    const projectId = op.data?.projectId || op.where?.projectId
    const date = op.data?.date || op.where?.date || ''
    return `${op.collection}_${projectId}_${date}`
  }

  const pending = new Map()

  for (let i = 0; i < ops.length; i++) {
    const key = opKey(ops[i])
    if (!key) continue

    const opposite = ops[i].op === 'add' ? 'remove' : 'add'
    if (pending.has(key) && ops[pending.get(key)].op === opposite) {
      ops[pending.get(key)].merged = true
      ops[i].merged = true
      pending.delete(key)
    } else {
      pending.set(key, i)
    }
  }

  return ops.filter(op => !op.merged)
}
