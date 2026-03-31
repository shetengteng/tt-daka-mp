/**
 * 创建打卡项目
 */
import { db, COLLECTIONS } from '@/cloud-emas/database/database'
import { checkEmasError } from '@/cloud-emas/database/error'
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
      .find({ accountId, archived: false })
      .count()
    const sortOrder = (countRes?.result || 0) + 1
    
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
    
    const res = await db.collection(COLLECTIONS.PROJECTS).insertOne(doc)
    checkEmasError(res, '创建项目')
    
    doc._id = res.result._id || res.result.insertedId
    return { success: true, data: doc }
  } catch (error) {
    console.error('[API] createProject 失败:', error)
    return { success: false, error: error.message }
  }
}
