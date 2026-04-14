<template>
  <view v-if="show" class="tt-toast" :class="{ 'tt-toast--fade': fading }">
    <view class="tt-toast__content">
      <view v-if="type === 'loading'" class="tt-toast__icon"><view class="tt-toast__spinner" /></view>
      <view v-else-if="type === 'success'" class="tt-toast__icon"><tt-icon name="ri-checkbox-circle-line" :size="56" color="#fff" /></view>
      <view v-else-if="type === 'fail'" class="tt-toast__icon"><tt-icon name="ri-close-circle-line" :size="56" color="#fff" /></view>
      <text class="tt-toast__text">{{ message }}</text>
    </view>
  </view>
</template>

<script setup >import { watch, ref, onBeforeUnmount } from "vue";
import { toastProps } from "./props";
const props = defineProps(toastProps);
const emit = defineEmits();
const fading = ref(false);
let timer = null;
function scheduleClose() {
  clearTimer();
  if (!props.show || props.type === "loading" || props.duration <= 0) return;
  timer = setTimeout(() => {
    fading.value = true;
    setTimeout(() => {
      fading.value = false;
      emit("update:show", false);
    }, 200);
  }, props.duration);
}
function clearTimer() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
}
watch(() => props.show, (v) => {
  if (v) scheduleClose();
}, { immediate: true });
onBeforeUnmount(clearTimer);
</script>

<style>
.tt-toast {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  pointer-events: none;
  animation: tt-toast-in .2s ease;
}
.tt-toast--fade { animation: tt-toast-out .2s ease forwards; }
.tt-toast__content {
  background: rgba(0, 0, 0, 0.72);
  color: #fff;
  padding: 24rpx 48rpx;
  border-radius: calc(var(--tt-radius, 12rpx) + 4rpx);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  max-width: 400rpx;
  backdrop-filter: blur(8rpx);
  -webkit-backdrop-filter: blur(8rpx);
}
.tt-toast__icon { font-size: 56rpx; }
.tt-toast__spinner {
  width: 48rpx; height: 48rpx;
  border: 4rpx solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: tt-spin 0.6s linear infinite;
}
.tt-toast__text { font-size: 28rpx; text-align: center; line-height: 1.4; }
@keyframes tt-spin { to { transform: rotate(360deg); } }
@keyframes tt-toast-in { from { opacity: 0; transform: scale(.85); } to { opacity: 1; transform: scale(1); } }
@keyframes tt-toast-out { from { opacity: 1; } to { opacity: 0; } }
</style>
