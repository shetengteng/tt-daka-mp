import { describe, it, expect } from 'vitest'
import { checkEmasError } from '@/api/emas'

describe('checkEmasError', () => {
  it('does nothing for valid result', () => {
    expect(() => checkEmasError({ data: [] })).not.toThrow()
  })

  it('throws for null result', () => {
    expect(() => checkEmasError(null, '查询')).toThrow('[EMAS] 查询返回空结果')
  })

  it('throws for undefined result', () => {
    expect(() => checkEmasError(undefined)).toThrow('返回空结果')
  })

  it('throws for result with error', () => {
    expect(() => checkEmasError({ error: { message: 'not found' } }, '操作'))
      .toThrow('[EMAS] 操作失败: not found')
  })

  it('throws with JSON for error without message', () => {
    expect(() => checkEmasError({ error: { code: 500 } }))
      .toThrow('500')
  })
})
