/**
 * 用户身份工具
 * accountId 持久化到 storage，确保重启后身份不丢失
 */
import { DEV_MODE, TEST_ACCOUNT_ID } from '@/config/index'

const STORAGE_KEY = 'dk-account-id'
const LOGIN_TYPE_KEY = 'dk-login-type'

let _accountId = ''

function loadFromStorage() {
  try {
    return uni.getStorageSync(STORAGE_KEY) || ''
  } catch (e) {
    return ''
  }
}

function saveToStorage(id) {
  try {
    uni.setStorageSync(STORAGE_KEY, id)
  } catch (e) {}
}

export function getAccountId() {
  if (!_accountId) {
    _accountId = loadFromStorage()
  }
  return _accountId
}

export function setAccountId(id) {
  _accountId = id
  saveToStorage(id)
}

export async function requireAccountId() {
  if (_accountId) return _accountId

  const stored = loadFromStorage()
  if (stored) {
    _accountId = stored
    return _accountId
  }

  if (DEV_MODE) {
    setAccountId('mock_user')
    return _accountId
  }

  _accountId = TEST_ACCOUNT_ID
  return _accountId
}

export function isLoggedIn() {
  return !!getAccountId()
}

export function getLoginType() {
  try {
    return uni.getStorageSync(LOGIN_TYPE_KEY) || 'anonymous'
  } catch (e) {
    return 'anonymous'
  }
}

export function setLoginType(type) {
  try {
    uni.setStorageSync(LOGIN_TYPE_KEY, type)
  } catch (e) {}
}

export function clearAccountId() {
  _accountId = ''
  try {
    uni.removeStorageSync(STORAGE_KEY)
    uni.removeStorageSync(LOGIN_TYPE_KEY)
  } catch (e) {}
}
