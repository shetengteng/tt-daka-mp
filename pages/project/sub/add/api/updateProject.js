/**
 * 编辑打卡项目
 */
import { db, COLLECTIONS } from '@/cloud-emas/database/database'
import { checkEmasError } from '@/cloud-emas/database/error'
import { requireAccountId } from '@/utils/auth'
import { dayjs } from '@/utils/date'

/**
 * @param {string} id - 项目 ID
 * @param {Object} data - { name, icon, color, frequency, customDays }
 */
export async function updateProject(id, data) {
  try {
    const accountId = await requireAccountId()
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss')
    
    const updateData = {
      name: data.name,
      icon: data.icon,
      color: data.color,
      frequency: data.frequency,
      customDays: data.customDays || [],
      updateTime: now,
    }
    
    const res = await db.collection(COLLECTIONS.PROJECTS)
      .updateOne({ _id: id, accountId }, { $set: updateData })
    checkEmasError(res, '更新项目')
    
    return { success: true }
  } catch (error) {
    console.error('[API] updateProject 失败:', error)
    return { success: false, error: error.message }
  }
}
