<template>
  <view class="tt-search">
    <view class="tt-search__input-wrap">
      <text class="tt-search__icon">🔍</text>
      <input class="tt-search__input" :value="modelValue" :placeholder="placeholder" :disabled="disabled" :placeholder-style="'color: var(--tt-muted-foreground, #737373)'" @input="(e: any) => emit('update:modelValue', e.detail.value)" @confirm="emit('search', modelValue)" />
    </view>
    <text v-if="showCancel" class="tt-search__cancel" @click="emit('cancel')">Cancel</text>
  </view>
</template>

<script setup >import { searchProps } from "./props";
defineProps(searchProps);
const emit = defineEmits();
</script>

<style>
.tt-search { display: flex; align-items: center; gap: 16rpx; padding: 16rpx 24rpx; background: var(--tt-background, #ffffff); }
.tt-search__input-wrap { flex: 1; display: flex; align-items: center; gap: 12rpx; height: 72rpx; padding: 0 20rpx; background: var(--tt-muted, #f5f5f5); border-radius: var(--tt-radius, 12rpx); }
.tt-search__icon { font-size: 28rpx; }
.tt-search__input { flex: 1; font-size: 28rpx; color: var(--tt-foreground, #0a0a0a); background: transparent; border: none; height: 100%; }
.tt-search__cancel { font-size: 28rpx; color: var(--tt-primary, #171717); cursor: pointer; flex-shrink: 0; }
</style>
