/**
 * 补打卡（限最近7天）
 */
import { db, COLLECTIONS } from '@/cloud-emas/database/database'
import { requireAccountId } from '@/utils/auth'
import { dayjs } from '@/utils/date'

/**
 * @param {string} projectId
 * @param {string} date - YYYY-MM-DD
 */
export async function retroactiveDaka(projectId, date) {
  try {
    const accountId = await requireAccountId()
    const today = dayjs()
    const targetDate = dayjs(date)

    const diffDays = today.diff(targetDate, 'day')
    if (diffDays < 0) return { success: false, error: '不能打卡未来日期' }
    if (diffDays > 7) return { success: false, error: '只能补打卡最近7天' }

    const existRes = await db.collection(COLLECTIONS.RECORDS)
      .where({ accountId, projectId, date })
      .limit(1)
      .get()
    if (existRes.data && existRes.data.length > 0) {
      return { success: false, error: '该日期已有打卡记录' }
    }

    const now = dayjs().format('YYYY-MM-DD HH:mm:ss')
    const record = {
      accountId,
      projectId,
      date,
      completedAt: now,
      isRetroactive: true,
      createTime: now,
    }

    const addRes = await db.collection(COLLECTIONS.RECORDS).add(record)
    record._id = addRes.id || addRes._id
    return { success: true, record }
  } catch (error) {
    console.error('[API] retroactiveDaka 失败:', error)
    return { success: false, error: error.message }
  }
}
