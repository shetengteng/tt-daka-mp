/**
 * 确保用户记录存在
 * 
 * 微信登录流程：
 * 1. 优先用 openid 查找已有用户 → 找到则复用（解决重新登录账号丢失问题）
 * 2. 未找到 → 用 accountId 查找 → 找到则更新 openid
 * 3. 都没有 → 创建新用户
 * 
 * 匿名/开发模式：
 * 用 accountId 查找，无则创建
 */
import { db, COLLECTIONS } from '@/api/emas'
import { requireAccountId, setAccountId } from '@/utils/auth'

export async function ensureUser(extra = {}) {
  try {
    const accountId = await requireAccountId()
    const now = new Date().toISOString()
    const openid = extra.openid || ''

    let existing = null

    if (openid) {
      const openidRes = await db.collection(COLLECTIONS.USERS).where({ openid }).get()
      existing = (openidRes.data || [])[0]

      if (existing && existing.accountId !== accountId) {
        setAccountId(existing.accountId)
      }
    }

    if (!existing) {
      const accountRes = await db.collection(COLLECTIONS.USERS).where({ accountId }).get()
      existing = (accountRes.data || [])[0]
    }

    if (existing) {
      const updateData = { updateTime: now }
      if (extra.nickname) updateData.nickname = extra.nickname
      if (extra.avatar) updateData.avatar = extra.avatar
      if (extra.loginType) updateData.loginType = extra.loginType
      if (openid && !existing.openid) updateData.openid = openid
      await db.collection(COLLECTIONS.USERS).doc(existing._id).update(updateData)
      return { success: true, user: { ...existing, ...updateData } }
    }

    const loginType = extra.loginType || 'anonymous'
    const defaultNickname = loginType === 'wechat' ? '微信用户' : '匿名用户'
    const newUser = {
      accountId,
      openid,
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
