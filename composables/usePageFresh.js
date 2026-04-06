/**
 * 页面数据新鲜度检查 composable
 *
 * 每个页面通过唯一 key 在 localStorage 中存储自己上次加载时的 dataTs。
 * onShow 时对比 projectStore.dataTs，时间戳不同则需要重新加载。
 * 超过 TTL 还会额外查询云端版本号（防止其他设备修改数据）。
 *
 * 用法：
 *   const { needRefresh, markLoaded } = usePageFresh('home')
 *   onShow(async () => {
 *     if (await needRefresh()) {
 *       await loadData()
 *       markLoaded()
 *     }
 *   })
 */
import { useProjectStore } from '@/stores/project'

const TS_PREFIX = 'dk_pageTs_'

function _getPageTs(key) {
  try {
    return Number(uni.getStorageSync(TS_PREFIX + key)) || 0
  } catch (_) {
    return 0
  }
}

function _setPageTs(key, ts) {
  try {
    uni.setStorageSync(TS_PREFIX + key, String(ts))
  } catch (_) {}
}

export function usePageFresh(pageKey) {
  const projectStore = useProjectStore()

  /**
   * 是否需要重新加载数据
   * 1. 页面时间戳与全局 dataTs 不同 → true（本地有变更）
   * 2. 时间戳相同但 TTL 过期 → 查云端版本号
   */
  async function needRefresh() {
    const pageTs = _getPageTs(pageKey)
    if (projectStore.isStale(pageTs)) return true
    return await projectStore.checkCloudVersion()
  }

  /** 加载数据成功后调用，将当前 dataTs 写入 localStorage */
  function markLoaded() {
    _setPageTs(pageKey, projectStore.dataTs)
  }

  return { needRefresh, markLoaded }
}
