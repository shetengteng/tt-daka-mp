<template>
  <view class="tt-form-item">
    <view class="tt-form-item__label">
      <text v-if="required" class="tt-form-item__required">*</text>
      <text>{{ label }}</text>
    </view>
    <view class="tt-form-item__content"><slot /></view>
  </view>
</template>

<script setup >import { formItemProps } from "./props";
defineProps(formItemProps);
</script>

<style>
.tt-form-item { display: flex; align-items: flex-start; margin-bottom: 32rpx; }
.tt-form-item__label { width: 160rpx; font-size: 28rpx; color: var(--tt-foreground, #0a0a0a); padding-top: 20rpx; flex-shrink: 0; }
.tt-form-item__required { color: var(--tt-destructive, #ef4444); margin-right: 4rpx; }
.tt-form-item__content { flex: 1; }
</style>
