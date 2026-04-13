<template>
  <view class="tt-swipe-action" :class="{ 'tt-swipe-action--disabled': disabled }">
    <view class="tt-swipe-action__wrapper" :style="wrapStyle" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd" @mousedown="onMouseDown">
      <view v-if="leftActions.length" class="tt-swipe-action__left">
        <view v-for="(btn, i) in leftActions" :key="i" class="tt-swipe-action__btn" :style="{ background: btn.bgColor || 'var(--tt-primary,#171717)', color: btn.color || '#fff' }" @click="$emit('click', { position: 'left', index: i })">
          <text>{{ btn.text }}</text>
        </view>
      </view>
      <view class="tt-swipe-action__content" @click="close"><slot /></view>
      <view v-if="rightActions.length" class="tt-swipe-action__right">
        <view v-for="(btn, i) in rightActions" :key="i" class="tt-swipe-action__btn" :style="{ background: btn.bgColor || '#ef4444', color: btn.color || '#fff' }" @click="$emit('click', { position: 'right', index: i })">
          <text>{{ btn.text }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup >import { ref, computed } from "vue";
import { swipeActionProps } from "./props";
const props = defineProps(swipeActionProps);
defineEmits(["click"]);
const offset = ref(0);
const startX = ref(0);
const startOffset = ref(0);
const wrapStyle = computed(() => ({ transform: `translateX(${offset.value}px)`, transition: offset.value === 0 ? "transform .2s" : "" }));
function onTouchStart(e) {
  if (props.disabled) return;
  startX.value = e.touches[0].clientX;
  startOffset.value = offset.value;
}
function onTouchMove(e) {
  if (props.disabled) return;
  const dx = e.touches[0].clientX - startX.value;
  const maxRight = props.leftActions.length ? 80 : 0;
  const maxLeft = props.rightActions.length ? -80 : 0;
  offset.value = Math.min(maxRight, Math.max(maxLeft, startOffset.value + dx));
}
function onTouchEnd() {
  if (Math.abs(offset.value) < 30) offset.value = 0;
  else {
    const maxRight = props.leftActions.length ? 80 : 0;
    const maxLeft = props.rightActions.length ? -80 : 0;
    offset.value = offset.value > 0 ? maxRight : maxLeft;
  }
}
function onMouseDown(e) {
  if (props.disabled) return;
  startX.value = e.clientX;
  startOffset.value = offset.value;
  const onMouseMove = (ev) => {
    const dx = ev.clientX - startX.value;
    const maxRight = props.leftActions.length ? 80 : 0;
    const maxLeft = props.rightActions.length ? -80 : 0;
    offset.value = Math.min(maxRight, Math.max(maxLeft, startOffset.value + dx));
  };
  const onMouseUp = () => {
    if (Math.abs(offset.value) < 30) offset.value = 0;
    else {
      const maxRight = props.leftActions.length ? 80 : 0;
      const maxLeft = props.rightActions.length ? -80 : 0;
      offset.value = offset.value > 0 ? maxRight : maxLeft;
    }
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  };
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
}
function close() {
  offset.value = 0;
}
</script>

<style>
.tt-swipe-action { overflow: hidden; }
.tt-swipe-action--disabled { opacity: .5; pointer-events: none; }
.tt-swipe-action__wrapper { display: flex; position: relative; }
.tt-swipe-action__content { flex-shrink: 0; width: 100%; }
.tt-swipe-action__left, .tt-swipe-action__right { position: absolute; top: 0; bottom: 0; display: flex; }
.tt-swipe-action__left { right: 100%; flex-direction: row-reverse; }
.tt-swipe-action__right { left: 100%; }
.tt-swipe-action__btn { display: flex; align-items: center; justify-content: center; min-width: 80px; padding: 0 32rpx; font-size: 26rpx; white-space: nowrap; }
</style>
