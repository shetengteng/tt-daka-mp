import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ensureUser as ensureUserApi } from '@/api/user/ensureUser'
import { getUser as getUserApi } from '@/api/user/getUser'
import { updateUserProfile as updateUserProfileApi } from '@/api/user/updateUserProfile'
import { getMineStats as getMineStatsApi } from '@/api/user/getMineStats'

/**
 * 用户 Store（不持久化到 localStorage，每次进入「我的」页面从云端拉取）
 */
export const useUserStore = defineStore('user', () => {
  const nickname = ref('微信用户')
  const avatar = ref('')
  const totalDays = ref(0)

  let _loaded = false

  /** 局部更新用户信息（可只传部分字段） */
  function setUser(data) {
    if (data.nickname) nickname.value = data.nickname
    if (data.avatar !== undefined) avatar.value = data.avatar
    if (data.totalDays !== undefined) totalDays.value = data.totalDays
    _loaded = true
  }

  function isLoaded() { return _loaded }

  /** 清空状态（退出登录时调用） */
  function clear() {
    nickname.value = '微信用户'
    avatar.value = ''
    totalDays.value = 0
    _loaded = false
  }

  // ─── API 封装 ───

  /**
   * 确保用户记录存在（登录流程调用）
   * 若用户已存在则更新，否则创建新用户
   */
  async function ensure(extra = {}) {
    const res = await ensureUserApi(extra)
    if (res.success && res.user) {
      setUser({
        nickname: res.user.nickname,
        avatar: res.user.avatar,
      })
    }
    return res
  }

  /** 从云端获取当前用户信息（「我的」页面加载时调用） */
  async function fetchUser() {
    const res = await getUserApi()
    if (res.success && res.user) {
      setUser({
        nickname: res.user.nickname || '微信用户',
        avatar: res.user.avatar || '',
      })
    }
    return res
  }

  /** 更新头像和昵称 */
  async function updateProfile({ nickname: nick, avatar: av }) {
    const res = await updateUserProfileApi({ nickname: nick, avatar: av })
    if (res.success) {
      setUser({ nickname: nick, avatar: av })
    }
    return res
  }

  /** 获取「我的」页面统计数据（总打卡天数、活跃/归档项目数） */
  async function fetchMineStats() {
    const res = await getMineStatsApi()
    if (res.success) {
      setUser({ totalDays: res.totalDays })
    }
    return res
  }

  return {
    nickname, avatar, totalDays,
    setUser, isLoaded, clear,
    ensure, fetchUser, updateProfile, fetchMineStats,
  }
})
