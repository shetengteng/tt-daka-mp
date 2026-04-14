/**
 * 获取当前用户信息
 */
import { db, COLLECTIONS } from '@/api/emas'
import { requireAccountId } from '@/utils/auth'

export async function getUser() {
  try {
    const accountId = await requireAccountId()
    const res = await db.collection(COLLECTIONS.USERS).where({ accountId }).get()
    const user = (res.data || [])[0]
    return { success: true, user: user || null }
  } catch (error) {
    console.error('[API] getUser 失败:', error)
    return { success: false, user: null, error: error.message }
  }
}
