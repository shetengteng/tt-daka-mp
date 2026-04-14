/**
 * 归档/恢复打卡项目
 */
import { db, COLLECTIONS } from '@/api/emas'
import { requireAccountId } from '@/utils/auth'
import { dayjs } from '@/utils/date'

/**
 * @param {string} id - 项目 ID
 * @param {boolean} archived - true=归档, false=恢复
 */
export async function archiveProject(id, archived) {
  try {
    const accountId = await requireAccountId()
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss')

    await db.collection(COLLECTIONS.PROJECTS)
      .where({ _id: id, accountId })
      .update({ archived, updateTime: now })

    return { success: true }
  } catch (error) {
    console.error('[API] archiveProject 失败:', error)
    return { success: false, error: error.message }
  }
}
