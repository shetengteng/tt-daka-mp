/**
 * 待同步操作队列（PendingOps）
 * Local-First 写操作先入队，由 SyncManager 异步批量同步
 *
 * 队列存储在 localStorage 中，key 格式: dk_{accountId}_pending_ops
 * 每个 op 结构: { id, op, collection, data?, where?, timestamp, retryCount, merged }
 */

import { getLocal, setLocal, getStoreKey } from './local-store'

function _getKey(accountId) {
  return getStoreKey(accountId, 'pending', 'ops')
}

/** 读取指定用户的全部 pending 操作 */
export function getPendingOps(accountId) {
  const entry = getLocal(_getKey(accountId))
  return entry?.data || []
}

/**
 * 添加一个待同步操作到队列
 *
 * 入队前会做「互逆操作抵消」检测：
 * 如果队列中已存在同一 collection + projectId + date 的相反操作
 * （add 对 remove，或 remove 对 add），则两者互相抵消——
 * 移除队列中的旧操作，新操作也不入队。
 *
 * 典型场景：用户先取消打卡(remove)再重新打卡(add)，或反过来。
 * 抵消后 pendingCount 不增加，不触发无效同步，OfflineBar 也不会误显示。
 *
 * @param {string} accountId
 * @param {{ op: 'add'|'remove'|'update', collection: string, data?: object, where?: object }} op
 * @returns {number} 操作后队列中的 pending 数量
 */
export function addPendingOp(accountId, op) {
  const ops = getPendingOps(accountId)

  const projectId = op.data?.projectId || op.where?.projectId
  const date = op.data?.date || op.where?.date
  if (projectId && date) {
    const opposite = op.op === 'add' ? 'remove' : 'add'
    const idx = ops.findIndex(o =>
      o.collection === op.collection &&
      o.op === opposite &&
      (o.data?.projectId || o.where?.projectId) === projectId &&
      (o.data?.date || o.where?.date) === date
    )
    if (idx !== -1) {
      ops.splice(idx, 1)
      setLocal(_getKey(accountId), ops)
      return ops.length
    }
  }

  ops.push({
    ...op,
    id: `op_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: Date.now(),
    retryCount: 0,
    merged: false,
  })
  setLocal(_getKey(accountId), ops)
  return ops.length
}

/** 同步成功后移除单个操作 */
export function removePendingOp(accountId, opId) {
  const ops = getPendingOps(accountId).filter(o => o.id !== opId)
  setLocal(_getKey(accountId), ops)
}

/** 覆盖保存整个操作队列（重试计数更新后调用） */
export function savePendingOps(accountId, ops) {
  setLocal(_getKey(accountId), ops)
}

/** 清空全部 pending 操作（退出登录时调用） */
export function clearPendingOps(accountId) {
  setLocal(_getKey(accountId), [])
}

/** 获取待同步操作数量 */
export function getPendingCount(accountId) {
  return getPendingOps(accountId).length
}
