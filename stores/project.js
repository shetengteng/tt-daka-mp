import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getAccountId } from '@/utils/auth'
import { setLocal, getLocal, getStoreKey } from '@/utils/local-store'
import { checkDataVersion, updateLocalVersion } from '@/utils/version-check'
import { getActiveProjects } from '@/api/project/getActiveProjects'
import { getProjectList as fetchProjectListApi } from '@/api/project/getProjectList'
import { createProject as createProjectApi } from '@/api/project/createProject'
import { updateProject as updateProjectApi } from '@/api/project/updateProject'
import { deleteProject as deleteProjectApi } from '@/api/project/deleteProject'
import { archiveProject as archiveProjectApi } from '@/api/project/archiveProject'
import { batchUpdateSort as batchUpdateSortApi } from '@/api/project/batchUpdateSort'

/**
 * 缓存 TTL：5 分钟内视为有效，不检查云端版本号
 * 超过 TTL 后会查询 dataVersion 决定是否需要重新拉取
 */
const CACHE_TTL = 5 * 60 * 1000
const CACHE_KEY = 'cache_projects'

export const useProjectStore = defineStore('project', () => {
  const list = ref([])
  const loading = ref(false)

  /** 最后一次从 API 获取数据的时间戳，用于 TTL 判断（不持久化，重启后为 0） */
  let _lastFetchTime = 0
  /** 标记数据已过期，强制跳过 TTL 检查 */
  const _dirty = ref(false)

  /** 未归档项目列表，按 sortOrder 排序 */
  const activeList = computed(() =>
    list.value.filter(p => !p.archived).sort((a, b) => a.sortOrder - b.sortOrder)
  )

  // ─── 缓存管理 ───

  /** 从 localStorage 恢复项目列表（App 启动时调用） */
  function restore() {
    const accountId = getAccountId()
    if (!accountId) return
    const entry = getLocal(getStoreKey(accountId, CACHE_KEY))
    if (entry?.data?.length > 0) {
      list.value = entry.data
    }
  }

  /** 将当前项目列表写入 localStorage */
  function persist() {
    const accountId = getAccountId()
    if (!accountId) return
    setLocal(getStoreKey(accountId, CACHE_KEY), list.value)
  }

  /** 判断内存缓存是否有效：未被标记过期 + 有数据 + 在 TTL 内 */
  function isCacheValid() {
    return !_dirty.value && list.value.length > 0 &&
           Date.now() - _lastFetchTime < CACHE_TTL
  }

  /** 标记缓存过期，下次 checkFresh 时会跳过 TTL 直接查云端版本号 */
  function markDirty() { _dirty.value = true }

  /** 标记缓存新鲜，重置 TTL 计时器并写入 localStorage */
  function markFresh() {
    _dirty.value = false
    _lastFetchTime = Date.now()
    persist()
  }

  /** 覆盖项目列表并持久化 */
  function setList(data) {
    list.value = data
    persist()
  }

  /** 清空所有状态（退出登录时调用） */
  function clear() {
    list.value = []
    _lastFetchTime = 0
    _dirty.value = true
  }

  // ─── 版本检查 ───

  /**
   * 检查是否需要从云端刷新数据，返回 true 表示需要拉取
   * 判断顺序：无数据→TTL→云端版本号
   *
   * 1. list 为空 → 返回 true（首次加载，必须拉取）
   * 2. TTL 内且未标记 dirty → 返回 false（直接用内存缓存）
   * 3. TTL 过期 → 查询云端 dataVersion:
   *    - 版本变化 → 更新本地版本号，返回 true
   *    - 版本一致 → markFresh() 延长 TTL，返回 false
   */
  async function checkFresh() {
    if (list.value.length === 0) return true
    if (isCacheValid()) return false
    const accountId = getAccountId()
    if (!accountId) return true
    const { needRefresh: need, version } = await checkDataVersion(accountId)
    if (need) {
      updateLocalVersion(accountId, version)
      return true
    }
    markFresh()
    return false
  }

  /**
   * 自动检查 + 拉取：checkFresh() 若为 true 则调 fetchActiveProjects()
   * 适用于只关心 project 数据的页面（如项目管理页）
   */
  async function ensureFresh() {
    const need = await checkFresh()
    if (need) await fetchActiveProjects()
  }

  // ─── API 封装 ───

  /** 拉取未归档项目列表，写入 list 并标记新鲜 */
  async function fetchActiveProjects() {
    const res = await getActiveProjects()
    if (res.success) {
      setList(res.list)
      markFresh()
    }
    return res
  }

  /** 拉取完整项目列表 + 今日打卡记录（首页用，API 内部会同步写入 recordStore） */
  async function fetchProjectList() {
    const res = await fetchProjectListApi()
    if (res.success) markFresh()
    return res
  }

  /** 创建项目，成功后标记 dirty（下次进入页面会检查版本并刷新） */
  async function addProject(data) {
    const res = await createProjectApi(data)
    if (res.success) markDirty()
    return res
  }

  /** 更新项目信息，成功后标记 dirty */
  async function editProject(id, data) {
    const res = await updateProjectApi(id, data)
    if (res.success) markDirty()
    return res
  }

  /** 删除项目，成功后从本地 list 中移除 */
  async function removeProject(id) {
    const res = await deleteProjectApi(id)
    if (res.success) {
      list.value = list.value.filter(p => p._id !== id)
      persist()
    }
    return res
  }

  /** 归档/取消归档项目，成功后更新本地 archived 状态 */
  async function archive(id, archived) {
    const res = await archiveProjectApi(id, archived)
    if (res.success) {
      const p = list.value.find(p => p._id === id)
      if (p) p.archived = archived
      persist()
    }
    return res
  }

  /** 批量更新排序，成功后同步本地 sortOrder */
  async function updateSort(items) {
    const res = await batchUpdateSortApi(items)
    if (res.success) {
      items.forEach(item => {
        const p = list.value.find(p => p._id === item._id)
        if (p) p.sortOrder = item.sortOrder
      })
      persist()
    }
    return res
  }

  return {
    list, loading, activeList,
    restore, persist, isCacheValid, markDirty, markFresh,
    setList, clear, checkFresh, ensureFresh,
    fetchActiveProjects, fetchProjectList,
    addProject, editProject, removeProject, archive, updateSort,
  }
})
