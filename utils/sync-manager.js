/**
 * 同步管理器（SyncManager）
 * 负责将 PendingOps 队列批量同步到云端
 */

import { getPendingOps, removePendingOp, savePendingOps, getPendingCount } from './pending-ops'
import { db, COLLECTIONS } from '@/cloud-emas/database/database'
import { isQuotaError } from '@/cloud-emas/database/error'
import { touchCloudVersion } from './version-check'
import { useRecordStore } from '@/stores/record'
import { getAccountId } from '@/utils/auth'

let _syncing = false
let _syncTimeout = null
let _pollTimer = null
const SYNC_DELAY = 30 * 1000

/**
 * 延迟同步：打卡后 30s 延迟触发，多次操作只保留最后一次计时
 * 设计意图：积攒一段时间的操作后批量同步，减少 API 调用
 */
export function debouncedSync() {
  if (_syncTimeout) clearTimeout(_syncTimeout)
  _syncTimeout = setTimeout(() => syncPendingOps(), SYNC_DELAY)
}

export function startSyncPoll() {
  stopSyncPoll()
  const accountId = getAccountId()
  if (!accountId) return
  _pollTimer = setInterval(() => {
    if (getPendingCount(accountId) > 0) syncPendingOps()
  }, SYNC_DELAY)
}

export function stopSyncPoll() {
  if (_pollTimer) { clearInterval(_pollTimer); _pollTimer = null }
}

export async function syncPendingOps() {
  const accountId = getAccountId()
  if (_syncing || !accountId) return { synced: 0, remaining: 0 }

  let ops = getPendingOps(accountId)
  if (ops.length === 0) return { synced: 0, remaining: 0 }

  ops = mergeOps(ops)
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
    uni.showToast({ title: `已同步 ${syncedCount} 条记录`, icon: 'none', duration: 2000 })
  }

  _syncing = false

  const remaining = getPendingCount(accountId)
  try {
    const recordStore = useRecordStore()
    recordStore.pendingCount = remaining
  } catch (e) {}

  return { synced: syncedCount, remaining }
}

export function mergeOps(ops) {
  const cancelMap = new Map()

  for (let i = ops.length - 1; i >= 0; i--) {
    const op = ops[i]
    if (op.collection !== COLLECTIONS.RECORDS) continue

    const projectId = op.data?.projectId || op.where?.projectId
    const date = op.data?.date || op.where?.date || ''
    const key = `${op.collection}_${projectId}_${date}`

    if (op.op === 'remove') {
      cancelMap.set(key, i)
    } else if (op.op === 'add' && cancelMap.has(key)) {
      ops[i].merged = true
      ops[cancelMap.get(key)].merged = true
      cancelMap.delete(key)
    }
  }

  return ops.filter(op => !op.merged)
}
