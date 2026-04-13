<template>
  <view class="tt-divider" :class="['tt-divider--' + direction, 'tt-divider--' + contentPosition]">
    <slot />
  </view>
</template>

<script setup >import { dividerProps } from "./props";
defineProps(dividerProps);
</script>

<style>
.tt-divider { display: flex; align-items: center; color: var(--tt-muted-foreground, #737373); font-size: 26rpx; }
.tt-divider--horizontal { width: 100%; }
.tt-divider--horizontal::before, .tt-divider--horizontal::after { content: ''; flex: 1; height: 2rpx; background: var(--tt-border, #e5e5e5); }
.tt-divider--horizontal::before { margin-right: 24rpx; }
.tt-divider--horizontal::after { margin-left: 24rpx; }
.tt-divider--left::before { flex: 0; max-width: 0; margin: 0; }
.tt-divider--right::after { flex: 0; max-width: 0; margin: 0; }
.tt-divider--vertical { height: 1em; width: 2rpx; background: var(--tt-border, #e5e5e5); display: inline-block; margin: 0 16rpx; vertical-align: middle; }
</style>
