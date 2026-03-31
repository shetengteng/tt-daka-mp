/**
 * 归档/恢复打卡项目
 */
import { db, COLLECTIONS } from '@/cloud-emas/database/database'
import { checkEmasError } from '@/cloud-emas/database/error'
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
    
    const res = await db.collection(COLLECTIONS.PROJECTS)
      .updateOne({ _id: id, accountId }, { $set: { archived, updateTime: now } })
    checkEmasError(res, archived ? '归档项目' : '恢复项目')
    
    return { success: true }
  } catch (error) {
    console.error('[API] archiveProject 失败:', error)
    return { success: false, error: error.message }
  }
}
