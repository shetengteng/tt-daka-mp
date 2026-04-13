<template>
  <view v-if="loading" class="tt-skeleton" :class="{ 'tt-skeleton--animate': animate }">
    <view v-if="avatar" class="tt-skeleton__avatar" />
    <view class="tt-skeleton__content">
      <view v-if="title" class="tt-skeleton__title" />
      <view v-for="i in rows" :key="i" class="tt-skeleton__row" :style="{ width: i === rows ? '60%' : '100%' }" />
    </view>
  </view>
  <slot v-else />
</template>

<script setup >import { skeletonProps } from "./props";
defineProps(skeletonProps);
</script>

<style>
.tt-skeleton { display: flex; gap: 24rpx; }
.tt-skeleton__avatar { width: 80rpx; height: 80rpx; border-radius: 50%; background: var(--tt-muted, #f5f5f5); flex-shrink: 0; }
.tt-skeleton__content { flex: 1; }
.tt-skeleton__title { width: 40%; height: 32rpx; background: var(--tt-muted, #f5f5f5); border-radius: 8rpx; margin-bottom: 24rpx; }
.tt-skeleton__row { height: 24rpx; background: var(--tt-muted, #f5f5f5); border-radius: 8rpx; margin-bottom: 16rpx; }
.tt-skeleton--animate .tt-skeleton__avatar, .tt-skeleton--animate .tt-skeleton__title, .tt-skeleton--animate .tt-skeleton__row { animation: tt-skeleton-pulse 1.5s ease infinite; }
@keyframes tt-skeleton-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
</style>
