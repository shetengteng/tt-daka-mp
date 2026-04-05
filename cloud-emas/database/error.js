/**
 * EMAS 错误处理
 * @module cloud-emas/database/error
 */

const QUOTA_KEYWORDS = [
  'quota', 'limit', 'exceeded', 'exhausted', 'throttl', '503', 'rate limit',
  'prepayresource', 'resource exhausted',
  '频率', '超限', '额度', '请求过多', 'too many request', 'service unavailable',
]

let _lastQuotaToastTime = 0
const QUOTA_TOAST_INTERVAL = 5000

export function isQuotaError(error) {
  const msg = (error?.message || error?.error?.message || String(error)).toLowerCase()
  const code = String(error?.code || error?.status || error?.statusCode || '').toLowerCase()
  if (code === '503' || code === '429' || code === 'prepayresourceexhausted') return true
  return QUOTA_KEYWORDS.some(k => msg.includes(k) || code.includes(k))
}

export function handleEmasError(error, operation = '操作') {
  if (isQuotaError(error)) {
    const now = Date.now()
    if (now - _lastQuotaToastTime > QUOTA_TOAST_INTERVAL) {
      _lastQuotaToastTime = now
      uni.showToast({
        title: '今日云服务请求额度已用完，请明天再试',
        icon: 'none',
        duration: 3000,
      })
    }
    console.warn(`[EMAS] ${operation} - 请求额度超限:`, error)
    throw new Error('云服务请求额度已用完，请明天再试')
  }

  console.error(`[EMAS] ${operation}失败:`, error)
  throw error
}

/**
 * 检查 EMAS 操作结果
 * @param {Object} res - EMAS 返回结果
 * @param {string} operation - 操作描述
 */
export function checkEmasError(res, operation = '操作') {
  if (!res) {
    throw new Error(`[EMAS] ${operation}返回空结果`)
  }
  if (res.error) {
    throw new Error(`[EMAS] ${operation}失败: ${res.error.message || JSON.stringify(res.error)}`)
  }
}
