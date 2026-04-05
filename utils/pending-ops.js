/**
 * 待同步操作队列（PendingOps）
 * Local-First 写操作先入队，由 SyncManager 异步批量同步
 */

import { getLocal, setLocal, getStoreKey } from './local-store'

function _getKey(accountId) {
  return getStoreKey(accountId, 'pending', 'ops')
}

export function getPendingOps(accountId) {
  const entry = getLocal(_getKey(accountId))
  return entry?.data || []
}

export function addPendingOp(accountId, op) {
  const ops = getPendingOps(accountId)
  ops.push({
    ...op,
    id: `op_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: Date.now(),
    retryCount: 0,
    merged: false,
  })
  setLocal(_getKey(accountId), ops)
}

export function removePendingOp(accountId, opId) {
  const ops = getPendingOps(accountId).filter(o => o.id !== opId)
  setLocal(_getKey(accountId), ops)
}

export function savePendingOps(accountId, ops) {
  setLocal(_getKey(accountId), ops)
}

export function clearPendingOps(accountId) {
  setLocal(_getKey(accountId), [])
}

export function getPendingCount(accountId) {
  return getPendingOps(accountId).length
}
