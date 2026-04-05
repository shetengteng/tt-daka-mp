<template>
  <view class="card mt-md p-lg">
    <view class="flex-center-v mb-sm">
      <view class="project-icon flex-center rounded-lg" :style="{ backgroundColor: `${item.project.color}20` }">
        <TtSvg :name="item.project.icon || 'ri-checkbox-circle-line'" :size="32" :color="item.project.color" />
      </view>
      <text class="text-base font-semibold ml-sm text-foreground">{{ item.project.name }}</text>
      <text class="text-xs font-medium" style="margin-left: auto" :style="{ color: item.project.color }">{{ item.completionRate }}%</text>
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
</template>

<script setup>
defineProps({
  item: { type: Object, required: true },
})
</script>

<style lang="scss" scoped>
.project-icon {
  width: 64rpx;
  height: 64rpx;
  flex-shrink: 0;
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
</style>
