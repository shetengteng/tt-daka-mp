/**
 * 更新用户头像和昵称
 */
import { db, COLLECTIONS } from '@/cloud-emas/database/database'
import { requireAccountId } from '@/utils/auth'

export async function updateUserProfile({ nickname, avatar }) {
  try {
    const accountId = await requireAccountId()
    const res = await db.collection(COLLECTIONS.USERS).where({ accountId }).get()
    const existing = (res.data || [])[0]
    if (!existing) return { success: false, error: '用户记录不存在' }

    const updateData = { updateTime: new Date().toISOString() }
    if (nickname !== undefined) updateData.nickname = nickname
    if (avatar !== undefined) updateData.avatar = avatar

    await db.collection(COLLECTIONS.USERS).doc(existing._id).update(updateData)
    return { success: true, user: { ...existing, ...updateData } }
  } catch (error) {
    console.error('[API] updateUserProfile 失败:', error)
    return { success: false, error: error.message }
  }
}
