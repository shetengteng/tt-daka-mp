/**
 * EMAS 微信授权
 * 使用 wechat_openapi 进行微信登录，获取 openid 用于账号唯一标识
 * 
 * @module cloud-emas/database/api/wechatAuth
 */

import { initEmas, getMpServerless } from '../index'

let _wechatAuthorized = false

export const resetWechatAuthState = () => {
  _wechatAuthorized = false
}

export const isWechatAuthorized = () => _wechatAuthorized

export const wechatAuth = async () => {
  await initEmas()
  const mpserverless = getMpServerless()

  if (!mpserverless) {
    return { success: false, userInfo: null, error: 'SDK 未初始化' }
  }

  if (_wechatAuthorized) {
    try {
      const getUserInfoRes = await mpserverless.user.getInfo()
      if (getUserInfoRes.success) {
        const userInfo = getUserInfoRes.result?.user || getUserInfoRes.result
        return { success: true, userInfo }
      }
    } catch (error) {
      _wechatAuthorized = false
    }
  }

  try {
    await mpserverless.user.authorize({ authProvider: 'wechat_openapi' })

    const getUserInfoRes = await mpserverless.user.getInfo()

    if (getUserInfoRes.success) {
      const userInfo = getUserInfoRes.result?.user || getUserInfoRes.result
      _wechatAuthorized = true
      console.log('[EMAS] 微信授权成功')
      return { success: true, userInfo }
    }

    return { success: false, userInfo: null, error: '获取用户信息失败' }
  } catch (error) {
    const errorMsg = error?.message || error?.error?.message || ''

    if (errorMsg.includes('already authorized') || errorMsg.includes('已授权')) {
      const getUserInfoRes = await mpserverless.user.getInfo()
      if (getUserInfoRes.success) {
        const userInfo = getUserInfoRes.result?.user || getUserInfoRes.result
        _wechatAuthorized = true
        console.log('[EMAS] 已有微信授权，复用成功')
        return { success: true, userInfo }
      }
      return { success: false, userInfo: null, error: '获取用户信息失败' }
    }

    console.error('[EMAS] 微信授权失败:', error)
    return { success: false, userInfo: null, error: errorMsg || '微信授权失败' }
  }
}

export const loginWechatAuth = wechatAuth
