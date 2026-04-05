/**
 * 同步管理器（SyncManager）
 * 负责将 PendingOps 队列批量同步到云端
 */

import { getPendingOps, removePendingOp, savePendingOps } from './pending-ops'
import { db, COLLECTIONS } from '@/cloud-emas/database/database'
import { isQuotaError } from '@/cloud-emas/database/error'
import { touchCloudVersion } from './version-check'

let _syncing = false
let _syncTimeout = null

export function debouncedSync(accountId) {
  if (_syncTimeout) clearTimeout(_syncTimeout)
  _syncTimeout = setTimeout(() => syncPendingOps(accountId), 300)
}

export async function syncPendingOps(accountId) {
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
        return { synced: syncedCount, remaining: getPendingOps(accountId).length }
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
  return { synced: syncedCount, remaining: getPendingOps(accountId).length }
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
