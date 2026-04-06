import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getAccountId } from '@/utils/auth'
import { formatDate } from '@/utils/date'
import { setLocal, getLocal, getStoreKey } from '@/utils/local-store'
import { useProjectStore } from './project'
import { toggleDaka as toggleDakaApi } from '@/api/record/toggleDaka'
import { getRecordsByMonth as getRecordsByMonthApi } from '@/api/record/getRecordsByMonth'
import { retroactiveDaka as retroactiveDakaApi } from '@/api/record/retroactiveDaka'

const CACHE_TTL = 5 * 60 * 1000

export const useRecordStore = defineStore('record', () => {
  const todayRecords = ref([])
  const pendingCount = ref(0)
  const isOffline = ref(false)

  let _lastFetchTime = 0
  const _dirty = ref(false)

  const todayProgress = computed(() => {
    const projectStore = useProjectStore()
    const total = projectStore.activeList.length
    if (total === 0) return { done: 0, total: 0, percent: 0 }
    const done = todayRecords.value.length
    return { done, total, percent: Math.round((done / total) * 100) }
  })

  function _todayCacheKey() {
    const accountId = getAccountId()
    const today = formatDate(new Date())
    return accountId ? getStoreKey(accountId, 'cache', `today_${today}`) : null
  }

  function restore() {
    const key = _todayCacheKey()
    if (!key) return
    const entry = getLocal(key)
    if (entry?.data) {
      todayRecords.value = entry.data
    }

    const accountId = getAccountId()
    if (accountId) {
      const ops = getLocal(getStoreKey(accountId, 'pending', 'ops'))
      pendingCount.value = ops?.data?.length || 0
    }
  }

  function persist() {
    const key = _todayCacheKey()
    if (!key) return
    setLocal(key, todayRecords.value)
  }

  function isCacheValid() {
    return !_dirty.value && Date.now() - _lastFetchTime < CACHE_TTL
  }

  function markDirty() { _dirty.value = true }

  function markFresh() {
    _dirty.value = false
    _lastFetchTime = Date.now()
    persist()
  }

  function setTodayRecords(list) {
    todayRecords.value = list
    persist()
  }

  function addTodayRecord(record) {
    todayRecords.value.push(record)
    persist()
  }

  function removeTodayRecord(projectId) {
    todayRecords.value = todayRecords.value.filter(r => r.projectId !== projectId)
    persist()
  }

  function clear() {
    todayRecords.value = []
    _lastFetchTime = 0
    _dirty.value = true
    pendingCount.value = 0
  }

  async function toggle(projectId, currentChecked) {
    return await toggleDakaApi(projectId, currentChecked)
  }

  async function fetchMonthRecords(monthDate) {
    return await getRecordsByMonthApi(monthDate)
  }

  async function retroactive(projectId, date) {
    return await retroactiveDakaApi(projectId, date)
  }

  return {
    todayRecords, pendingCount, isOffline, todayProgress,
    restore, persist, isCacheValid, markDirty, markFresh,
    setTodayRecords, addTodayRecord, removeTodayRecord, clear,
    toggle, fetchMonthRecords, retroactive,
  }
})
