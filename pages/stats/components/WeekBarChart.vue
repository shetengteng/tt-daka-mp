<template>
  <view class="section px-xl mt-xl">
    <text class="text-sm font-semibold text-foreground mb-md block">本周完成率</text>
    <view class="card p-lg">
      <view class="bar-chart">
        <view v-for="day in statsStore.data.weekData" :key="day.date" class="bar-col flex-col flex-center">
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
</template>

<script setup>
import { useStatsStore } from '@/stores/stats'
const statsStore = useStatsStore()

function barHeight(percent) {
  if (percent <= 0) return '8rpx'
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
</script>

<style lang="scss" scoped>
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

.bar--success { background-color: var(--tt-success, #22C55E); }
.bar--warn { background-color: var(--tt-warning, #F97316); }
.bar--disabled { background-color: var(--tt-disabled, #D4D4D8); }
.text-disabled { color: var(--tt-disabled, #D4D4D8); }
</style>
