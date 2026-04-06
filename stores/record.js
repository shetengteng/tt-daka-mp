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
  /** 今日打卡记录列表，Local-First 架构下由 toggleDaka 直接写入 */
  const todayRecords = ref([])
  /** 待同步操作计数，由 sync-manager 在同步完成后更新 */
  const pendingCount = ref(0)
  const isOffline = ref(false)

  let _lastFetchTime = 0
  const _dirty = ref(false)

  /** 今日打卡进度：已完成数 / 活跃项目总数 */
  const todayProgress = computed(() => {
    const projectStore = useProjectStore()
    const total = projectStore.activeList.length
    if (total === 0) return { done: 0, total: 0, percent: 0 }
    const done = todayRecords.value.length
    return { done, total, percent: Math.round((done / total) * 100) }
  })

  /** 生成今日打卡记录的 localStorage key（按日期区分） */
  function _todayCacheKey() {
    const accountId = getAccountId()
    const today = formatDate(new Date())
    return accountId ? getStoreKey(accountId, 'cache', `today_${today}`) : null
  }

  // ─── 缓存管理 ───

  /** 从 localStorage 恢复今日打卡记录和待同步计数（App 启动时调用） */
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

  // ─── 本地操作（由 toggleDaka API 内部调用） ───

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

  // ─── API 封装 ───

  /**
   * 打卡/取消打卡（Local-First）
   * 先写入本地 Store + pending 队列，UI 立即响应，云端 30s 后异步同步
   * @param {boolean} currentChecked - true=当前已打卡(执行取消), false=未打卡(执行打卡)
   */
  async function toggle(projectId, currentChecked) {
    return await toggleDakaApi(projectId, currentChecked)
  }

  /** 按月查询打卡记录 + 项目列表（日历页用） */
  async function fetchMonthRecords(monthDate) {
    return await getRecordsByMonthApi(monthDate)
  }

  /** 补打卡（限最近 7 天，直接写入云端，非 Local-First） */
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
