/**
 * 获取活跃打卡项目列表（项目管理页用）
 */
import { db, COLLECTIONS } from '@/api/emas'
import { requireAccountId } from '@/utils/auth'

export async function getActiveProjects() {
  try {
    const accountId = await requireAccountId()
    const [projectRes, recordRes] = await Promise.all([
      db.collection(COLLECTIONS.PROJECTS).where({ accountId, archived: false }).orderBy('sortOrder', 'asc').get(),
      db.collection(COLLECTIONS.RECORDS).where({ accountId }).get(),
    ])
    const projects = projectRes?.data || []
    if (projects.length === 0) return { success: true, list: [] }
    const records = recordRes?.data || []

    const countMap = {}
    for (const r of records) {
      if (!countMap[r.projectId]) countMap[r.projectId] = new Set()
      countMap[r.projectId].add(r.date)
    }

    const list = projects.map(p => ({
      ...p,
      totalDays: countMap[p._id]?.size || 0,
    }))

    return { success: true, list }
  } catch (error) {
    console.error('[API] getActiveProjects 失败:', error)
    return { success: false, list: [], error: error.message }
  }
}
