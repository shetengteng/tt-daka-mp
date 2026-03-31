/**
 * EMAS Serverless 入口
 * @module cloud-emas/database/index
 */

import MPServerless from '@alicloud/mpserverless-sdk'
import { EMAS_CONFIG, WX_APPID } from '@/config/index'

let mpserverless = null
let _initialized = false

export const getMpServerless = () => mpserverless

export const initEmas = async () => {
  if (_initialized && mpserverless) return true
  
  try {
    mpserverless = new MPServerless(uni, {
      appId: WX_APPID,
      spaceId: EMAS_CONFIG.spaceId,
      clientSecret: EMAS_CONFIG.clientSecret,
      endpoint: EMAS_CONFIG.endpoint
    })
    _initialized = true
    console.log('[EMAS] SDK 初始化成功')
    return true
  } catch (error) {
    console.error('[EMAS] 初始化失败:', error)
    return false
  }
}

export const isEmasReady = () => _initialized && !!mpserverless

export const getDb = () => {
  if (!mpserverless) {
    console.error('[EMAS] SDK 未初始化')
    return null
  }
  return mpserverless.db
}

export { COLLECTIONS } from './schema'
