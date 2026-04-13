<template>
  <view class="tt-switch" :class="{ 'tt-switch--on': modelValue, 'tt-switch--disabled': disabled, ['tt-switch--' + size]: true }" @click="!disabled && emit('update:modelValue', !modelValue)" :style="modelValue && activeColor ? { backgroundColor: activeColor } : {}">
    <view class="tt-switch__thumb" />
  </view>
</template>

<script setup >import { switchProps } from "./props";
defineProps(switchProps);
const emit = defineEmits();
</script>

<style>
.tt-switch { width: 88rpx; height: 48rpx; border-radius: 24rpx; background: var(--tt-disabled, #D4D4D8); position: relative; cursor: pointer; transition: background 0.3s; flex-shrink: 0; }
.tt-switch--sm { width: 72rpx; height: 40rpx; border-radius: 20rpx; }
.tt-switch--on { background: var(--tt-primary, #171717); }
.tt-switch--disabled { opacity: 0.5; cursor: not-allowed; }
.tt-switch__thumb { width: 40rpx; height: 40rpx; border-radius: 50%; background: var(--tt-background, #fff); position: absolute; top: 4rpx; left: 4rpx; transition: transform 0.3s, background 0.3s; box-shadow: 0 2rpx 6rpx rgba(0,0,0,0.1); }
.tt-switch--on .tt-switch__thumb { transform: translateX(40rpx); background: var(--tt-primary-foreground, #fafafa); }
.tt-switch--sm .tt-switch__thumb { width: 32rpx; height: 32rpx; }
.tt-switch--sm.tt-switch--on .tt-switch__thumb { transform: translateX(32rpx); }
</style>
