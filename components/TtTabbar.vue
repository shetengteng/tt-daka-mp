<template>
  <tt-tabbar
    :model-value="current"
    :items="tabList"
    :active-color="activeColor"
    :inactive-color="inactiveColor"
    @change="onChange"
  />
</template>

<script setup>
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'

defineProps({
  current: { type: String, default: 'home' }
})

const themeStore = useThemeStore()
const activeColor = computed(() => themeStore.mode === 'dark' ? '#FAFAFA' : '#09090B')
const inactiveColor = computed(() => themeStore.mode === 'dark' ? '#A1A1AA' : '#71717A')

const tabList = [
  { name: 'home', text: '打卡', icon: 'ri-checkbox-circle-line', selectedIcon: 'ri-checkbox-circle-fill', path: '/pages/index/index' },
  { name: 'calendar', text: '日历', icon: 'ri-calendar-line', selectedIcon: 'ri-calendar-fill', path: '/pages/calendar/index' },
  { name: 'stats', text: '统计', icon: 'ri-bar-chart-line', selectedIcon: 'ri-bar-chart-fill', path: '/pages/stats/index' },
  { name: 'mine', text: '我的', icon: 'ri-user-line', selectedIcon: 'ri-user-fill', path: '/pages/mine/index' },
]

function onChange(item) {
  if (item.path) uni.redirectTo({ url: item.path })
}
</script>
