/**
 * 打卡数据 Store
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useDakaStore = defineStore('daka', () => {
  const projects = ref([])
  const todayRecords = ref([])
  const loading = ref(false)
  
  const activeProjects = computed(() => 
    projects.value.filter(p => !p.archived).sort((a, b) => a.sortOrder - b.sortOrder)
  )
  
  const todayProgress = computed(() => {
    const total = activeProjects.value.length
    if (total === 0) return { done: 0, total: 0, percent: 0 }
    const done = todayRecords.value.length
    return { done, total, percent: Math.round((done / total) * 100) }
  })
  
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
  
  return {
    projects,
    todayRecords,
    loading,
    activeProjects,
    todayProgress,
    setProjects,
    setTodayRecords,
    addTodayRecord,
    removeTodayRecord,
  }
})
