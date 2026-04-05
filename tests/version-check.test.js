import { describe, it, expect, beforeEach } from 'vitest'
import { updateLocalVersion } from '@/utils/version-check'
import { getLocal, getStoreKey } from '@/utils/local-store'

beforeEach(() => { globalThis.__clearMockStorage() })

describe('updateLocalVersion', () => {
  it('stores version in localStorage', () => {
    updateLocalVersion('user1', 1712345678000)
    const key = getStoreKey('user1', 'meta', 'dataVersion')
    const entry = getLocal(key)
    expect(entry.data).toBe(1712345678000)
  })

  it('overwrites previous version', () => {
    updateLocalVersion('user1', 100)
    updateLocalVersion('user1', 200)
    const key = getStoreKey('user1', 'meta', 'dataVersion')
    const entry = getLocal(key)
    expect(entry.data).toBe(200)
  })
})
