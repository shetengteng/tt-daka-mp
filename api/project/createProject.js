/**
 * 创建打卡项目
 */
import { db, COLLECTIONS } from '@/api/emas'
import { requireAccountId } from '@/utils/auth'
import { dayjs } from '@/utils/date'

/**
 * @param {Object} data - { name, icon, color, frequency, customDays }
 */
export async function createProject(data) {
  try {
    const accountId = await requireAccountId()
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss')

    const countRes = await db.collection(COLLECTIONS.PROJECTS)
      .where({ accountId, archived: false })
      .count()
    const sortOrder = (countRes?.total || 0) + 1

    const doc = {
      accountId,
      name: data.name,
      icon: data.icon,
      color: data.color,
      frequency: data.frequency || 'daily',
      customDays: data.customDays || [],
      archived: false,
      sortOrder,
      createTime: now,
      updateTime: now,
    }

    const addRes = await db.collection(COLLECTIONS.PROJECTS).add(doc)
    doc._id = addRes.id || addRes._id
    return { success: true, data: doc }
  } catch (error) {
    console.error('[API] createProject 失败:', error)
    return { success: false, error: error.message }
  }
}
