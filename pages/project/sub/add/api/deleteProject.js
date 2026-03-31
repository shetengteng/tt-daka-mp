/**
 * 删除打卡项目及其所有记录
 */
import { db, COLLECTIONS } from '@/cloud-emas/database/database'
import { checkEmasError } from '@/cloud-emas/database/error'
import { requireAccountId } from '@/utils/auth'

export async function deleteProject(id) {
  try {
    const accountId = await requireAccountId()
    
    await db.collection(COLLECTIONS.RECORDS)
      .deleteMany({ accountId, projectId: id })
    
    const res = await db.collection(COLLECTIONS.PROJECTS)
      .deleteOne({ _id: id, accountId })
    checkEmasError(res, '删除项目')
    
    return { success: true }
  } catch (error) {
    console.error('[API] deleteProject 失败:', error)
    return { success: false, error: error.message }
  }
}
