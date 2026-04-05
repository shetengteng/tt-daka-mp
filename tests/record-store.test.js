import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useRecordStore } from '@/stores/record'
import { useProjectStore } from '@/stores/project'
import { setAccountId, clearAccountId } from '@/utils/auth'

beforeEach(() => {
  globalThis.__clearMockStorage()
  clearAccountId()
  setActivePinia(createPinia())
})

describe('recordStore basic operations', () => {
  it('has empty todayRecords initially', () => {
    const store = useRecordStore()
    expect(store.todayRecords).toEqual([])
    expect(store.pendingCount).toBe(0)
  })

  it('setTodayRecords updates records', () => {
    const store = useRecordStore()
    store.setTodayRecords([
      { _id: 'r1', projectId: 'p1' },
      { _id: 'r2', projectId: 'p2' },
    ])
    expect(store.todayRecords).toHaveLength(2)
  })

  it('addTodayRecord appends a record', () => {
    const store = useRecordStore()
    store.addTodayRecord({ _id: 'r1', projectId: 'p1' })
    store.addTodayRecord({ _id: 'r2', projectId: 'p2' })
    expect(store.todayRecords).toHaveLength(2)
  })

  it('removeTodayRecord filters by projectId', () => {
    const store = useRecordStore()
    store.setTodayRecords([
      { _id: 'r1', projectId: 'p1' },
      { _id: 'r2', projectId: 'p2' },
    ])
    store.removeTodayRecord('p1')
    expect(store.todayRecords).toHaveLength(1)
    expect(store.todayRecords[0].projectId).toBe('p2')
  })

  it('clear resets everything', () => {
    const store = useRecordStore()
    store.setTodayRecords([{ _id: 'r1', projectId: 'p1' }])
    store.pendingCount = 5
    store.clear()
    expect(store.todayRecords).toEqual([])
    expect(store.pendingCount).toBe(0)
    expect(store.isCacheValid()).toBe(false)
  })
})

describe('recordStore todayProgress', () => {
  it('returns 0 when no active projects', () => {
    const store = useRecordStore()
    expect(store.todayProgress.done).toBe(0)
    expect(store.todayProgress.total).toBe(0)
    expect(store.todayProgress.percent).toBe(0)
  })

  it('calculates progress based on active projects', () => {
    const projectStore = useProjectStore()
    projectStore.setList([
      { _id: 'p1', sortOrder: 1, archived: false },
      { _id: 'p2', sortOrder: 2, archived: false },
      { _id: 'p3', sortOrder: 3, archived: true },
    ])

    const store = useRecordStore()
    store.setTodayRecords([{ _id: 'r1', projectId: 'p1' }])

    expect(store.todayProgress.done).toBe(1)
    expect(store.todayProgress.total).toBe(2)
    expect(store.todayProgress.percent).toBe(50)
  })

  it('returns 100% when all done', () => {
    const projectStore = useProjectStore()
    projectStore.setList([
      { _id: 'p1', sortOrder: 1, archived: false },
    ])

    const store = useRecordStore()
    store.setTodayRecords([{ _id: 'r1', projectId: 'p1' }])

    expect(store.todayProgress.percent).toBe(100)
  })
})

describe('recordStore cache validity', () => {
  it('isCacheValid false initially', () => {
    const store = useRecordStore()
    expect(store.isCacheValid()).toBe(false)
  })

  it('markFresh makes cache valid', () => {
    const store = useRecordStore()
    store.markFresh()
    expect(store.isCacheValid()).toBe(true)
  })

  it('markDirty invalidates cache', () => {
    const store = useRecordStore()
    store.markFresh()
    store.markDirty()
    expect(store.isCacheValid()).toBe(false)
  })
})

describe('recordStore persist / restore', () => {
  it('round-trip with accountId', () => {
    setAccountId('test_user')

    const pinia1 = createPinia()
    setActivePinia(pinia1)
    const store1 = useRecordStore()
    store1.setTodayRecords([{ _id: 'r1', projectId: 'p1' }])

    const pinia2 = createPinia()
    setActivePinia(pinia2)
    const store2 = useRecordStore()
    store2.restore()
    expect(store2.todayRecords).toHaveLength(1)
    expect(store2.todayRecords[0].projectId).toBe('p1')
  })
})
