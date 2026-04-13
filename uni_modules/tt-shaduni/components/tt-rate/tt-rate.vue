<template>
  <view class="tt-rate">
    <text v-for="i in count" :key="i" class="tt-rate__star" :class="{ 'tt-rate__star--active': i <= modelValue }" :style="{ fontSize: (typeof size === 'number' ? size + 'px' : size) }" @click="!disabled && !readonly && emit('update:modelValue', i)">★</text>
  </view>
</template>

<script setup >import { rateProps } from "./props";
defineProps(rateProps);
const emit = defineEmits();
</script>

<style>
.tt-rate { display: inline-flex; gap: 4rpx; }
.tt-rate__star { color: var(--tt-muted, #f5f5f5); cursor: pointer; transition: color 0.15s; }
.tt-rate__star--active { color: var(--tt-warning, #f59e0b); }
</style>
