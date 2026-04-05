/**
 * 本地缓存工具（纯 localStorage 原子操作）
 * 不含业务逻辑，由 Store 层调用
 */

const PREFIX = 'dk_'

export function getStoreKey(accountId, ...parts) {
  return `${PREFIX}${accountId}_${parts.join('_')}`
}

export function setLocal(key, data) {
  try {
    uni.setStorageSync(key, JSON.stringify({
      data,
      timestamp: Date.now(),
      source: 'local',
    }))
  } catch (e) {
    console.warn('[LocalStore] 写入失败:', key, e)
  }
}

export function getLocal(key) {
  try {
    const raw = uni.getStorageSync(key)
    if (!raw) return null
    return JSON.parse(raw)
  } catch (e) {
    return null
  }
}

export function removeLocal(key) {
  try {
    uni.removeStorageSync(key)
  } catch (e) {}
}

export function clearUserCache(accountId) {
  try {
    const info = uni.getStorageInfoSync()
    const prefix = `${PREFIX}${accountId}_`
    ;(info.keys || []).forEach(key => {
      if (key.startsWith(prefix)) uni.removeStorageSync(key)
    })
  } catch (e) {}
}
