/**
 * 更新项目排序（上下移动）
 */
import { db, COLLECTIONS } from '@/cloud-emas/database/database'
import { checkEmasError } from '@/cloud-emas/database/error'
import { requireAccountId } from '@/utils/auth'

/**
 * @param {string} id - 项目 ID
 * @param {'up'|'down'} direction
 * @param {Array} projects - 当前项目列表（已排序）
 */
export async function updateProjectSort(id, direction, projects) {
  try {
    const accountId = await requireAccountId()
    const idx = projects.findIndex(p => p._id === id)
    if (idx < 0) return { success: false, error: '项目未找到' }
    
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= projects.length) return { success: false, error: '已在边界' }
    
    const a = projects[idx]
    const b = projects[swapIdx]
    
    await db.collection(COLLECTIONS.PROJECTS)
      .updateOne({ _id: a._id, accountId }, { $set: { sortOrder: b.sortOrder } })
    await db.collection(COLLECTIONS.PROJECTS)
      .updateOne({ _id: b._id, accountId }, { $set: { sortOrder: a.sortOrder } })
    
    return { success: true }
  } catch (error) {
    console.error('[API] updateProjectSort 失败:', error)
    return { success: false, error: error.message }
  }
}
