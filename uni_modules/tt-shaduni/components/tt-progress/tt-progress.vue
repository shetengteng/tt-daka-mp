<template>
  <view class="tt-progress">
    <view class="tt-progress__bar" :style="{ height: strokeWidth + 'px' }">
      <view class="tt-progress__inner" :style="{ width: Math.min(percentage, 100) + '%', backgroundColor: color || undefined }" />
    </view>
    <text v-if="showText" class="tt-progress__text">{{ percentage }}%</text>
  </view>
</template>

<script setup >import { progressProps } from "./props";
defineProps(progressProps);
</script>

<style>
.tt-progress { display: flex; align-items: center; gap: 20rpx; width: 100%; }
.tt-progress__bar { flex: 1; background: var(--tt-muted, #f5f5f5); border-radius: 19998rpx; overflow: hidden; }
.tt-progress__inner { height: 100%; background: var(--tt-primary, #171717); border-radius: 19998rpx; transition: width 0.3s; }
.tt-progress__text { font-size: 24rpx; color: var(--tt-muted-foreground, #737373); flex-shrink: 0; width: 72rpx; text-align: right; }
</style>
