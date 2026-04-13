<template>
  <view class="tt-breadcrumb">
    <template v-for="(item, i) in items" :key="i">
      <text v-if="i > 0" class="tt-breadcrumb__separator">{{ separator }}</text>
      <text class="tt-breadcrumb__item" :class="{ 'tt-breadcrumb__item--link': item.to, 'tt-breadcrumb__item--last': i === items.length - 1 }" @click="item.to && $emit('navigate', item.to)">{{ item.text }}</text>
    </template>
  </view>
</template>

<script setup >import { breadcrumbProps } from "./props";
defineProps(breadcrumbProps);
defineEmits(["navigate"]);
</script>

<style>
.tt-breadcrumb { display: flex; align-items: center; flex-wrap: wrap; gap: 8rpx; font-size: 26rpx; }
.tt-breadcrumb__separator { color: var(--tt-muted-foreground, #737373); }
.tt-breadcrumb__item { color: var(--tt-muted-foreground, #737373); }
.tt-breadcrumb__item--link { cursor: pointer; }
.tt-breadcrumb__item--link:hover { color: var(--tt-foreground, #0a0a0a); }
.tt-breadcrumb__item--last { color: var(--tt-foreground, #0a0a0a); font-weight: 500; }
</style>
