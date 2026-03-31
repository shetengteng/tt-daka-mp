/**
 * 按月查询所有项目打卡记录
 */
import { db, COLLECTIONS } from '@/cloud-emas/database/database'
import { checkEmasError } from '@/cloud-emas/database/error'
import { requireAccountId } from '@/utils/auth'
import { getDateRange } from '@/utils/date'

/**
 * @param {string} monthDate - 月份基准日期 (YYYY-MM-DD)
 * @returns {{ success: boolean, list: Array, projects: Array }}
 */
export async function getRecordsByMonth(monthDate) {
  try {
    const accountId = await requireAccountId()
    const { startDate, endDate } = getDateRange(monthDate, 'month')
    
    const recordRes = await db.collection(COLLECTIONS.RECORDS)
      .find({ accountId, date: { $gte: startDate, $lte: endDate } })
      .sort({ date: 1, completedAt: 1 })
      .exec()
    checkEmasError(recordRes, '查询月度打卡记录')
    
    const projectRes = await db.collection(COLLECTIONS.PROJECTS)
      .find({ accountId })
      .exec()
    checkEmasError(projectRes, '查询项目列表')
    
    return {
      success: true,
      list: recordRes.result || [],
      projects: projectRes.result || [],
    }
  } catch (error) {
    console.error('[API] getRecordsByMonth 失败:', error)
    return { success: false, list: [], projects: [], error: error.message }
  }
}
