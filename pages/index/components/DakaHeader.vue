<template>
  <view class="header px-xl pt-lg" :style="{ paddingTop: `${statusBarHeight + 2}px` }">
    <view class="header__top flex-between items-start" :style="capsuleStyle">
      <view>
        <text class="app-title text-foreground">DaKa</text>
        <view class="header__greeting">
          <text class="text-xs text-muted">{{ greeting }}</text>
        </view>
      </view>
      <view class="header__date-badge flex-center-v" @click="goCalendar">
        <text class="header__date-day">{{ todayDay }}</text>
        <view class="header__date-info">
          <text class="header__date-month">{{ todayMonth }}</text>
          <text class="header__date-weekday">{{ todayWeekday }}</text>
        </view>
      </view>
    </view>
    
    <view v-if="showProgress" class="progress-section card p-lg mt-lg mb-lg">
      <view class="flex-between mb-sm">
        <text class="text-sm text-muted">今日进度</text>
        <text class="text-sm font-semibold text-foreground">
          {{ progress.done }}/{{ progress.total }}
        </text>
      </view>
      <view class="progress-bar rounded-full">
        <view class="progress-fill rounded-full" :style="{ width: `${progress.percent}%` }"></view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { dayjs } from '@/utils/date'

defineProps({
  statusBarHeight: { type: Number, default: 0 },
  capsuleStyle: { type: Object, default: () => ({}) },
  showProgress: { type: Boolean, default: false },
  progress: { type: Object, default: () => ({ done: 0, total: 0, percent: 0 }) },
})

function goCalendar() {
  uni.switchTab({ url: '/pages/calendar/index' })
}

const todayDay = computed(() => dayjs().format('D'))
const todayMonth = computed(() => dayjs().format('MMM').toUpperCase())
const todayWeekday = computed(() => dayjs().format('ddd'))

const greeting = computed(() => {
  const hour = dayjs().hour()
  if (hour < 6) return '夜深了，早点休息'
  if (hour < 12) return '早上好，新的一天开始了'
  if (hour < 14) return '中午好，记得休息'
  if (hour < 18) return '下午好，继续加油'
  return '晚上好，今天辛苦了'
})
</script>

<style lang="scss" scoped>
.header__date-badge {
  padding: 12rpx 20rpx;
  flex-shrink: 0;
  gap: 12rpx;
  background-color: var(--tt-card);
  border-radius: 16rpx;
}

.header__date-day {
  font-size: 48rpx;
  font-weight: 700;
  line-height: 1;
  color: var(--tt-foreground);
}

.header__date-info {
  display: flex;
  flex-direction: column;
}

.header__date-month {
  font-size: 20rpx;
  font-weight: 600;
  letter-spacing: 2rpx;
  color: var(--tt-muted-foreground);
  line-height: 1.3;
}

.header__date-weekday {
  font-size: 20rpx;
  font-weight: 500;
  color: var(--tt-muted-foreground);
  line-height: 1.3;
}

.app-title {
  font-size: 40rpx;
  font-weight: 700;
  letter-spacing: 1rpx;
  line-height: 1;
  font-family: 'Pacifico', 'PingFang SC', cursive;
}

.header__greeting {
  margin-top: -2rpx;
}

.progress-bar {
  height: 16rpx;
  background-color: var(--tt-border, #E4E4E7);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: var(--tt-success, #22C55E);
  transition: width 0.3s ease;
  min-width: 0;
}
</style>
