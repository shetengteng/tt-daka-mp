<template>
  <view class="tt-tabs">
    <scroll-view class="tt-tabs__nav" scroll-x>
      <view class="tt-tabs__nav-inner" ref="navRef">
        <view
          v-for="(item, idx) in items"
          :key="item.value"
          class="tt-tabs__item"
          :class="{
            'tt-tabs__item--active': modelValue === item.value,
            'tt-tabs__item--disabled': item.disabled,
          }"
          :ref="(el: any) => setItemRef(el, idx)"
          @click="handleClick(item, idx)"
        >
          <text class="tt-tabs__label">{{ item.label }}</text>
        </view>
        <view class="tt-tabs__indicator" :style="indicatorStyle" />
      </view>
    </scroll-view>
    <view class="tt-tabs__content">
      <slot />
    </view>
  </view>
</template>

<script setup >import { ref, computed, onMounted, nextTick, watch } from "vue";
import { tabsProps } from "./props";
const props = defineProps(tabsProps);
const emit = defineEmits();
const itemRefs = ref([]);
const indicatorLeft = ref(0);
const indicatorWidth = ref(0);
function setItemRef(el, idx) {
  if (el) itemRefs.value[idx] = el;
}
const indicatorStyle = computed(() => ({
  transform: `translateX(${indicatorLeft.value}px)`,
  width: `${indicatorWidth.value}px`
}));
function updateIndicator(idx) {
  nextTick(() => {
    const el = itemRefs.value[idx]?.$el || itemRefs.value[idx];
    if (!el) return;
    indicatorLeft.value = el.offsetLeft;
    indicatorWidth.value = el.offsetWidth;
  });
}
function handleClick(item, idx) {
  if (item.disabled) return;
  emit("update:modelValue", item.value);
  emit("change", item.value);
  updateIndicator(idx);
}
watch(() => props.modelValue, () => {
  const idx = props.items.findIndex((i) => i.value === props.modelValue);
  if (idx >= 0) updateIndicator(idx);
});
onMounted(() => {
  const idx = props.items.findIndex((i) => i.value === props.modelValue);
  updateIndicator(idx >= 0 ? idx : 0);
});
</script>

<style>
.tt-tabs__nav {
  white-space: nowrap;
  border-bottom: 2rpx solid var(--tt-border, #e5e5e5);
}

.tt-tabs__nav-inner {
  display: inline-flex;
  position: relative;
}

.tt-tabs__item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx 32rpx;
  font-size: 28rpx;
  color: var(--tt-muted-foreground, #737373);
  position: relative;
  cursor: pointer;
  transition: color 0.2s;
  flex-shrink: 0;
}

.tt-tabs__item--active {
  color: var(--tt-foreground, #0a0a0a);
  font-weight: 600;
}

.tt-tabs__indicator {
  position: absolute;
  bottom: 0;
  height: 4rpx;
  background-color: var(--tt-primary, #171717);
  border-radius: 2rpx;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tt-tabs__item--disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.tt-tabs__label {
  font-size: inherit;
  color: inherit;
}

.tt-tabs__content {
  padding: 32rpx 0;
}
</style>
