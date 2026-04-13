<template>
  <view class="tt-number-box" :class="{ 'tt-number-box--disabled': disabled }">
    <view class="tt-number-box__btn" @click="!disabled && modelValue > min && emit('update:modelValue', modelValue - step)"><text>−</text></view>
    <text class="tt-number-box__value">{{ modelValue }}</text>
    <view class="tt-number-box__btn" @click="!disabled && modelValue < max && emit('update:modelValue', modelValue + step)"><text>+</text></view>
  </view>
</template>

<script setup >import { numberBoxProps } from "./props";
defineProps(numberBoxProps);
const emit = defineEmits();
</script>

<style>
.tt-number-box { display: inline-flex; align-items: center; border: 2rpx solid var(--tt-border, #e5e5e5); border-radius: var(--tt-radius, 12rpx); overflow: hidden; }
.tt-number-box--disabled { opacity: 0.5; }
.tt-number-box__btn { width: 64rpx; height: 64rpx; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--tt-foreground, #0a0a0a); font-size: 32rpx; background: var(--tt-muted, #f5f5f5); }
.tt-number-box__value { min-width: 80rpx; height: 64rpx; display: flex; align-items: center; justify-content: center; font-size: 28rpx; color: var(--tt-foreground, #0a0a0a); }
</style>
