import { describe, it, expect } from 'vitest'
import { mergeOps } from '@/utils/sync-manager'

const RECORDS = 'dk-records'

describe('mergeOps', () => {
  it('cancels add + remove for same projectId + date', () => {
    const ops = [
      { op: 'add', collection: RECORDS, data: { projectId: 'p1', date: '2026-04-05' } },
      { op: 'remove', collection: RECORDS, where: { projectId: 'p1', date: '2026-04-05' } },
    ]
    const result = mergeOps(ops)
    expect(result).toHaveLength(0)
  })

  it('cancels remove + add for same projectId + date (reverse order)', () => {
    const ops = [
      { op: 'remove', collection: RECORDS, where: { projectId: 'p1', date: '2026-04-05' } },
      { op: 'add', collection: RECORDS, data: { projectId: 'p1', date: '2026-04-05' } },
    ]
    const result = mergeOps(ops)
    expect(result).toHaveLength(0)
  })

  it('keeps non-cancelling operations', () => {
    const ops = [
      { op: 'add', collection: RECORDS, data: { projectId: 'p1', date: '2026-04-05' } },
      { op: 'add', collection: RECORDS, data: { projectId: 'p2', date: '2026-04-05' } },
    ]
    const result = mergeOps(ops)
    expect(result).toHaveLength(2)
  })

  it('handles different dates as separate', () => {
    const ops = [
      { op: 'add', collection: RECORDS, data: { projectId: 'p1', date: '2026-04-05' } },
      { op: 'remove', collection: RECORDS, where: { projectId: 'p1', date: '2026-04-04' } },
    ]
    const result = mergeOps(ops)
    expect(result).toHaveLength(2)
  })

  it('only cancels one pair when multiple adds exist', () => {
    const ops = [
      { op: 'add', collection: RECORDS, data: { projectId: 'p1', date: '2026-04-05' } },
      { op: 'add', collection: RECORDS, data: { projectId: 'p1', date: '2026-04-05' } },
      { op: 'remove', collection: RECORDS, where: { projectId: 'p1', date: '2026-04-05' } },
    ]
    const result = mergeOps(ops)
    expect(result).toHaveLength(1)
    expect(result[0].op).toBe('add')
  })

  it('ignores non-RECORDS collections', () => {
    const ops = [
      { op: 'add', collection: 'dk-projects', data: { name: 'test' } },
      { op: 'remove', collection: 'dk-projects', where: { name: 'test' } },
    ]
    const result = mergeOps(ops)
    expect(result).toHaveLength(2)
  })

  it('handles empty array', () => {
    expect(mergeOps([])).toHaveLength(0)
  })
})
