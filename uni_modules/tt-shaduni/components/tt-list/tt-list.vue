<template>
  <view class="tt-list">
    <slot />
    <view v-if="loading" class="tt-list__loading">
      <text class="tt-list__text">{{ loadingText }}</text>
    </view>
    <view v-else-if="finished" class="tt-list__finished">
      <text class="tt-list__text">{{ finishedText }}</text>
    </view>
  </view>
</template>

<script setup >import { listProps } from "./props";
defineProps(listProps);
defineEmits(["load"]);
</script>

<style>
.tt-list__loading, .tt-list__finished { display: flex; align-items: center; justify-content: center; padding: 32rpx 0; }
.tt-list__text { font-size: 26rpx; color: var(--tt-muted-foreground, #737373); }
</style>
