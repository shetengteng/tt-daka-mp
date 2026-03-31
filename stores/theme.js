import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const mode = ref('light') // 'light' | 'dark'

  function toggle() {
    mode.value = mode.value === 'light' ? 'dark' : 'light'
  }

  function setMode(m) {
    mode.value = m
  }

  function applyTheme() {
    const isDark = mode.value === 'dark'

    // #ifdef H5
    document.documentElement.setAttribute('data-theme', mode.value)
    const pageEls = document.querySelectorAll('uni-page-body')
    pageEls.forEach(el => el.setAttribute('data-theme', mode.value))
    // #endif

    // #ifdef MP-WEIXIN
    const pages = getCurrentPages()
    if (pages.length > 0) {
      const page = pages[pages.length - 1]
      if (page && page.setData) {
        page.setData({ themeClass: mode.value === 'dark' ? 'theme-dark' : '' })
      }
    }
    // #endif

    try {
      uni.setNavigationBarColor({
        frontColor: isDark ? '#ffffff' : '#000000',
        backgroundColor: isDark ? '#18181B' : '#ffffff',
        animation: { duration: 200, timingFunc: 'easeIn' },
      })
    } catch (e) {}

    try {
      uni.setBackgroundColor({
        backgroundColor: isDark ? '#09090B' : '#ffffff',
        backgroundColorTop: isDark ? '#09090B' : '#ffffff',
        backgroundColorBottom: isDark ? '#09090B' : '#ffffff',
      })
    } catch (e) {}
  }

  watch(mode, () => applyTheme(), { immediate: false })

  return { mode, toggle, setMode, applyTheme }
}, {
  persist: {
    key: 'dk-theme',
    paths: ['mode'],
  },
})
