<template>
  <view class="stat-grid px-xl mt-xl">
    <view class="card flex-col flex-center p-md">
      <text class="text-2xl font-bold text-foreground">{{ statsStore.data.totalDays }}</text>
      <text class="text-xs text-muted mt-xs">总打卡(天)</text>
    </view>
    <view class="card flex-col flex-center p-md">
      <text class="text-2xl font-bold text-foreground">{{ statsStore.data.longestStreak }}</text>
      <text class="text-xs text-muted mt-xs">最长连续</text>
    </view>
    <view class="card flex-col flex-center p-md">
      <text class="text-2xl font-bold text-foreground">{{ statsStore.data.currentStreak }}</text>
      <text class="text-xs text-muted mt-xs">当前连续</text>
    </view>
  </view>
</template>

<script setup>
import { useStatsStore } from '@/stores/stats'
const statsStore = useStatsStore()
</script>

<style lang="scss" scoped>
.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24rpx;
}
</style>
