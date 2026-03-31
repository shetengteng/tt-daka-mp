/**
 * 获取单个项目详情 + 统计数据
 */
import { db, COLLECTIONS } from '@/cloud-emas/database/database'
import { checkEmasError } from '@/cloud-emas/database/error'
import { requireAccountId } from '@/utils/auth'
import { dayjs, formatDate } from '@/utils/date'

export async function getProjectDetail(id) {
  try {
    const accountId = await requireAccountId()
    
    const projectRes = await db.collection(COLLECTIONS.PROJECTS)
      .findOne({ _id: id, accountId })
    checkEmasError(projectRes, '查询项目详情')
    const project = projectRes.result
    if (!project) return { success: false, error: '项目不存在' }
    
    const recordRes = await db.collection(COLLECTIONS.RECORDS)
      .find({ accountId, projectId: id })
      .sort({ date: -1 })
      .exec()
    checkEmasError(recordRes, '查询项目记录')
    const records = recordRes.result || []
    
    const today = formatDate(new Date())
    const dateSet = new Set(records.map(r => r.date))
    const totalDays = dateSet.size
    
    let currentStreak = 0
    let longestStreak = 0
    let streak = 0
    let d = dayjs(today)
    
    for (let i = 0; i < 365; i++) {
      const dateStr = d.format('YYYY-MM-DD')
      if (dateSet.has(dateStr)) {
        streak++
        longestStreak = Math.max(longestStreak, streak)
        if (i <= currentStreak) currentStreak = streak
      } else if (i > 0) {
        streak = 0
      }
      d = d.subtract(1, 'day')
    }
    
    return {
      success: true,
      data: {
        project,
        records,
        totalDays,
        currentStreak,
        longestStreak,
      }
    }
  } catch (error) {
    console.error('[API] getProjectDetail 失败:', error)
    return { success: false, error: error.message }
  }
}
