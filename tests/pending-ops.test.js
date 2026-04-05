import { describe, it, expect, beforeEach } from 'vitest'
import {
  getPendingOps, addPendingOp, removePendingOp,
  savePendingOps, clearPendingOps, getPendingCount,
} from '@/utils/pending-ops'

const ACCOUNT = 'test_user'

beforeEach(() => { globalThis.__clearMockStorage() })

describe('addPendingOp', () => {
  it('adds operation with auto-generated id and metadata', () => {
    addPendingOp(ACCOUNT, { op: 'add', collection: 'dk-records', data: { projectId: 'p1' } })
    const ops = getPendingOps(ACCOUNT)
    expect(ops).toHaveLength(1)
    expect(ops[0].id).toMatch(/^op_/)
    expect(ops[0].retryCount).toBe(0)
    expect(ops[0].op).toBe('add')
  })

  it('accumulates multiple operations', () => {
    addPendingOp(ACCOUNT, { op: 'add', data: { projectId: 'p1' } })
    addPendingOp(ACCOUNT, { op: 'remove', where: { projectId: 'p2' } })
    expect(getPendingCount(ACCOUNT)).toBe(2)
  })
})

describe('removePendingOp', () => {
  it('removes specific operation by id', () => {
    addPendingOp(ACCOUNT, { op: 'add', data: { projectId: 'p1' } })
    addPendingOp(ACCOUNT, { op: 'add', data: { projectId: 'p2' } })
    const ops = getPendingOps(ACCOUNT)
    removePendingOp(ACCOUNT, ops[0].id)
    expect(getPendingCount(ACCOUNT)).toBe(1)
    expect(getPendingOps(ACCOUNT)[0].data.projectId).toBe('p2')
  })
})

describe('savePendingOps', () => {
  it('overwrites all operations', () => {
    addPendingOp(ACCOUNT, { op: 'add', data: {} })
    addPendingOp(ACCOUNT, { op: 'add', data: {} })
    savePendingOps(ACCOUNT, [{ id: 'custom_1', op: 'update' }])
    const ops = getPendingOps(ACCOUNT)
    expect(ops).toHaveLength(1)
    expect(ops[0].id).toBe('custom_1')
  })
})

describe('clearPendingOps', () => {
  it('clears all operations', () => {
    addPendingOp(ACCOUNT, { op: 'add', data: {} })
    addPendingOp(ACCOUNT, { op: 'add', data: {} })
    clearPendingOps(ACCOUNT)
    expect(getPendingCount(ACCOUNT)).toBe(0)
  })
})

describe('getPendingCount', () => {
  it('returns 0 for empty account', () => {
    expect(getPendingCount('no_user')).toBe(0)
  })
})
