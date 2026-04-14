/**
 * 删除打卡项目及其所有记录
 */
import { db, COLLECTIONS } from '@/api/emas'
import { requireAccountId } from '@/utils/auth'

export async function deleteProject(id) {
  try {
    const accountId = await requireAccountId()

    await db.collection(COLLECTIONS.RECORDS)
      .where({ accountId, projectId: id })
      .remove()

    await db.collection(COLLECTIONS.PROJECTS)
      .where({ _id: id, accountId })
      .remove()

    return { success: true }
  } catch (error) {
    console.error('[API] deleteProject 失败:', error)
    return { success: false, error: error.message }
  }
}
