import { describe, it, expect, beforeEach } from 'vitest'
import {
  getAccountId, setAccountId, isLoggedIn,
  getLoginType, setLoginType, clearAccountId, clearLoginType,
} from '@/utils/auth'

beforeEach(() => {
  globalThis.__clearMockStorage()
  clearAccountId()
})

describe('setAccountId / getAccountId', () => {
  it('stores and retrieves accountId', () => {
    setAccountId('user_123')
    expect(getAccountId()).toBe('user_123')
  })

  it('persists to storage', () => {
    setAccountId('user_abc')
    clearAccountId()
    setAccountId('user_abc')
    expect(getAccountId()).toBe('user_abc')
  })
})

describe('isLoggedIn', () => {
  it('returns false when no account', () => {
    expect(isLoggedIn()).toBe(false)
  })

  it('returns true after login', () => {
    setAccountId('user_1')
    expect(isLoggedIn()).toBe(true)
  })
})

describe('loginType', () => {
  it('defaults to anonymous', () => {
    expect(getLoginType()).toBe('anonymous')
  })

  it('stores and retrieves login type', () => {
    setLoginType('wechat')
    expect(getLoginType()).toBe('wechat')
  })

  it('clearLoginType resets to anonymous', () => {
    setLoginType('wechat')
    clearLoginType()
    expect(getLoginType()).toBe('anonymous')
  })
})

describe('clearAccountId', () => {
  it('clears accountId and login type', () => {
    setAccountId('user_x')
    setLoginType('wechat')
    clearAccountId()
    expect(isLoggedIn()).toBe(false)
    expect(getLoginType()).toBe('anonymous')
  })
})
