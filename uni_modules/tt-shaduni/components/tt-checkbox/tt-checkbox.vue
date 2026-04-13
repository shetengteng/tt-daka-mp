<template>
  <view class="tt-checkbox" :class="{ 'tt-checkbox--checked': modelValue, 'tt-checkbox--disabled': disabled }" @click="!disabled && emit('update:modelValue', !modelValue)">
    <view class="tt-checkbox__box">
      <text v-if="modelValue" class="tt-checkbox__check">✓</text>
    </view>
    <text v-if="label" class="tt-checkbox__label">{{ label }}</text>
    <slot />
  </view>
</template>

<script setup >import { checkboxProps } from "./props";
defineProps(checkboxProps);
const emit = defineEmits();
</script>

<style>
.tt-checkbox { display: inline-flex; align-items: center; gap: 16rpx; cursor: pointer; }
.tt-checkbox--disabled { opacity: 0.5; cursor: not-allowed; }
.tt-checkbox__box { width: 36rpx; height: 36rpx; border: 1.10rpx solid var(--tt-border, #e5e5e5); border-radius: 8rpx; display: flex; align-items: center; justify-content: center; transition: all 0.15s; flex-shrink: 0; }
.tt-checkbox--checked .tt-checkbox__box { background: var(--tt-primary, #171717); border-color: var(--tt-primary, #171717); }
.tt-checkbox__check { font-size: 24rpx; color: var(--tt-primary-foreground, #fafafa); line-height: 1; }
.tt-checkbox__label { font-size: 28rpx; color: var(--tt-foreground, #0a0a0a); }
</style>
