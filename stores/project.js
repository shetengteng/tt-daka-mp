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

const CACHE_TTL = 5 * 60 * 1000
const CACHE_KEY = 'cache_projects'

export const useProjectStore = defineStore('project', () => {
  const list = ref([])
  const loading = ref(false)

  let _lastFetchTime = 0
  const _dirty = ref(false)

  const activeList = computed(() =>
    list.value.filter(p => !p.archived).sort((a, b) => a.sortOrder - b.sortOrder)
  )

  function restore() {
    const accountId = getAccountId()
    if (!accountId) return
    const entry = getLocal(getStoreKey(accountId, CACHE_KEY))
    if (entry?.data?.length > 0) {
      list.value = entry.data
    }
  }

  function persist() {
    const accountId = getAccountId()
    if (!accountId) return
    setLocal(getStoreKey(accountId, CACHE_KEY), list.value)
  }

  function isCacheValid() {
    return !_dirty.value && list.value.length > 0 &&
           Date.now() - _lastFetchTime < CACHE_TTL
  }

  function markDirty() { _dirty.value = true }

  function markFresh() {
    _dirty.value = false
    _lastFetchTime = Date.now()
    persist()
  }

  function setList(data) {
    list.value = data
    persist()
  }

  function clear() {
    list.value = []
    _lastFetchTime = 0
    _dirty.value = true
  }

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

  async function ensureFresh() {
    const need = await checkFresh()
    if (need) await fetchActiveProjects()
  }

  async function fetchActiveProjects() {
    const res = await getActiveProjects()
    if (res.success) {
      setList(res.list)
      markFresh()
    }
    return res
  }

  async function fetchProjectList() {
    const res = await fetchProjectListApi()
    if (res.success) markFresh()
    return res
  }

  async function addProject(data) {
    const res = await createProjectApi(data)
    if (res.success) markDirty()
    return res
  }

  async function editProject(id, data) {
    const res = await updateProjectApi(id, data)
    if (res.success) markDirty()
    return res
  }

  async function removeProject(id) {
    const res = await deleteProjectApi(id)
    if (res.success) {
      list.value = list.value.filter(p => p._id !== id)
      persist()
    }
    return res
  }

  async function archive(id, archived) {
    const res = await archiveProjectApi(id, archived)
    if (res.success) {
      const p = list.value.find(p => p._id === id)
      if (p) p.archived = archived
      persist()
    }
    return res
  }

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
