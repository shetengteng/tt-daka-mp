/**
 * 按月查询所有项目打卡记录
 */
import { db, COLLECTIONS, dbCmd } from '@/cloud-emas/database/database'
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
      .where({ accountId, date: { $gte: startDate, $lte: endDate } })
      .orderBy('date', 'asc')
      .orderBy('completedAt', 'asc')
      .get()

    const projectRes = await db.collection(COLLECTIONS.PROJECTS)
      .where({ accountId })
      .get()

    return {
      success: true,
      list: recordRes.data || [],
      projects: projectRes.data || [],
    }
  } catch (error) {
    console.error('[API] getRecordsByMonth 失败:', error)
    return { success: false, list: [], projects: [], error: error.message }
  }
}
