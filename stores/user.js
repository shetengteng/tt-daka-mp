import { defineStore } from 'pinia'
import { ref } from 'vue'

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

  return { nickname, avatar, totalDays, setUser, isLoaded, clear }
})
