<template>
  <view class="tt-loading" :class="{ 'tt-loading--vertical': vertical }">
    <view class="tt-loading__spinner" :style="spinnerStyle" />
    <text v-if="text" class="tt-loading__text">{{ text }}</text>
  </view>
</template>

<script setup >import { computed } from "vue";
import { loadingProps } from "./props";
const props = defineProps(loadingProps);
const spinnerStyle = computed(() => {
  const s = typeof props.size === "number" ? props.size + "px" : props.size;
  return {
    width: s,
    height: s,
    ...props.color ? { borderTopColor: props.color } : {}
  };
});
</script>

<style>
.tt-loading { display: inline-flex; align-items: center; gap: 16rpx; }
.tt-loading--vertical { flex-direction: column; }
.tt-loading__spinner { border: 4rpx solid var(--tt-muted, #f5f5f5); border-top-color: var(--tt-primary, #171717); border-radius: 50%; animation: tt-spin 0.6s linear infinite; }
.tt-loading__text { font-size: 28rpx; color: var(--tt-muted-foreground, #737373); }
@keyframes tt-spin { to { transform: rotate(360deg); } }
</style>
