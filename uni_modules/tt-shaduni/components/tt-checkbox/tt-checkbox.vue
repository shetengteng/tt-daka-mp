<template>
  <view class="tt-checkbox" :class="{ 'tt-checkbox--checked': modelValue, 'tt-checkbox--disabled': disabled }" @click="handleClick">
    <view class="tt-checkbox__box">
      <tt-icon v-if="modelValue" name="ri-check-line" :size="24" color="var(--tt-primary-foreground, #fafafa)" />
    </view>
    <text v-if="label" class="tt-checkbox__label">{{ label }}</text>
    <slot />
  </view>
</template>

<script setup >import { checkboxProps } from "./props";
const props = defineProps(checkboxProps);
const emit = defineEmits();

function handleClick() {
  if (!props.disabled) {
    // 使用 setTimeout 避免点击时的同步渲染抖动
    setTimeout(() => {
      emit('update:modelValue', !props.modelValue);
    }, 0);
  }
}
</script>

<style>
.tt-checkbox { display: inline-flex; align-items: center; gap: 16rpx; cursor: pointer; -webkit-tap-highlight-color: transparent; user-select: none; touch-action: manipulation; }
.tt-checkbox--disabled { opacity: 0.5; cursor: not-allowed; }
.tt-checkbox__box { width: 36rpx; height: 36rpx; border: 1.10rpx solid var(--tt-border, #e5e5e5); border-radius: 8rpx; display: flex; align-items: center; justify-content: center; transition: all 0.15s; flex-shrink: 0; }
.tt-checkbox--checked .tt-checkbox__box { background: var(--tt-primary, #171717); border-color: var(--tt-primary, #171717); }
.tt-checkbox__label { font-size: 28rpx; color: var(--tt-foreground, #0a0a0a); -webkit-tap-highlight-color: transparent; user-select: none; }
/* 防止插槽内容抖动 */
.tt-checkbox > * { -webkit-tap-highlight-color: transparent; user-select: none; }
</style>
