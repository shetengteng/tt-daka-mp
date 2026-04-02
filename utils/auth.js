/**
 * 用户身份工具
 * DEV_MODE: 使用 mock_user
 * 微信小程序: 使用 uni.login 获取 openid
 * H5 开发: 使用 config 中的固定 TEST_ACCOUNT_ID
 */
import { DEV_MODE, TEST_ACCOUNT_ID } from '@/config/index'

let _accountId = ''

export function getAccountId() {
  return _accountId
}

export function setAccountId(id) {
  _accountId = id
}

export async function requireAccountId() {
  if (_accountId) return _accountId

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
    return _accountId
  } catch (error) {
    console.warn('[Auth] uni.login 不可用，使用测试 accountId')
  }

  // H5 环境回退：使用固定测试 accountId
  _accountId = TEST_ACCOUNT_ID
  return _accountId
}

export function initAccountId() {
  _accountId = ''
}
