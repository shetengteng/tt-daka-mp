import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useProjectStore } from '@/stores/project'
import { setAccountId, clearAccountId } from '@/utils/auth'

beforeEach(() => {
  globalThis.__clearMockStorage()
  clearAccountId()
  setActivePinia(createPinia())
})

describe('projectStore basic operations', () => {
  it('has empty list initially', () => {
    const store = useProjectStore()
    expect(store.list).toEqual([])
    expect(store.activeList).toEqual([])
  })

  it('setList updates list', () => {
    const store = useProjectStore()
    store.setList([{ _id: 'p1', name: 'A' }, { _id: 'p2', name: 'B' }])
    expect(store.list).toHaveLength(2)
  })

  it('activeList filters archived and sorts by sortOrder', () => {
    const store = useProjectStore()
    store.setList([
      { _id: 'p1', name: 'C', sortOrder: 3, archived: false },
      { _id: 'p2', name: 'B', sortOrder: 1, archived: false },
      { _id: 'p3', name: 'A', sortOrder: 2, archived: true },
    ])
    expect(store.activeList).toHaveLength(2)
    expect(store.activeList[0]._id).toBe('p2')
    expect(store.activeList[1]._id).toBe('p1')
  })

  it('clear resets list and marks dirty', () => {
    const store = useProjectStore()
    store.setList([{ _id: 'p1' }])
    store.markFresh()
    store.clear()
    expect(store.list).toEqual([])
    expect(store.isCacheValid()).toBe(false)
  })
})

describe('projectStore cache validity', () => {
  it('isCacheValid returns false initially', () => {
    const store = useProjectStore()
    expect(store.isCacheValid()).toBe(false)
  })

  it('isCacheValid returns true after markFresh with data', () => {
    const store = useProjectStore()
    store.setList([{ _id: 'p1' }])
    store.markFresh()
    expect(store.isCacheValid()).toBe(true)
  })

  it('markDirty invalidates cache', () => {
    const store = useProjectStore()
    store.setList([{ _id: 'p1' }])
    store.markFresh()
    store.markDirty()
    expect(store.isCacheValid()).toBe(false)
  })

  it('isCacheValid returns false when list is empty', () => {
    const store = useProjectStore()
    store.markFresh()
    expect(store.isCacheValid()).toBe(false)
  })
})

describe('projectStore persist / restore', () => {
  it('persist and restore round-trip', () => {
    setAccountId('test_user')

    const pinia1 = createPinia()
    setActivePinia(pinia1)
    const store1 = useProjectStore()
    store1.setList([{ _id: 'p1', name: 'TestProject' }])

    const pinia2 = createPinia()
    setActivePinia(pinia2)
    const store2 = useProjectStore()
    expect(store2.list).toEqual([])
    store2.restore()
    expect(store2.list).toHaveLength(1)
    expect(store2.list[0].name).toBe('TestProject')
  })

  it('restore does nothing without accountId', () => {
    const store = useProjectStore()
    store.restore()
    expect(store.list).toEqual([])
  })
})
