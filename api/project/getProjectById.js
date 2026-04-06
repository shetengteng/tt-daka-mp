import { db, COLLECTIONS } from '@/cloud-emas/database/database'
import { requireAccountId } from '@/utils/auth'

export async function getProjectById(id) {
  try {
    const accountId = await requireAccountId()
    const res = await db.collection(COLLECTIONS.PROJECTS)
      .where({ _id: id, accountId })
      .limit(1)
      .get()
    const project = res?.data?.[0]
    if (!project) return { success: false, error: '项目不存在' }
    return { success: true, data: project }
  } catch (error) {
    console.error('[API] getProjectById 失败:', error)
    return { success: false, error: error.message }
  }
}
