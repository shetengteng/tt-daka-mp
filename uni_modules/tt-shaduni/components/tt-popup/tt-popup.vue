<template>
  <view v-if="show" class="tt-popup" :class="`tt-popup--${position}`">
    <view
      v-if="overlay"
      class="tt-popup__overlay"
      @click="handleOverlayClick"
    />
    <view
      class="tt-popup__content"
      :class="contentClass"
      :style="contentStyle"
    >
      <view
        v-if="closeable"
        class="tt-popup__close"
        @click="handleClose"
      >
        <text class="tt-popup__close-icon">×</text>
      </view>
      <slot />
    </view>
  </view>
</template>

<script setup >import { computed } from "vue";
import { popupProps } from "./props";
const props = defineProps(popupProps);
const emit = defineEmits();
const contentClass = computed(() => ({
  "tt-popup__content--round": props.round
}));
const contentStyle = computed(() => ({
  animationDuration: `${props.duration}ms`
}));
function handleOverlayClick() {
  handleClose();
}
function handleClose() {
  emit("update:show", false);
  emit("close");
}
</script>

<style>
.tt-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
}

.tt-popup--center {
  align-items: center;
  justify-content: center;
}

.tt-popup--bottom {
  align-items: flex-end;
}

.tt-popup--top {
  align-items: flex-start;
}

.tt-popup--left {
  justify-content: flex-start;
}

.tt-popup--right {
  justify-content: flex-end;
}

.tt-popup__overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
}

.tt-popup__content {
  position: relative;
  z-index: 1;
  background-color: var(--tt-background, #ffffff);
  animation: tt-popup-fade-in 0.3s ease;
}

.tt-popup--center .tt-popup__content {
  border-radius: calc(var(--tt-radius, 12rpx) + 8rpx);
  max-width: 85vw;
}

.tt-popup--bottom .tt-popup__content {
  width: 100%;
  border-radius: calc(var(--tt-radius, 12rpx) + 8rpx) calc(var(--tt-radius, 12rpx) + 8rpx) 0 0;
  animation-name: tt-popup-slide-up;
}

.tt-popup--top .tt-popup__content {
  width: 100%;
  border-radius: 0 0 calc(var(--tt-radius, 12rpx) + 8rpx) calc(var(--tt-radius, 12rpx) + 8rpx);
  animation-name: tt-popup-slide-down;
}

.tt-popup__content--round {
  border-radius: calc(var(--tt-radius, 12rpx) + 16rpx);
}

.tt-popup__close {
  position: absolute;
  top: 24rpx;
  right: 24rpx;
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1;
}

.tt-popup__close-icon {
  font-size: 40rpx;
  color: var(--tt-muted-foreground, #737373);
  line-height: 1;
}

@keyframes tt-popup-fade-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes tt-popup-slide-up {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

@keyframes tt-popup-slide-down {
  from { transform: translateY(-100%); }
  to { transform: translateY(0); }
}
</style>
