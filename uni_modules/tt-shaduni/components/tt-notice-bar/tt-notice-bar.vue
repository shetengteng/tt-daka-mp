<template>
  <view v-if="visible" class="tt-notice-bar" :style="{ color: color || undefined, backgroundColor: background || undefined }">
    <text class="tt-notice-bar__icon">📢</text>
    <view class="tt-notice-bar__content">
      <text class="tt-notice-bar__text" :class="{ 'tt-notice-bar__text--scroll': scrollable }">{{ text }}</text>
    </view>
    <text v-if="closeable" class="tt-notice-bar__close" @click="onClose">×</text>
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
  background: rgba(245, 158, 11, 0.12);
  color: #92400e;
  font-size: 26rpx;
  gap: 16rpx;
  border-radius: var(--tt-radius, 12rpx);
  overflow: hidden;
}
.tt-notice-bar__icon { font-size: 28rpx; flex-shrink: 0; }
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
.tt-notice-bar__close { font-size: 32rpx; cursor: pointer; flex-shrink: 0; opacity: 0.8; }
.tt-notice-bar__close:active { opacity: 1; }
</style>
