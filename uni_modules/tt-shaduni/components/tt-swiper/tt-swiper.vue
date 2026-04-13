<template>
  <view class="tt-swiper">
    <swiper :autoplay="autoplay" :interval="interval" :duration="duration" :circular="circular" :indicator-dots="indicatorDots" :indicator-color="indicatorColor" :indicator-active-color="indicatorActiveColor || 'var(--tt-primary, #171717)'" :current="current" class="tt-swiper__inner" @change="$emit('change', $event.detail.current)">
      <slot />
    </swiper>
  </view>
</template>

<script setup >import { swiperProps } from "./props";
defineProps(swiperProps);
defineEmits(["change"]);
</script>

<style>
.tt-swiper { width: 100%; overflow: hidden; border-radius: var(--tt-radius, 12rpx); }
.tt-swiper__inner { width: 100%; height: 100%; }
</style>
