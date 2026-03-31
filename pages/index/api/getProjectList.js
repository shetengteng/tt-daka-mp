/**
 * 获取用户所有活跃打卡项目 + 今日打卡状态
 */
import { db, COLLECTIONS } from '@/cloud-emas/database/database'
import { checkEmasError } from '@/cloud-emas/database/error'
import { requireAccountId } from '@/utils/auth'
import { formatDate } from '@/utils/date'

export async function getProjectList() {
  try {
    const accountId = await requireAccountId()
    const today = formatDate(new Date())
    
    const projectRes = await db.collection(COLLECTIONS.PROJECTS)
      .find({ accountId, archived: false })
      .sort({ sortOrder: 1, createTime: -1 })
      .exec()
    checkEmasError(projectRes, '查询项目列表')
    
    const projects = projectRes.result || []
    if (projects.length === 0) {
      return { success: true, list: [], todayRecords: [] }
    }
    
    const projectIds = projects.map(p => p._id)
    const recordRes = await db.collection(COLLECTIONS.RECORDS)
      .find({ accountId, date: today, projectId: { $in: projectIds } })
      .exec()
    checkEmasError(recordRes, '查询今日打卡记录')
    
    const todayRecords = recordRes.result || []
    
    return { success: true, list: projects, todayRecords }
  } catch (error) {
    console.error('[API] getProjectList 失败:', error)
    return { success: false, list: [], todayRecords: [], error: error.message }
  }
}
