/**
 * 打卡数据 Store
 * 含缓存管理和 dirty 标记，避免 Tab 切换重复请求
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const CACHE_TTL = 5 * 60 * 1000

export const useDakaStore = defineStore('daka', () => {
  const projects = ref([])
  const todayRecords = ref([])
  const loading = ref(false)
  
  let _lastFetchTime = 0
  const _dirty = ref(false)
  
  const activeProjects = computed(() => 
    projects.value.filter(p => !p.archived).sort((a, b) => a.sortOrder - b.sortOrder)
  )
  
  const todayProgress = computed(() => {
    const total = activeProjects.value.length
    if (total === 0) return { done: 0, total: 0, percent: 0 }
    const done = todayRecords.value.length
    return { done, total, percent: Math.round((done / total) * 100) }
  })
  
  function isCacheValid() {
    return !_dirty.value && projects.value.length > 0 &&
           Date.now() - _lastFetchTime < CACHE_TTL
  }
  
  function markDirty() {
    _dirty.value = true
  }
  
  function markFresh() {
    _dirty.value = false
    _lastFetchTime = Date.now()
  }
  
  function setProjects(list) {
    projects.value = list
  }
  
  function setTodayRecords(list) {
    todayRecords.value = list
  }
  
  function addTodayRecord(record) {
    todayRecords.value.push(record)
  }
  
  function removeTodayRecord(projectId) {
    todayRecords.value = todayRecords.value.filter(r => r.projectId !== projectId)
  }
  
  function clear() {
    projects.value = []
    todayRecords.value = []
    _lastFetchTime = 0
    _dirty.value = true
  }
  
  return {
    projects,
    todayRecords,
    loading,
    activeProjects,
    todayProgress,
    isCacheValid,
    markDirty,
    markFresh,
    setProjects,
    setTodayRecords,
    addTodayRecord,
    removeTodayRecord,
    clear,
  }
})
