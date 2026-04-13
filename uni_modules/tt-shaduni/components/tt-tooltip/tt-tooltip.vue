<template>
  <view class="tt-tooltip" @click="visible = !visible">
    <slot />
    <view v-if="visible || show" class="tt-tooltip__popup" :class="`tt-tooltip__popup--${placement}`">
      <text class="tt-tooltip__content">{{ content }}</text>
    </view>
  </view>
</template>

<script setup >import { ref } from "vue";
import { tooltipProps } from "./props";
const props = defineProps(tooltipProps);
const visible = ref(false);
</script>

<style>
.tt-tooltip { position: relative; display: inline-flex; }
.tt-tooltip__popup { position: absolute; z-index: 10; white-space: nowrap; animation: tt-tooltip-in .15s ease; }
.tt-tooltip__content { display: block; padding: 12rpx 20rpx; background: var(--tt-foreground, #0a0a0a); color: var(--tt-background, #fff); font-size: 24rpx; border-radius: var(--tt-radius, 12rpx); line-height: 1.4; }
.tt-tooltip__popup--top { bottom: calc(100% + 12rpx); left: 50%; transform: translateX(-50%); }
.tt-tooltip__popup--bottom { top: calc(100% + 12rpx); left: 50%; transform: translateX(-50%); }
.tt-tooltip__popup--left { right: calc(100% + 12rpx); top: 50%; transform: translateY(-50%); }
.tt-tooltip__popup--right { left: calc(100% + 12rpx); top: 50%; transform: translateY(-50%); }
@keyframes tt-tooltip-in { from { opacity: 0; transform: translateX(-50%) translateY(4rpx); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
</style>
