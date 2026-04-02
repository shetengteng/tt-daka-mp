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

const ENV_CONFIG = {
  dev: {
    wxAppId: 'wx6797dbdc8e87ed7c',
    emas: {
      spaceId: 'mp-7cc0e56a-b5a1-4347-8a40-f3868127df92',
      clientSecret: 'WF5bbdgWDNbR51FMDQ1gEw==',
      endpoint: 'https://api.next.bspapp.com',
    },
  },
  prod: {
    wxAppId: 'wx6797dbdc8e87ed7c',
    emas: {
      spaceId: 'mp-7cc0e56a-b5a1-4347-8a40-f3868127df92',
      clientSecret: 'WF5bbdgWDNbR51FMDQ1gEw==',
      endpoint: 'https://api.next.bspapp.com',
    },
  },
}

const currentEnv = ENV_CONFIG[ENV] || ENV_CONFIG.dev

export const WX_APPID = currentEnv.wxAppId
export const EMAS_CONFIG = currentEnv.emas
