import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getAccountId } from '@/utils/auth'
import { setLocal, getLocal, getStoreKey } from '@/utils/local-store'

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

  return {
    list, loading, activeList,
    restore, persist, isCacheValid, markDirty, markFresh,
    setList, clear,
  }
})
