/**
 * 批量更新项目排序
 */
import { db, COLLECTIONS } from '@/cloud-emas/database/database'
import { requireAccountId } from '@/utils/auth'

/**
 * @param {Array<{_id: string, sortOrder: number}>} items
 */
export async function batchUpdateSort(items) {
  try {
    const accountId = await requireAccountId()
    for (const item of items) {
      await db.collection(COLLECTIONS.PROJECTS)
        .updateOne({ _id: item._id, accountId }, { $set: { sortOrder: item.sortOrder } })
    }
    return { success: true }
  } catch (error) {
    console.error('[API] batchUpdateSort 失败:', error)
    return { success: false, error: error.message }
  }
}
