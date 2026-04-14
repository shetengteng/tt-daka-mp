/**
 * 数据版本号检查
 * 使用时间戳作为乐观锁，cloudVersion > localVersion 则需刷新
 */

import { db, COLLECTIONS } from '@/api/emas'
import { getLocal, setLocal, getStoreKey } from './local-store'

export async function checkDataVersion(accountId) {
  const versionKey = getStoreKey(accountId, 'meta', 'dataVersion')
  const localVersion = getLocal(versionKey)?.data || 0

  try {
    const res = await db.collection(COLLECTIONS.USERS)
      .where({ accountId })
      .field({ dataVersion: 1 })
      .get()
    const user = (res.data || [])[0]
    const cloudVersion = user?.dataVersion || 0

    if (cloudVersion <= localVersion && localVersion > 0) {
      return { needRefresh: false, version: localVersion }
    }

    return { needRefresh: true, version: cloudVersion }
  } catch (e) {
    return { needRefresh: false, version: localVersion }
  }
}

export function updateLocalVersion(accountId, version) {
  const versionKey = getStoreKey(accountId, 'meta', 'dataVersion')
  setLocal(versionKey, version)
}

export async function touchCloudVersion(accountId) {
  try {
    const now = Date.now()
    await db.collection(COLLECTIONS.USERS)
      .where({ accountId })
      .update({ dataVersion: now })
    updateLocalVersion(accountId, now)
    return now
  } catch (e) {
    // 版本号更新失败不影响主流程
  }
}
