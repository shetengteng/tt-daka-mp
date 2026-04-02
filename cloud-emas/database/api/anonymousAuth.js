/**
 * EMAS 匿名授权
 * H5 环境下需要先进行匿名授权才能操作数据库
 * @module cloud-emas/database/api/anonymousAuth
 */

import { initEmas, getMpServerless } from '../index'

let _anonymousAuthorized = false

export const isAuthorized = () => _anonymousAuthorized

export const resetAuthState = () => {
  _anonymousAuthorized = false
}

export const anonymousAuth = async () => {
  await initEmas()
  const mpserverless = getMpServerless()

  if (_anonymousAuthorized) {
    return { success: true }
  }

  try {
    await mpserverless.user.authorize({ authType: 'anonymous' })
    _anonymousAuthorized = true
    console.log('[EMAS] 匿名授权成功')
    return { success: true }
  } catch (error) {
    const errorMsg = error?.message || error?.error?.message || ''

    if (errorMsg.includes('already authorized') || errorMsg.includes('已授权')) {
      _anonymousAuthorized = true
      console.log('[EMAS] 已有授权，复用成功')
      return { success: true }
    }

    console.error('[EMAS] 匿名授权失败:', error)
    return { success: false, error: errorMsg || '授权失败' }
  }
}

export default anonymousAuth
