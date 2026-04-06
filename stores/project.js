import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getAccountId } from '@/utils/auth'
import { setLocal, getLocal, getStoreKey } from '@/utils/local-store'
import { getActiveProjects } from '@/api/project/getActiveProjects'
import { getProjectList as fetchProjectListApi } from '@/api/project/getProjectList'
import { createProject as createProjectApi } from '@/api/project/createProject'
import { updateProject as updateProjectApi } from '@/api/project/updateProject'
import { deleteProject as deleteProjectApi } from '@/api/project/deleteProject'
import { archiveProject as archiveProjectApi } from '@/api/project/archiveProject'
import { batchUpdateSort as batchUpdateSortApi } from '@/api/project/batchUpdateSort'

const CACHE_KEY = 'cache_projects'

export const useProjectStore = defineStore('project', () => {
  const list = ref([])

  /**
   * 全局数据时间戳：每次数据变更（打卡/增删项目/拉取新数据）时更新
   * 各页面对比自己记录的时间戳与此值，不同则需要重新加载
   */
  const dataTs = ref(0)

  /** 最后一次从 API 获取数据的时间戳，供 usePageFresh 做 TTL 判断 */
  const lastFetchTime = ref(0)

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

  /**
   * 标记数据已变更：更新 dataTs 时间戳
   * 调用场景：打卡、新增/编辑项目等本地操作后
   * 其他页面 onShow 时发现 dataTs 变了就会重新加载
   */
  function markDirty() {
    dataTs.value = Date.now()
  }

  /**
   * 标记数据为最新：更新 dataTs + 刷新 TTL 计时器 + 持久化
   * 调用场景：从 API 拉取数据成功后
   */
  function markFresh() {
    dataTs.value = Date.now()
    lastFetchTime.value = Date.now()
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
    lastFetchTime.value = 0
    dataTs.value = 0
  }

  // ─── 版本检查 ───

  /**
   * 页面判断是否需要重新加载数据
   * @param {number} pageTs - 页面上次加载时记录的 dataTs
   * @returns {boolean} true = 数据有变更，需要重新加载
   */
  function isStale(pageTs) {
    return pageTs !== dataTs.value
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
    list, activeList, dataTs,
    restore, persist, markDirty, markFresh,
    setList, clear, isStale, lastFetchTime,
    fetchActiveProjects, fetchProjectList,
    addProject, editProject, removeProject, archive, updateSort,
  }
})
