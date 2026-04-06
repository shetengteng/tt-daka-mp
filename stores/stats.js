import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { getStats } from '@/api/stats/getStats'

export const useStatsStore = defineStore('stats', () => {
  const data = reactive({
    totalDays: 0,
    currentStreak: 0,
    longestStreak: 0,
    weekData: [],
    projectStats: [],
  })

  const activeCount = ref(0)
  const archivedCount = ref(0)
  let _loaded = false

  /** 从云端拉取统计数据并写入 store */
  async function fetchStats() {
    const res = await getStats()
    if (res.success) {
      Object.assign(data, res.data)
      _loaded = true
    }
    return res
  }

  function setStats(statsData) {
    Object.assign(data, statsData)
    _loaded = true
  }

  function setMineCounts({ active, archived, totalDays }) {
    activeCount.value = active
    archivedCount.value = archived
    if (totalDays !== undefined) data.totalDays = totalDays
  }

  function isLoaded() { return _loaded }

  function clear() {
    Object.assign(data, { totalDays: 0, currentStreak: 0, longestStreak: 0, weekData: [], projectStats: [] })
    activeCount.value = 0
    archivedCount.value = 0
    _loaded = false
  }

  return { data, activeCount, archivedCount, fetchStats, setStats, setMineCounts, isLoaded, clear }
})
