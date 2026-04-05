import { describe, it, expect } from 'vitest'
import { isQuotaError, handleEmasError } from '@/cloud-emas/database/error'

describe('isQuotaError', () => {
  it('detects PrePayResourceExhausted code', () => {
    expect(isQuotaError({ code: 'PrePayResourceExhausted', message: 'DB read action failed' })).toBe(true)
  })

  it('detects HTTP 503', () => {
    expect(isQuotaError({ statusCode: 503, message: 'service unavailable' })).toBe(true)
  })

  it('detects HTTP 429', () => {
    expect(isQuotaError({ code: 429 })).toBe(true)
  })

  it('detects quota keyword in message', () => {
    expect(isQuotaError({ message: 'Request quota exceeded for today' })).toBe(true)
  })

  it('detects rate limit keyword', () => {
    expect(isQuotaError({ message: 'rate limit reached' })).toBe(true)
  })

  it('detects exhausted keyword', () => {
    expect(isQuotaError({ message: 'resource exhausted' })).toBe(true)
  })

  it('returns false for normal errors', () => {
    expect(isQuotaError({ message: 'network timeout' })).toBe(false)
  })

  it('returns false for null/undefined', () => {
    expect(isQuotaError(null)).toBe(false)
    expect(isQuotaError(undefined)).toBe(false)
  })
})

describe('handleEmasError', () => {
  it('throws quota error with friendly message', () => {
    expect(() => handleEmasError({ code: 'PrePayResourceExhausted' }, '查询'))
      .toThrow('云服务请求额度已用完')
  })

  it('re-throws non-quota errors', () => {
    const err = new Error('connection refused')
    expect(() => handleEmasError(err, '操作')).toThrow('connection refused')
  })
})
