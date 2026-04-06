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
import { useProjectStore } from '@/stores/project'
import { useStatsStore } from '@/stores/stats'
import { getStats } from '@/api/stats/getStats'
import { getAccountId } from '@/utils/auth'
import { checkDataVersion, updateLocalVersion } from '@/utils/version-check'
import StatsOverview from './components/StatsOverview.vue'
import WeekBarChart from './components/WeekBarChart.vue'
import ProjectStatCard from './components/ProjectStatCard.vue'

const projectStore = useProjectStore()
const statsStore = useStatsStore()

const themeStore = useThemeStore()
const headerPaddingTop = computed(() => `${themeStore.statusBarHeight + 12}px`)

async function loadStats() {
  const res = await getStats()
  if (res.success) {
    statsStore.setStats(res.data)
    projectStore.markFresh()
  }
}

onShow(async () => {
  themeStore.applyTheme()

  if (!statsStore.isLoaded()) {
    await loadStats()
    return
  }

  if (projectStore.isCacheValid()) return

  const accountId = getAccountId()
  if (!accountId) { await loadStats(); return }

  const { needRefresh, version } = await checkDataVersion(accountId)
  if (needRefresh) {
    await loadStats()
    updateLocalVersion(accountId, version)
  } else {
    projectStore.markFresh()
  }
})

onPullDownRefresh(async () => {
  const accountId = getAccountId()
  if (accountId) {
    const { needRefresh, version } = await checkDataVersion(accountId)
    if (needRefresh) {
      await loadStats()
      updateLocalVersion(accountId, version)
    } else {
      uni.showToast({ title: '已是最新', icon: 'none', duration: 1500 })
    }
  } else {
    await loadStats()
  }
  uni.stopPullDownRefresh()
})
</script>
