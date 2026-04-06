import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ensureUser as ensureUserApi } from '@/api/user/ensureUser'
import { getUser as getUserApi } from '@/api/user/getUser'
import { updateUserProfile as updateUserProfileApi } from '@/api/user/updateUserProfile'
import { getMineStats as getMineStatsApi } from '@/api/user/getMineStats'

export const useUserStore = defineStore('user', () => {
  const nickname = ref('微信用户')
  const avatar = ref('')
  const totalDays = ref(0)

  let _loaded = false

  function setUser(data) {
    if (data.nickname) nickname.value = data.nickname
    if (data.avatar !== undefined) avatar.value = data.avatar
    if (data.totalDays !== undefined) totalDays.value = data.totalDays
    _loaded = true
  }

  function isLoaded() { return _loaded }

  function clear() {
    nickname.value = '微信用户'
    avatar.value = ''
    totalDays.value = 0
    _loaded = false
  }

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

  async function updateProfile({ nickname: nick, avatar: av }) {
    const res = await updateUserProfileApi({ nickname: nick, avatar: av })
    if (res.success) {
      setUser({ nickname: nick, avatar: av })
    }
    return res
  }

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
