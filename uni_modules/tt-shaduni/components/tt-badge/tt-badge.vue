<template>
  <view class="tt-badge">
    <slot />
    <view v-if="!hidden && (dot || value)" class="tt-badge__content" :class="{ 'tt-badge__content--dot': dot }">
      <text v-if="!dot" class="tt-badge__text">{{ typeof value === 'number' && value > max ? max + '+' : value }}</text>
    </view>
  </view>
</template>

<script setup >import { badgeProps } from "./props";
defineProps(badgeProps);
</script>

<style>
.tt-badge { position: relative; display: inline-flex; }
.tt-badge__content { position: absolute; top: -8rpx; right: -8rpx; background: var(--tt-destructive, #ef4444); border-radius: 19998rpx; min-width: 36rpx; height: 36rpx; display: flex; align-items: center; justify-content: center; padding: 0 10rpx; z-index: 1; }
.tt-badge__content--dot { min-width: 16rpx; height: 16rpx; padding: 0; top: -4rpx; right: -4rpx; }
.tt-badge__text { font-size: 22rpx; color: #fff; font-weight: 600; line-height: 1; }
</style>
