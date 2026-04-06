/**
 * 项目配置
 */

// true = mock 数据, false = EMAS 真实数据库
export const DEV_MODE = false

// 环境切换：'dev' | 'prod'
export const ENV = 'dev'

// H5 开发环境使用的固定测试 accountId
export const TEST_ACCOUNT_ID = 'dk_test_user_001'

export const PROJECT_CONFIG = {
  prefix: 'dk',
  name: 'tt打卡',
  nameEn: 'TT Daka',
  version: '1.0.0',
}

import ENV_CONFIG from './env.config.json'

const currentEnv = ENV_CONFIG[ENV] || ENV_CONFIG.dev

export const WX_APPID = currentEnv.wxAppId
export const EMAS_CONFIG = currentEnv.emas
