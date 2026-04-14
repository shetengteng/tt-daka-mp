/**
 * 按月查询所有项目打卡记录
 */
import { db, COLLECTIONS, dbCmd } from '@/api/emas'
import { requireAccountId } from '@/utils/auth'
import { getDateRange } from '@/utils/date'
import { setLocal, getLocal, getStoreKey } from '@/utils/local-store'

/**
 * @param {string} monthDate - 月份基准日期 (YYYY-MM-DD)
 * @returns {{ success: boolean, list: Array, projects: Array }}
 */
export async function getRecordsByMonth(monthDate) {
  try {
    const accountId = await requireAccountId()
    const { startDate, endDate } = getDateRange(monthDate, 'month')

    const [recordRes, projectRes] = await Promise.all([
      db.collection(COLLECTIONS.RECORDS)
        .where({ accountId, date: { $gte: startDate, $lte: endDate } })
        .orderBy('date', 'asc')
        .orderBy('completedAt', 'asc')
        .get(),
      db.collection(COLLECTIONS.PROJECTS)
        .where({ accountId })
        .get(),
    ])

    const result = {
      success: true,
      list: recordRes.data || [],
      projects: projectRes.data || [],
    }

    const month = monthDate.slice(0, 7)
    setLocal(getStoreKey(accountId, 'cache', `month_${month}`), result)

    return result
  } catch (error) {
    console.error('[API] getRecordsByMonth 失败:', error)

    const accountId = await requireAccountId().catch(() => '')
    if (accountId) {
      const month = monthDate.slice(0, 7)
      const cached = getLocal(getStoreKey(accountId, 'cache', `month_${month}`))
      if (cached?.data) {
        return { ...cached.data, fromCache: true }
      }
    }

    return { success: false, list: [], projects: [], error: error.message }
  }
}
