<template>
  <view class="tt-textarea" :class="{ 'tt-textarea--disabled': disabled, 'tt-textarea--focused': focused }">
    <textarea class="tt-textarea__inner" :value="modelValue" :placeholder="placeholder" :maxlength="maxlength" :disabled="disabled" :auto-height="autoHeight" :placeholder-style="'color: var(--tt-muted-foreground, #737373)'" @input="(e: any) => emit('update:modelValue', e.detail.value)" @focus="focused = true" @blur="focused = false" />
    <text v-if="showCount" class="tt-textarea__count">{{ String(modelValue).length }}{{ maxlength > 0 ? '/' + maxlength : '' }}</text>
  </view>
</template>

<script setup >import { ref } from "vue";
import { textareaProps } from "./props";
defineProps(textareaProps);
const emit = defineEmits();
const focused = ref(false);
</script>

<style>
.tt-textarea { border: 2rpx solid var(--tt-input, #e5e5e5); border-radius: var(--tt-radius, 12rpx); padding: 20rpx 24rpx; background: var(--tt-background, #ffffff); transition: border-color 0.2s, box-shadow 0.2s; box-sizing: border-box; }
.tt-textarea--focused { border-color: var(--tt-ring, #a3a3a3); box-shadow: 0 0 0 4rpx rgba(163, 163, 163, 0.2); }
.tt-textarea--disabled { opacity: 0.5; }
.tt-textarea__inner { width: 100%; font-size: 28rpx; color: var(--tt-foreground, #0a0a0a); background: transparent; border: none; outline: none; min-height: 160rpx; line-height: 1.6; }
.tt-textarea__count { font-size: 24rpx; color: var(--tt-muted-foreground, #737373); text-align: right; display: block; margin-top: 8rpx; }
</style>
