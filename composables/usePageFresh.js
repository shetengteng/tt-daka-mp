/**
 * 页面数据新鲜度检查 composable
 *
 * 每个页面通过唯一 key 在 localStorage 中存储自己上次加载时的 dataTs。
 * onShow 时对比 projectStore.dataTs，时间戳不同则需要重新加载。
 * 超过 TTL 还会额外查询云端版本号（防止其他设备修改数据）。
 *
 * 用法：
 *   const { needRefresh, forceCheck, markLoaded } = usePageFresh('home')
 *   onShow(async () => {
 *     if (await needRefresh()) { await loadData(); markLoaded() }
 *   })
 *   onPullDownRefresh(async () => {
 *     if (await forceCheck()) { await loadData(); markLoaded() }
 *     else { uni.showToast({ title: '已是最新', icon: 'none' }) }
 *     uni.stopPullDownRefresh()
 *   })
 */
import { useProjectStore } from '@/stores/project'
import { getAccountId } from '@/utils/auth'
import { checkDataVersion, updateLocalVersion } from '@/utils/version-check'

const CACHE_TTL = 5 * 60 * 1000
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

/**
 * 查云端 dataVersion 判断是否有更新
 * @param {boolean} force - true 时跳过 TTL 限制（下拉刷新用）
 */
async function _checkCloud(force = false) {
  const projectStore = useProjectStore()
  if (!force && Date.now() - projectStore.lastFetchTime < CACHE_TTL) return false
  const accountId = getAccountId()
  if (!accountId) return true
  const { needRefresh: need, version } = await checkDataVersion(accountId)
  if (need) {
    updateLocalVersion(accountId, version)
    return true
  }
  projectStore.lastFetchTime = Date.now()
  return false
}

export function usePageFresh(pageKey) {
  const projectStore = useProjectStore()

  /**
   * onShow 用：先对比本地 dataTs，再走 TTL 云端版本检查
   */
  async function needRefresh() {
    const pageTs = _getPageTs(pageKey)
    if (projectStore.isStale(pageTs)) return true
    return await _checkCloud()
  }

  /**
   * 下拉刷新用：先对比本地 dataTs，再强制查云端版本（跳过 TTL）
   */
  async function forceCheck() {
    const pageTs = _getPageTs(pageKey)
    if (projectStore.isStale(pageTs)) return true
    return await _checkCloud(true)
  }

  /** 加载数据成功后调用，将当前 dataTs 写入 localStorage */
  function markLoaded() {
    _setPageTs(pageKey, projectStore.dataTs)
  }

  return { needRefresh, forceCheck, markLoaded }
}
