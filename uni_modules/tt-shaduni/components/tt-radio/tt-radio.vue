<template>
  <view class="tt-radio" :class="{ 'tt-radio--checked': modelValue, 'tt-radio--disabled': disabled }" @click="!disabled && emit('update:modelValue', true)">
    <view class="tt-radio__circle">
      <view v-if="modelValue" class="tt-radio__dot" />
    </view>
    <text v-if="label" class="tt-radio__label">{{ label }}</text>
    <slot />
  </view>
</template>

<script setup >import { radioProps } from "./props";
defineProps(radioProps);
const emit = defineEmits();
</script>

<style>
.tt-radio { display: inline-flex; align-items: center; gap: 16rpx; cursor: pointer; }
.tt-radio--disabled { opacity: 0.5; cursor: not-allowed; }
.tt-radio__circle { width: 36rpx; height: 36rpx; border: 1.10rpx solid var(--tt-border, #e5e5e5); border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.15s; flex-shrink: 0; }
.tt-radio--checked .tt-radio__circle { border-color: var(--tt-primary, #171717); }
.tt-radio__dot { width: 20rpx; height: 20rpx; border-radius: 50%; background: var(--tt-primary, #171717); }
.tt-radio__label { font-size: 28rpx; color: var(--tt-foreground, #0a0a0a); }
</style>
