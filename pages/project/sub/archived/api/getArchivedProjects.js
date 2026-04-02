/**
 * 获取已归档项目列表
 */
import { db, COLLECTIONS } from '@/cloud-emas/database/database'
import { requireAccountId } from '@/utils/auth'

export async function getArchivedProjects() {
  try {
    const accountId = await requireAccountId()
    const res = await db.collection(COLLECTIONS.PROJECTS)
      .where({ accountId, archived: true })
      .orderBy('updateTime', 'desc')
      .get()
    return { success: true, list: res?.data || [] }
  } catch (error) {
    console.error('[API] getArchivedProjects 失败:', error)
    return { success: false, list: [], error: error.message }
  }
}
