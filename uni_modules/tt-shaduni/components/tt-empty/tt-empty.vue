<template>
  <view class="tt-empty">
    <slot name="image"><text class="tt-empty__icon">📭</text></slot>
    <text class="tt-empty__desc">{{ description }}</text>
    <slot />
  </view>
</template>

<script setup >import { emptyProps } from "./props";
defineProps(emptyProps);
</script>

<style>
.tt-empty { display: flex; flex-direction: column; align-items: center; padding: 80rpx 0; }
.tt-empty__icon { font-size: 96rpx; margin-bottom: 24rpx; }
.tt-empty__desc { font-size: 28rpx; color: var(--tt-muted-foreground, #737373); }
</style>
