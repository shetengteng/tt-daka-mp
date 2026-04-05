/**
 * 确保用户记录存在
 * 登录后调用：查找 accountId 对应的 user 记录，没有则创建
 */
import { db, COLLECTIONS } from '@/cloud-emas/database/database'
import { requireAccountId } from '@/utils/auth'

export async function ensureUser(extra = {}) {
  try {
    const accountId = await requireAccountId()
    const now = new Date().toISOString()

    const res = await db.collection(COLLECTIONS.USERS).where({ accountId }).get()
    const existing = (res.data || [])[0]

    if (existing) {
      const updateData = { updateTime: now }
      if (extra.nickname) updateData.nickname = extra.nickname
      if (extra.avatar) updateData.avatar = extra.avatar
      if (extra.loginType) updateData.loginType = extra.loginType
      await db.collection(COLLECTIONS.USERS).doc(existing._id).update(updateData)
      return { success: true, user: { ...existing, ...updateData } }
    }

    const loginType = extra.loginType || 'anonymous'
    const defaultNickname = loginType === 'wechat' ? '微信用户' : '匿名用户'
    const newUser = {
      accountId,
      nickname: extra.nickname || defaultNickname,
      avatar: extra.avatar || '',
      loginType,
      createTime: now,
      updateTime: now,
    }
    const addRes = await db.collection(COLLECTIONS.USERS).add(newUser)
    return { success: true, user: { _id: addRes._id, ...newUser } }
  } catch (error) {
    console.error('[API] ensureUser 失败:', error)
    return { success: false, error: error.message }
  }
}
