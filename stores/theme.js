import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

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

function getSystemLayout() {
  try {
    const info = uni.getSystemInfoSync()
    const statusBarHeight = info.statusBarHeight || 44
    let capsuleRight = 0
    // #ifdef MP-WEIXIN
    try {
      const capsule = wx.getMenuButtonBoundingClientRect()
      capsuleRight = info.windowWidth - capsule.left
    } catch (e) {
      capsuleRight = 100
    }
    // #endif
    return { statusBarHeight, capsuleRight }
  } catch (e) {
    return { statusBarHeight: 44, capsuleRight: 100 }
  }
}

const DARK_VARS = {
  '--tt-background': '#09090B',
  '--tt-foreground': '#FAFAFA',
  '--tt-card': '#1C1C1E',
  '--tt-card-foreground': '#FAFAFA',
  '--tt-popover': '#1C1C1E',
  '--tt-popover-foreground': '#FAFAFA',
  '--tt-primary': '#FAFAFA',
  '--tt-primary-foreground': '#09090B',
  '--tt-secondary': '#27272A',
  '--tt-secondary-foreground': '#FAFAFA',
  '--tt-muted': '#27272A',
  '--tt-muted-foreground': '#A1A1AA',
  '--tt-accent': '#27272A',
  '--tt-accent-foreground': '#FAFAFA',
  '--tt-border': '#3F3F46',
  '--tt-input': '#3F3F46',
  '--tt-ring': '#D4D4D8',
  '--tt-success': '#4ADE80',
  '--tt-warning': '#FB923C',
  '--tt-error': '#F87171',
  '--tt-disabled': '#52525B',
  '--tt-shadow-color': 'rgba(0,0,0,0.3)',
  '--tt-shadow-md': 'rgba(0,0,0,0.4)',
  '--tt-overlay': 'rgba(0,0,0,0.6)',
}

export const useThemeStore = defineStore('theme', () => {
  const mode = ref(loadPersistedMode())
  const layout = getSystemLayout()
  const statusBarHeight = ref(layout.statusBarHeight)
  const capsuleRight = ref(layout.capsuleRight)

  const themeStyle = computed(() => {
    if (mode.value !== 'dark') return ''
    return Object.entries(DARK_VARS).map(([k, v]) => `${k}:${v}`).join(';')
  })

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

    try {
      uni.setNavigationBarColor({
        frontColor: isDark ? '#ffffff' : '#000000',
        backgroundColor: isDark ? '#18181B' : '#ffffff',
        animation: { duration: 0, timingFunc: 'easeIn' },
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

  return { mode, statusBarHeight, capsuleRight, themeStyle, toggle, setMode, applyTheme }
}, {
  persist: {
    key: 'dk-theme',
    paths: ['mode'],
  },
})
