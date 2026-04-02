/**
 * 获取用户所有活跃打卡项目 + 今日打卡状态
 */
import { db, COLLECTIONS, dbCmd } from '@/cloud-emas/database/database'
import { requireAccountId } from '@/utils/auth'
import { formatDate } from '@/utils/date'

export async function getProjectList() {
  try {
    const accountId = await requireAccountId()
    const today = formatDate(new Date())

    const projectRes = await db.collection(COLLECTIONS.PROJECTS)
      .where({ accountId, archived: false })
      .orderBy('sortOrder', 'asc')
      .orderBy('createTime', 'desc')
      .get()
    const projects = projectRes.data || []
    if (projects.length === 0) {
      return { success: true, list: [], todayRecords: [] }
    }

    const projectIds = projects.map(p => p._id)
    const recordRes = await db.collection(COLLECTIONS.RECORDS)
      .where({ accountId, date: today, projectId: dbCmd.in(projectIds) })
      .get()
    const todayRecords = recordRes.data || []

    return { success: true, list: projects, todayRecords }
  } catch (error) {
    console.error('[API] getProjectList 失败:', error)
    return { success: false, list: [], todayRecords: [], error: error.message }
  }
}
