<template>
  <view class="tt-empty">
    <slot name="image">
      <view class="tt-empty__icon">
        <tt-icon name="ri-inbox-line" :size="96" color="var(--tt-muted-foreground, #737373)" />
      </view>
    </slot>
    <text class="tt-empty__desc">{{ description }}</text>
    <slot />
  </view>
</template>

<script setup >import { emptyProps } from "./props";
defineProps(emptyProps);
</script>

<style>
.tt-empty { display: flex; flex-direction: column; align-items: center; padding: 80rpx 0; }
.tt-empty__icon { margin-bottom: 24rpx; }
.tt-empty__desc { font-size: 28rpx; color: var(--tt-muted-foreground, #737373); }
</style>
