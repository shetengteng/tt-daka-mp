/**
 * 用户身份工具
 * 个人工具使用微信 openid 作为 accountId
 */

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
    console.warn('[Auth] uni.login 不可用，使用 mock accountId')
    _accountId = 'mock_user'
    return _accountId
  }
}

export function initAccountId() {
  const cached = uni.getStorageSync('dk_account_id')
  if (cached) {
    _accountId = cached
  }
}
