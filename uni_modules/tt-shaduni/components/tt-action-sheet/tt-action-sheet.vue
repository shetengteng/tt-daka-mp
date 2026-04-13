<template>
  <tt-popup :show="show" position="bottom" @update:show="emit('update:show', $event)">
    <view class="tt-action-sheet">
      <text v-if="title" class="tt-action-sheet__title">{{ title }}</text>
      <view v-for="(action, i) in actions" :key="i" class="tt-action-sheet__item" :class="{ 'tt-action-sheet__item--disabled': action.disabled }" :style="{ color: action.color }" @click="!action.disabled && (emit('select', action), emit('update:show', false))">
        <text>{{ action.name }}</text>
      </view>
      <view class="tt-action-sheet__gap" />
      <view class="tt-action-sheet__cancel" @click="emit('cancel'); emit('update:show', false)">
        <text>{{ cancelText }}</text>
      </view>
    </view>
  </tt-popup>
</template>

<script setup >import { actionSheetProps } from "./props";
defineProps(actionSheetProps);
const emit = defineEmits();
</script>

<style>
.tt-action-sheet { background: var(--tt-background, #ffffff); }
.tt-action-sheet__title { display: block; text-align: center; padding: 32rpx; font-size: 28rpx; color: var(--tt-muted-foreground, #737373); border-bottom: 2rpx solid var(--tt-border, #e5e5e5); }
.tt-action-sheet__item { padding: 32rpx; text-align: center; font-size: 32rpx; color: var(--tt-foreground, #0a0a0a); cursor: pointer; transition: background 0.15s; }
.tt-action-sheet__item--disabled { opacity: 0.4; cursor: not-allowed; }
.tt-action-sheet__gap { height: 16rpx; background: var(--tt-muted, #f5f5f5); }
.tt-action-sheet__cancel { padding: 32rpx; text-align: center; font-size: 32rpx; color: var(--tt-foreground, #0a0a0a); cursor: pointer; }
</style>
