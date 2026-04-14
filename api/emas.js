/**
 * EMAS 统一入口
 */
import { setupEmas, isQuotaError, handleEmasError, checkEmasError } from '@/uni_modules/tt-shaduni/cloud-emas/index'
import { EMAS_CONFIG, WX_APPID, DEV_MODE } from '@/config/index'
import { mockDb } from '@/mock/db'
import { COLLECTIONS } from './schema'

const {
  initEmas, getMpServerless, isEmasReady, getDb,
  db, dbCmd, command,
  anonymousAuth, isAuthorized, resetAuthState,
  wechatAuth, isWechatAuthorized, resetWechatAuthState,
} = setupEmas({
  config: { appId: WX_APPID, ...EMAS_CONFIG },
  mockDb: DEV_MODE ? mockDb : undefined,
})

export {
  initEmas, getMpServerless, isEmasReady, getDb,
  db, dbCmd, command,
  anonymousAuth, isAuthorized, resetAuthState,
  wechatAuth, isWechatAuthorized, resetWechatAuthState,
  isQuotaError, handleEmasError, checkEmasError,
  COLLECTIONS,
}

export const loginWechatAuth = wechatAuth
