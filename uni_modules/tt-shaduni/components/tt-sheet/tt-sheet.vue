<template>
  <tt-popup :show="show" :position="position" closeable round @update:show="emit('update:show', $event)">
    <view class="tt-sheet">
      <view v-if="title" class="tt-sheet__header"><text class="tt-sheet__title">{{ title }}</text></view>
      <view class="tt-sheet__body"><slot /></view>
    </view>
  </tt-popup>
</template>

<script setup >import { sheetProps } from "./props";
defineProps(sheetProps);
const emit = defineEmits();
</script>

<style>
.tt-sheet { min-height: 400rpx; }
.tt-sheet__header { padding: 32rpx 40rpx; border-bottom: 2rpx solid var(--tt-border, #e5e5e5); }
.tt-sheet__title { font-size: 32rpx; font-weight: 600; color: var(--tt-foreground, #0a0a0a); }
.tt-sheet__body { padding: 40rpx; }
</style>
