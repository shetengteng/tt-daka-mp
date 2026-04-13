<template>
  <view class="tt-cell" :class="{ 'tt-cell--border': border, 'tt-cell--link': isLink }" @click="emit('click')">
    <view class="tt-cell__left">
      <slot name="icon"><text v-if="icon" class="tt-cell__icon">{{ icon }}</text></slot>
      <view class="tt-cell__title-wrap">
        <text class="tt-cell__title">{{ title }}</text>
        <text v-if="label" class="tt-cell__label">{{ label }}</text>
      </view>
    </view>
    <view class="tt-cell__right">
      <slot><text class="tt-cell__value">{{ value }}</text></slot>
      <text v-if="isLink" class="tt-cell__arrow">›</text>
    </view>
  </view>
</template>

<script setup >import { cellProps } from "./props";
defineProps(cellProps);
const emit = defineEmits();
</script>

<style>
.tt-cell { display: flex; align-items: center; justify-content: space-between; padding: 24rpx 32rpx; background: var(--tt-background, #ffffff); }
.tt-cell--border { border-bottom: 2rpx solid var(--tt-border, #e5e5e5); }
.tt-cell--link { cursor: pointer; }
.tt-cell__left { display: flex; align-items: center; gap: 20rpx; flex: 1; min-width: 0; }
.tt-cell__icon { font-size: 36rpx; }
.tt-cell__title-wrap { display: flex; flex-direction: column; }
.tt-cell__title { font-size: 28rpx; color: var(--tt-foreground, #0a0a0a); }
.tt-cell__label { font-size: 24rpx; color: var(--tt-muted-foreground, #737373); margin-top: 4rpx; }
.tt-cell__right { display: flex; align-items: center; gap: 8rpx; flex-shrink: 0; }
.tt-cell__value { font-size: 28rpx; color: var(--tt-muted-foreground, #737373); }
.tt-cell__arrow { font-size: 40rpx; color: var(--tt-muted-foreground, #737373); }
</style>
