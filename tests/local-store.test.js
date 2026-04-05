import { describe, it, expect, beforeEach } from 'vitest'
import { getStoreKey, setLocal, getLocal, removeLocal } from '@/utils/local-store'

beforeEach(() => { globalThis.__clearMockStorage() })

describe('getStoreKey', () => {
  it('generates key with prefix and parts', () => {
    expect(getStoreKey('user1', 'cache', 'projects')).toBe('dk_user1_cache_projects')
  })

  it('handles single part', () => {
    expect(getStoreKey('user1', 'pending')).toBe('dk_user1_pending')
  })
})

describe('setLocal / getLocal', () => {
  it('stores and retrieves data with metadata', () => {
    setLocal('test_key', { name: 'hello' })
    const result = getLocal('test_key')
    expect(result.data).toEqual({ name: 'hello' })
    expect(result.timestamp).toBeTypeOf('number')
    expect(result.source).toBe('local')
  })

  it('stores array data', () => {
    setLocal('arr_key', [1, 2, 3])
    const result = getLocal('arr_key')
    expect(result.data).toEqual([1, 2, 3])
  })

  it('returns null for non-existent key', () => {
    expect(getLocal('no_such_key')).toBeNull()
  })
})

describe('removeLocal', () => {
  it('removes a stored key', () => {
    setLocal('rm_key', 'value')
    expect(getLocal('rm_key')).not.toBeNull()
    removeLocal('rm_key')
    expect(getLocal('rm_key')).toBeNull()
  })
})
