/**
 * 打卡/取消打卡
 */
import { db, COLLECTIONS } from '@/cloud-emas/database/database'
import { checkEmasError } from '@/cloud-emas/database/error'
import { requireAccountId } from '@/utils/auth'
import { formatDate, dayjs } from '@/utils/date'

/**
 * @param {string} projectId
 * @param {boolean} currentChecked - 当前是否已打卡（true=取消, false=打卡）
 * @returns {{ success: boolean, record?: Object }}
 */
export async function toggleDaka(projectId, currentChecked) {
  try {
    const accountId = await requireAccountId()
    const today = formatDate(new Date())
    
    if (currentChecked) {
      const deleteRes = await db.collection(COLLECTIONS.RECORDS)
        .deleteOne({ accountId, projectId, date: today })
      checkEmasError(deleteRes, '取消打卡')
      return { success: true, action: 'cancel' }
    }
    
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss')
    const record = {
      accountId,
      projectId,
      date: today,
      completedAt: now,
      isRetroactive: false,
      createTime: now,
    }
    
    const insertRes = await db.collection(COLLECTIONS.RECORDS).insertOne(record)
    checkEmasError(insertRes, '打卡')
    
    record._id = insertRes.result._id || insertRes.result.insertedId
    return { success: true, action: 'check', record }
  } catch (error) {
    console.error('[API] toggleDaka 失败:', error)
    return { success: false, error: error.message }
  }
}
