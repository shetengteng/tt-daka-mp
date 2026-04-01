import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

function loadPersistedMode() {
  try {
    const raw = uni.getStorageSync('dk-theme')
    if (raw) {
      const data = typeof raw === 'string' ? JSON.parse(raw) : raw
      if (data.mode === 'dark' || data.mode === 'light') return data.mode
    }
  } catch (e) {}
  return 'light'
}

export const useThemeStore = defineStore('theme', () => {
  const mode = ref(loadPersistedMode())

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
    const applyToPageBodies = () => {
      document.querySelectorAll('uni-page-body').forEach(el => {
        el.setAttribute('data-theme', mode.value)
      })
    }
    const applyToPageHead = () => {
      const headDiv = document.querySelector('uni-page-head .uni-page-head')
      if (headDiv) {
        headDiv.style.backgroundColor = isDark ? '#09090B' : '#ffffff'
        headDiv.style.color = isDark ? '#FAFAFA' : '#000000'
      }
    }
    applyToPageBodies()
    applyToPageHead()
    setTimeout(() => { applyToPageBodies(); applyToPageHead() }, 50)
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
