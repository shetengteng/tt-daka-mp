<template>
  <view class="tt-image" :style="{ width, height, borderRadius: radius }">
    <image class="tt-image__img" :src="src" :mode="mode" :lazy-load="lazyLoad" />
  </view>
</template>

<script setup >import { imageProps } from "./props";
defineProps(imageProps);
</script>

<style>
.tt-image { overflow: hidden; display: inline-block; }
.tt-image__img { width: 100%; height: 100%; display: block; }
</style>
