<template>
  <view class="page" :class="{ 'theme-dark': themeStore.mode === 'dark' }" :style="themeStore.themeStyle">
    <view class="header px-xl pt-lg" :style="{ paddingTop: headerPaddingTop }">
      <text class="text-xl font-bold text-foreground">打卡统计</text>
    </view>
    
    <StatsOverview />
    <WeekBarChart />
    
    <view class="section px-xl mt-xl">
      <text class="text-sm font-semibold text-foreground mb-md block">各项目统计</text>
      <ProjectStatCard
        v-for="item in statsStore.data.projectStats"
        :key="item.project._id"
        :item="item"
      />
      <view v-if="statsStore.data.projectStats.length === 0" class="text-center py-xl">
        <text class="text-sm text-muted">暂无统计数据</text>
      </view>
    </view>
    
    <TtBottomPlaceholder />
    <TtTabbar current="stats" />
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { useThemeStore } from '@/stores/theme'
import { useStatsStore } from '@/stores/stats'
import { usePageFresh } from '@/composables/usePageFresh'
import { syncPendingOps } from '@/utils/sync-manager'
import StatsOverview from './components/StatsOverview.vue'
import WeekBarChart from './components/WeekBarChart.vue'
import ProjectStatCard from './components/ProjectStatCard.vue'

const statsStore = useStatsStore()
const { needRefresh, forceCheck, markLoaded } = usePageFresh('stats')

const themeStore = useThemeStore()
const headerPaddingTop = computed(() => `${themeStore.statusBarHeight + 12}px`)

async function fetchStats() {
  const res = await statsStore.fetchStats()
  if (res.success) markLoaded()
}

onShow(async () => {
  themeStore.applyTheme()
  if (await needRefresh()) await fetchStats()
})

onPullDownRefresh(async () => {
  await syncPendingOps()
  if (await forceCheck()) {
    await fetchStats()
  } else {
    uni.showToast({ title: '已是最新', icon: 'none' })
  }
  uni.stopPullDownRefresh()
})
</script>
