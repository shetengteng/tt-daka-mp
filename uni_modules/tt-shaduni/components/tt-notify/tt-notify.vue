<template>
  <view
    v-if="effectiveShow"
    class="tt-notify"
    :class="[
      `tt-notify--${effectiveType}`,
      `tt-notify--${effectivePosition}`,
      { 'tt-notify--fade-out': fading }
    ]"
    :style="[positionStyle, customStyle]"
  >
    <view class="tt-notify__content">
      <tt-icon
        v-if="iconName"
        class="tt-notify__icon"
        :name="iconName"
        :size="32"
        :color="iconColor"
      />
      <text class="tt-notify__message">{{ effectiveMessage }}</text>
    </view>
  </view>
</template>

<script setup >import { computed, ref, watch, onBeforeUnmount } from "vue";
import { notifyProps } from "./props";
import { notifyState } from "./store";
const props = defineProps(notifyProps);
const emit = defineEmits();
const fading = ref(false);
let fadeTimer = null;
function clearFadeTimer() {
  if (fadeTimer) {
    clearTimeout(fadeTimer);
    fadeTimer = null;
  }
}
onBeforeUnmount(clearFadeTimer);
const isControlled = computed(() => props.show);
const effectiveShow = computed(() => {
  if (isControlled.value) return props.show;
  return notifyState.show;
});
const effectiveMessage = computed(() => {
  if (isControlled.value) return props.message;
  return notifyState.message;
});
const effectiveType = computed(() => {
  if (isControlled.value) return props.type;
  return notifyState.type;
});
const effectivePosition = computed(() => {
  if (isControlled.value) return props.position;
  return notifyState.position;
});
const effectiveDuration = computed(() => {
  if (isControlled.value) return props.duration;
  return notifyState.duration;
});
const customIcon = computed(() => {
  if (isControlled.value) return props.icon;
  return notifyState.icon;
});
const customColor = computed(() => {
  if (isControlled.value) return props.color;
  return notifyState.color;
});
const customBackground = computed(() => {
  if (isControlled.value) return props.background;
  return notifyState.background;
});
const iconName = computed(() => {
  if (customIcon.value) return customIcon.value;
  const map = {
    info: "ri-information-line",
    success: "ri-checkbox-circle-line",
    warning: "ri-error-warning-line",
    error: "ri-close-circle-line",
    primary: ""
  };
  return map[effectiveType.value] || "";
});
const iconColor = computed(() => customColor.value || "#ffffff");
const customStyle = computed(() => {
  const style = {};
  if (customColor.value) style.color = customColor.value;
  if (customBackground.value) style.backgroundColor = customBackground.value;
  return style;
});
const statusBarHeight = ref(0);
try {
  statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight || 0;
} catch (e) {
}
const positionStyle = computed(() => {
  if (effectivePosition.value !== "top") return {};
  if (!props.safeAreaInsetTop) return {};
  return { paddingTop: `${statusBarHeight.value}px` };
});
watch(
  () => isControlled.value ? props.show : notifyState.show,
  (val) => {
    if (!val) {
      clearFadeTimer();
      fading.value = true;
      fadeTimer = setTimeout(() => {
        fading.value = false;
      }, 200);
    }
  }
);
watch(
  () => isControlled.value ? props.show : null,
  (val) => {
    if (!isControlled.value) return;
    if (val && props.duration > 0) {
      clearFadeTimer();
      fadeTimer = setTimeout(() => {
        emit("update:show", false);
        emit("close");
      }, props.duration);
    }
  },
  { immediate: true }
);
</script>

<style>
.tt-notify {
  position: fixed;
  left: 0;
  right: 0;
  z-index: 2100;
  padding: 24rpx 32rpx;
  font-size: 28rpx;
  line-height: 1.4;
  color: #ffffff;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  animation: tt-notify-in 0.2s ease;
}

.tt-notify__content {
  display: flex;
  align-items: center;
  gap: 16rpx;
  justify-content: center;
  text-align: center;
}

.tt-notify__icon {
  flex-shrink: 0;
}

.tt-notify__message {
  font-size: 28rpx;
  line-height: 1.4;
  color: inherit;
  word-break: break-word;
}

.tt-notify--top {
  top: 0;
  animation-name: tt-notify-slide-down;
}

.tt-notify--bottom {
  bottom: 0;
  animation-name: tt-notify-slide-up;
}

.tt-notify--fade-out {
  animation: tt-notify-fade-out 0.2s ease forwards;
}

.tt-notify--primary {
  background-color: var(--tt-primary, #171717);
  color: var(--tt-primary-foreground, #fafafa);
}

.tt-notify--info {
  background-color: var(--tt-foreground, #171717);
  color: var(--tt-primary-foreground, #fafafa);
}

.tt-notify--success {
  background-color: var(--tt-success, #22c55e);
  color: var(--tt-success-foreground, #ffffff);
}

.tt-notify--warning {
  background-color: var(--tt-warning, #f59e0b);
  color: var(--tt-warning-foreground, #ffffff);
}

.tt-notify--error {
  background-color: var(--tt-destructive, #ef4444);
  color: var(--tt-destructive-foreground, #ffffff);
}

@keyframes tt-notify-slide-down {
  from { transform: translateY(-100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes tt-notify-slide-up {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes tt-notify-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes tt-notify-fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}
</style>
