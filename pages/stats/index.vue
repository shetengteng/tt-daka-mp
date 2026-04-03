<template>
  <view class="page" :class="{ 'theme-dark': themeStore.mode === 'dark' }" :style="themeStore.themeStyle">
    <view class="header px-xl pt-lg" :style="{ paddingTop: headerPaddingTop }">
      <text class="text-xl font-bold text-foreground">打卡统计</text>
    </view>
    
    <!-- 总览卡片 -->
    <view class="stat-grid px-xl mt-xl">
      <view class="card flex-col flex-center p-md">
        <text class="text-2xl font-bold text-foreground">{{ stats.totalDays }}</text>
        <text class="text-xs text-muted mt-xs">总打卡(天)</text>
      </view>
      <view class="card flex-col flex-center p-md">
        <text class="text-2xl font-bold text-foreground">{{ stats.longestStreak }}</text>
        <text class="text-xs text-muted mt-xs">最长连续</text>
      </view>
      <view class="card flex-col flex-center p-md">
        <text class="text-2xl font-bold text-foreground">{{ stats.currentStreak }}</text>
        <text class="text-xs text-muted mt-xs">当前连续</text>
      </view>
    </view>
    
    <!-- 本周完成率 - 柱状图 -->
    <view class="section px-xl mt-xl">
      <text class="text-sm font-semibold text-foreground mb-md block">本周完成率</text>
      <view class="card p-lg">
        <view class="bar-chart flex-between">
          <view 
            v-for="day in stats.weekData" 
            :key="day.date" 
            class="bar-col flex-col flex-center"
          >
            <view class="bar-wrapper">
              <view 
                class="bar-fill" 
                :class="barColorClass(day.percent)"
                :style="{ height: barHeight(day.percent) }"
              ></view>
            </view>
            <text class="text-xs text-muted mt-xs">{{ day.label }}</text>
            <text class="text-xs font-medium" :class="barTextClass(day.percent)">
              {{ day.percent < 0 ? '--' : day.percent + '%' }}
            </text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 各项目统计 -->
    <view class="section px-xl mt-xl">
      <text class="text-sm font-semibold text-foreground mb-md block">各项目统计</text>
      
      <view v-for="item in stats.projectStats" :key="item.project._id" class="card mt-md p-lg">
        <view class="flex-center-v mb-sm">
          <view class="project-icon flex-center rounded-lg" :style="{ backgroundColor: `${item.project.color}20` }">
            <TtSvg :name="item.project.icon || 'ri-checkbox-circle-line'" :size="32" :color="item.project.color" />
          </view>
          <text class="text-base font-semibold ml-sm text-foreground">{{ item.project.name }}</text>
          <text class="text-xs font-medium ml-auto" :style="{ color: item.project.color }">{{ item.completionRate }}%</text>
        </view>
        
        <view class="flex-between text-xs text-muted mb-sm">
          <text>连续 {{ item.currentStreak }}天 · 最长 {{ item.longestStreak }}天</text>
          <text>本月已打卡 {{ item.monthDone }}/{{ item.monthTotal }} 天</text>
        </view>
        
        <view class="flex-center-v">
          <text class="text-xs text-muted mr-xs">最近7天</text>
          <view 
            v-for="(done, idx) in item.last7" 
            :key="idx" 
            class="dot" 
            :class="done ? 'dot--done' : 'dot--miss'"
            :style="done ? { backgroundColor: item.project.color } : {}"
          ></view>
        </view>
      </view>
      
      <view v-if="stats.projectStats.length === 0" class="text-center py-xl">
        <text class="text-sm text-muted">暂无统计数据</text>
      </view>
    </view>
    
    <TtBottomPlaceholder />
    <TtTabbar current="stats" />
  </view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { useThemeStore } from '@/stores/theme'
import { getStats } from './api/getStats'

const stats = reactive({
  totalDays: 0,
  currentStreak: 0,
  longestStreak: 0,
  weekData: [],
  projectStats: [],
})

function barHeight(percent) {
  if (percent < 0) return '8rpx'
  if (percent === 0) return '8rpx'
  return `${Math.max(percent, 5)}%`
}

function barColorClass(percent) {
  if (percent < 0) return 'bar--disabled'
  if (percent >= 100) return 'bar--success'
  if (percent > 0) return 'bar--warn'
  return 'bar--disabled'
}

function barTextClass(percent) {
  if (percent < 0) return 'text-disabled'
  if (percent >= 100) return 'text-success'
  if (percent > 0) return 'text-foreground'
  return 'text-disabled'
}

const themeStore = useThemeStore()
const headerPaddingTop = computed(() => `${themeStore.statusBarHeight + 12}px`)

onShow(async () => {
  themeStore.applyTheme()
  const res = await getStats()
  if (res.success) {
    Object.assign(stats, res.data)
  }
})

onPullDownRefresh(async () => {
  const res = await getStats()
  if (res.success) {
    Object.assign(stats, res.data)
  }
  uni.stopPullDownRefresh()
})
</script>

<style lang="scss" scoped>
.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24rpx;
}

.bar-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16rpx;
}

.bar-col {
  flex: 1;
  gap: 8rpx;
}

.bar-wrapper {
  width: 100%;
  height: 200rpx;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.bar-fill {
  width: 100%;
  border-radius: 8rpx 8rpx 0 0;
  transition: height 0.3s ease;
}

.bar--success {
  background-color: var(--tt-success, #22C55E);
}

.bar--warn {
  background-color: var(--tt-warning, #F97316);
}

.bar--disabled {
  background-color: var(--tt-disabled, #D4D4D8);
}

.text-disabled {
  color: var(--tt-disabled, #D4D4D8);
}

.items-end {
  align-items: flex-end;
}

.project-icon {
  width: 64rpx;
  height: 64rpx;
  flex-shrink: 0;
}

.block {
  display: block;
}

.dot {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  margin-left: 8rpx;
  
  &--done {
    background-color: var(--tt-success, #22C55E);
  }
  
  &--miss {
    background-color: transparent;
    border: 1rpx solid var(--tt-border, #E4E4E7);
  }
}

.ml-auto {
  margin-left: auto;
}
</style>
