/**
 * 用户身份工具
 * DEV_MODE: 使用 mock_user
 * 微信小程序: 使用 uni.login 获取 openid
 * H5 开发: 使用 EMAS 匿名授权 userId
 */
import { DEV_MODE } from '@/config/index'

let _accountId = ''

export function getAccountId() {
  return _accountId
}

export function setAccountId(id) {
  _accountId = id
}

export async function requireAccountId() {
  if (_accountId) return _accountId

  const cached = uni.getStorageSync('dk_account_id')
  if (cached) {
    _accountId = cached
    return _accountId
  }

  if (DEV_MODE) {
    _accountId = 'mock_user'
    return _accountId
  }

  // 微信小程序环境：通过 uni.login 获取 code 作为 accountId
  try {
    const res = await new Promise((resolve, reject) => {
      uni.login({
        provider: 'weixin',
        success: resolve,
        fail: reject
      })
    })
    _accountId = res.code || `wx_${Date.now()}`
    uni.setStorageSync('dk_account_id', _accountId)
    return _accountId
  } catch (error) {
    console.warn('[Auth] uni.login 不可用，尝试 EMAS 匿名授权')
  }

  // H5 环境回退：使用 EMAS 匿名授权获取 userId
  try {
    const { anonymousAuth } = await import('@/cloud-emas/database/api/anonymousAuth')
    await anonymousAuth()
    const { getMpServerless } = await import('@/cloud-emas/database/index')
    const mp = getMpServerless()
    const userInfo = await mp.user.getInfo()
    const userId = userInfo?.result?.user?.userId || userInfo?.result?.userId
    if (userId) {
      _accountId = userId
      uni.setStorageSync('dk_account_id', userId)
      return _accountId
    }
  } catch (error) {
    console.error('[Auth] EMAS 获取 userId 失败:', error)
  }

  _accountId = `anon_${Date.now()}`
  uni.setStorageSync('dk_account_id', _accountId)
  return _accountId
}

export function initAccountId() {
  const cached = uni.getStorageSync('dk_account_id')
  if (cached) {
    _accountId = cached
  }
}
