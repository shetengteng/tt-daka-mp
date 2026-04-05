import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

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

  return { data, activeCount, archivedCount, setStats, setMineCounts, isLoaded, clear }
})
