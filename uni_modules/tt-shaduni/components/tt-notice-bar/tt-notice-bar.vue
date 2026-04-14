<template>
  <view v-if="visible" class="tt-notice-bar" :style="{ color: color || undefined, backgroundColor: background || undefined }">
    <tt-icon class="tt-notice-bar__icon" name="ri-notification-line" :size="32" color="currentColor" />
    <view class="tt-notice-bar__content">
      <text class="tt-notice-bar__text" :class="{ 'tt-notice-bar__text--scroll': scrollable }">{{ text }}</text>
    </view>
    <tt-icon v-if="closeable" class="tt-notice-bar__close" name="ri-close-line" :size="32" color="currentColor" @click="onClose" />
  </view>
</template>

<script setup >import { ref } from "vue";
import { noticeBarProps } from "./props";
defineProps(noticeBarProps);
const emit = defineEmits();
const visible = ref(true);
function onClose() {
  visible.value = false;
  emit("close");
}
</script>

<style>
.tt-notice-bar {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  background: rgba(249, 115, 22, 0.12);
  color: var(--tt-warning, #f97316);
  font-size: 26rpx;
  gap: 16rpx;
  border-radius: var(--tt-radius, 12rpx);
  overflow: hidden;
}
.tt-notice-bar__icon { flex-shrink: 0; }
.tt-notice-bar__content { flex: 1; overflow: hidden; }
.tt-notice-bar__text { white-space: nowrap; display: inline-block; }
.tt-notice-bar__text--scroll {
  animation: tt-notice-scroll 8s linear infinite;
  padding-left: 100%;
}
@keyframes tt-notice-scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-100%); }
}
.tt-notice-bar__close { cursor: pointer; opacity: 0.8; }
.tt-notice-bar__close:active { opacity: 1; }
</style>
