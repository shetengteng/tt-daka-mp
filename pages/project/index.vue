<template>
  <view class="page px-lg" :class="{ 'theme-dark': themeStore.mode === 'dark' }" :style="themeStore.themeStyle">
    <TtNavbar :title="navTitle" />
    <DragProjectList />
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useThemeStore } from '@/stores/theme'
import { useProjectStore } from '@/stores/project'
import DragProjectList from './components/DragProjectList.vue'

const themeStore = useThemeStore()
const projectStore = useProjectStore()

const navTitle = computed(() => `打卡项目管理 (${projectStore.activeList.length})`)

onShow(async () => {
  themeStore.applyTheme()
  await projectStore.ensureFresh()
})
</script>
