<template>
  <view class="tt-tooltip" :id="rootId">
    <view :id="triggerId" class="tt-tooltip__trigger" @click="onTriggerClick">
      <slot />
    </view>
    <view
      v-if="innerVisible"
      :id="popupId"
      class="tt-tooltip__popup"
      :style="popupStyle"
      @click.stop="onPopupClick"
    >
      <view class="tt-tooltip__inner" :class="`tt-tooltip__inner--${variant}`">
        <slot name="content">
          <text v-if="content" class="tt-tooltip__text">{{ content }}</text>
        </slot>
      </view>
      <view
        v-if="arrow"
        class="tt-tooltip__arrow"
        :class="[`tt-tooltip__arrow--${actualPlacement}`, `tt-tooltip__arrow--${variant}`]"
        :style="arrowStyle"
      />
    </view>
    <view
      v-if="innerVisible && closeOnClickOutside"
      class="tt-tooltip__backdrop"
      @click="hide"
    />
  </view>
</template>

<script setup >import { computed, getCurrentInstance, nextTick, onMounted, ref, watch } from "vue";
import { tooltipProps } from "./props";
const props = defineProps(tooltipProps);
const emit = defineEmits();
const uid = (Math.random() + Date.now()).toString(36).replace(".", "");
const rootId = `tt-tt-${uid}`;
const triggerId = `tt-tt-trg-${uid}`;
const popupId = `tt-tt-pop-${uid}`;
const internalVisible = ref(props.show);
const actualPlacement = ref(props.placement);
const popupPos = ref(null);
const arrowOffset = ref(null);
watch(() => props.show, (val) => {
  internalVisible.value = val;
});
const innerVisible = computed({
  get: () => internalVisible.value,
  set: (val) => {
    internalVisible.value = val;
    emit("update:show", val);
  }
});
function scheduleReposition() {
  actualPlacement.value = props.placement;
  popupPos.value = null;
  arrowOffset.value = null;
  nextTick(() => {
    reposition();
  });
}
watch(internalVisible, (val) => {
  if (val) scheduleReposition();
});
onMounted(() => {
  if (internalVisible.value) scheduleReposition();
});
function onTriggerClick() {
  if (props.trigger !== "click") return;
  innerVisible.value = !innerVisible.value;
}
function onPopupClick() {
}
function hide() {
  innerVisible.value = false;
}
const popupStyle = computed(() => {
  if (popupPos.value) {
    return {
      position: "fixed",
      left: `${popupPos.value.left}px`,
      top: `${popupPos.value.top}px`,
      transform: "none"
    };
  }
  return {
    position: "fixed",
    left: "-9999px",
    top: "-9999px",
    transform: "none"
  };
});
const arrowStyle = computed(() => {
  if (arrowOffset.value == null) return {};
  const place = actualPlacement.value;
  if (place === "top" || place === "bottom") {
    return { left: `${arrowOffset.value}px`, transform: "translateX(-50%) rotate(45deg)" };
  }
  return { top: `${arrowOffset.value}px`, transform: "translateY(-50%) rotate(45deg)" };
});
function getProxy() {
  const inst = getCurrentInstance();
  return inst?.proxy ?? null;
}
function queryRect(id) {
  return new Promise((resolve) => {
    if (typeof uni === "undefined" || !uni.createSelectorQuery) {
      resolve(null);
      return;
    }
    const proxy = getProxy();
    let q;
    try {
      q = uni.createSelectorQuery();
      if (proxy) {
        const inProxy = q.in;
        if (typeof inProxy === "function") {
          q = inProxy.call(q, proxy);
        }
      }
    } catch {
      resolve(null);
      return;
    }
    q.select(`#${id}`).boundingClientRect((rect) => {
      if (!rect || Array.isArray(rect)) {
        resolve(null);
        return;
      }
      resolve(rect);
    }).exec();
  });
}
function getWindowSize() {
  if (typeof uni !== "undefined" && uni.getSystemInfoSync) {
    try {
      const info = uni.getSystemInfoSync();
      return {
        windowWidth: info.windowWidth ?? info.screenWidth ?? 375,
        windowHeight: info.windowHeight ?? info.screenHeight ?? 667
      };
    } catch {
    }
  }
  if (typeof window !== "undefined") {
    return { windowWidth: window.innerWidth, windowHeight: window.innerHeight };
  }
  return { windowWidth: 375, windowHeight: 667 };
}
function computeIdeal(trigger, popup, placement, align, offsetPx) {
  let left = 0;
  let top = 0;
  switch (placement) {
    case "top":
      top = trigger.top - popup.height - offsetPx;
      if (align === "start") left = trigger.left;
      else if (align === "end") left = trigger.right - popup.width;
      else left = trigger.left + (trigger.width - popup.width) / 2;
      break;
    case "bottom":
      top = trigger.bottom + offsetPx;
      if (align === "start") left = trigger.left;
      else if (align === "end") left = trigger.right - popup.width;
      else left = trigger.left + (trigger.width - popup.width) / 2;
      break;
    case "left":
      left = trigger.left - popup.width - offsetPx;
      if (align === "start") top = trigger.top;
      else if (align === "end") top = trigger.bottom - popup.height;
      else top = trigger.top + (trigger.height - popup.height) / 2;
      break;
    case "right":
      left = trigger.right + offsetPx;
      if (align === "start") top = trigger.top;
      else if (align === "end") top = trigger.bottom - popup.height;
      else top = trigger.top + (trigger.height - popup.height) / 2;
      break;
  }
  return { left, top };
}
function flipPlacement(p) {
  switch (p) {
    case "top":
      return "bottom";
    case "bottom":
      return "top";
    case "left":
      return "right";
    case "right":
      return "left";
  }
}
function fits(pos, popup, win, boundary) {
  return pos.left >= boundary && pos.top >= boundary && pos.left + popup.width <= win.windowWidth - boundary && pos.top + popup.height <= win.windowHeight - boundary;
}
function clamp(pos, popup, win, boundary) {
  const maxLeft = win.windowWidth - popup.width - boundary;
  const maxTop = win.windowHeight - popup.height - boundary;
  return {
    left: Math.max(boundary, Math.min(pos.left, Math.max(boundary, maxLeft))),
    top: Math.max(boundary, Math.min(pos.top, Math.max(boundary, maxTop)))
  };
}
function computeArrowOffset(placement, trigger, popupRect) {
  if (placement === "top" || placement === "bottom") {
    const triggerCenterX = trigger.left + trigger.width / 2;
    const offset2 = triggerCenterX - popupRect.left;
    return Math.max(8, Math.min(popupRect.width - 8, offset2));
  }
  const triggerCenterY = trigger.top + trigger.height / 2;
  const offset = triggerCenterY - popupRect.top;
  return Math.max(8, Math.min(popupRect.height - 8, offset));
}
async function reposition() {
  const triggerRect = await queryRect(triggerId);
  const popupRect = await queryRect(popupId);
  if (!triggerRect || !popupRect) {
    return;
  }
  const win = getWindowSize();
  const popupSize = { width: popupRect.width, height: popupRect.height };
  let placement = props.placement;
  let pos = computeIdeal(triggerRect, popupSize, placement, props.align, props.offset);
  if (!props.disableFlip && !fits(pos, popupSize, win, props.boundary)) {
    const flipped = flipPlacement(placement);
    const flippedPos = computeIdeal(triggerRect, popupSize, flipped, props.align, props.offset);
    if (fits(flippedPos, popupSize, win, props.boundary)) {
      placement = flipped;
      pos = flippedPos;
    }
  }
  pos = clamp(pos, popupSize, win, props.boundary);
  actualPlacement.value = placement;
  popupPos.value = pos;
  arrowOffset.value = computeArrowOffset(
    placement,
    triggerRect,
    { left: pos.left, top: pos.top, width: popupSize.width, height: popupSize.height }
  );
}
defineExpose({ reposition, hide });
</script>

<style>
.tt-tooltip {
  position: relative;
  display: inline-flex;
}

.tt-tooltip__trigger {
  display: inline-flex;
}

.tt-tooltip__popup {
  z-index: 100;
  animation: tt-tooltip-in 0.15s ease;
  min-width: 0;
}

.tt-tooltip__inner {
  display: block;
  padding: 12rpx 20rpx;
  border-radius: var(--tt-radius, 12rpx);
  font-size: 24rpx;
  line-height: 1.4;
  white-space: nowrap;
  position: relative;
  z-index: 1;
}

.tt-tooltip__inner--dark {
  background: var(--tt-foreground, #0a0a0a);
  color: var(--tt-background, #ffffff);
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.16);
}

.tt-tooltip__inner--light {
  background: var(--tt-background, #ffffff);
  color: var(--tt-foreground, #0a0a0a);
  border: 1rpx solid var(--tt-border, #e5e5e5);
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
}

.tt-tooltip__text {
  font-size: inherit;
  color: inherit;
  line-height: inherit;
}

.tt-tooltip__arrow {
  position: absolute;
  width: 12rpx;
  height: 12rpx;
  z-index: 0;
}

.tt-tooltip__arrow--dark {
  background: var(--tt-foreground, #0a0a0a);
}

.tt-tooltip__arrow--light {
  background: var(--tt-background, #ffffff);
  border-right: 1rpx solid var(--tt-border, #e5e5e5);
  border-bottom: 1rpx solid var(--tt-border, #e5e5e5);
}

.tt-tooltip__arrow--top {
  bottom: -6rpx;
  left: 50%;
}

.tt-tooltip__arrow--bottom {
  top: -6rpx;
  left: 50%;
}

.tt-tooltip__arrow--left {
  right: -6rpx;
  top: 50%;
}

.tt-tooltip__arrow--right {
  left: -6rpx;
  top: 50%;
}

.tt-tooltip__backdrop {
  position: fixed;
  inset: 0;
  z-index: 99;
  background: transparent;
}

@keyframes tt-tooltip-in {
  from { opacity: 0; transform: translateY(4rpx); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
