import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useUserStore } from '@/stores/user'
import { useStatsStore } from '@/stores/stats'

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('userStore', () => {
  it('has default values', () => {
    const store = useUserStore()
    expect(store.nickname).toBe('微信用户')
    expect(store.avatar).toBe('')
    expect(store.totalDays).toBe(0)
  })

  it('setUser updates fields', () => {
    const store = useUserStore()
    store.setUser({ nickname: 'Test', avatar: 'data:image/png;base64,...', totalDays: 42 })
    expect(store.nickname).toBe('Test')
    expect(store.avatar).toBe('data:image/png;base64,...')
    expect(store.totalDays).toBe(42)
  })

  it('setUser partial update keeps other fields', () => {
    const store = useUserStore()
    store.setUser({ nickname: 'A' })
    store.setUser({ totalDays: 10 })
    expect(store.nickname).toBe('A')
    expect(store.totalDays).toBe(10)
  })

  it('isLoaded returns false initially', () => {
    const store = useUserStore()
    expect(store.isLoaded()).toBe(false)
  })

  it('isLoaded returns true after setUser', () => {
    const store = useUserStore()
    store.setUser({ nickname: 'X' })
    expect(store.isLoaded()).toBe(true)
  })

  it('clear resets all fields', () => {
    const store = useUserStore()
    store.setUser({ nickname: 'Test', avatar: 'img', totalDays: 99 })
    store.clear()
    expect(store.nickname).toBe('微信用户')
    expect(store.avatar).toBe('')
    expect(store.totalDays).toBe(0)
    expect(store.isLoaded()).toBe(false)
  })
})

describe('statsStore', () => {
  it('has default values', () => {
    const store = useStatsStore()
    expect(store.data.totalDays).toBe(0)
    expect(store.data.weekData).toEqual([])
    expect(store.data.projectStats).toEqual([])
    expect(store.activeCount).toBe(0)
  })

  it('setStats updates data', () => {
    const store = useStatsStore()
    store.setStats({
      totalDays: 50,
      currentStreak: 7,
      longestStreak: 15,
      weekData: [{ date: '2026-04-05', percent: 100 }],
      projectStats: [{ project: { _id: 'p1' } }],
    })
    expect(store.data.totalDays).toBe(50)
    expect(store.data.currentStreak).toBe(7)
    expect(store.data.weekData).toHaveLength(1)
    expect(store.data.projectStats).toHaveLength(1)
  })

  it('setMineCounts updates counts', () => {
    const store = useStatsStore()
    store.setMineCounts({ active: 5, archived: 2, totalDays: 30 })
    expect(store.activeCount).toBe(5)
    expect(store.archivedCount).toBe(2)
    expect(store.data.totalDays).toBe(30)
  })

  it('isLoaded returns true after setStats', () => {
    const store = useStatsStore()
    expect(store.isLoaded()).toBe(false)
    store.setStats({ totalDays: 1 })
    expect(store.isLoaded()).toBe(true)
  })

  it('clear resets everything', () => {
    const store = useStatsStore()
    store.setStats({ totalDays: 10, currentStreak: 5 })
    store.setMineCounts({ active: 3, archived: 1 })
    store.clear()
    expect(store.data.totalDays).toBe(0)
    expect(store.data.currentStreak).toBe(0)
    expect(store.activeCount).toBe(0)
    expect(store.isLoaded()).toBe(false)
  })
})
