<template>
  <view>
    <view v-if="fixed && placeholder" class="tt-tabbar__placeholder" :style="{ height: placeholderHeight }" />
    <view
      class="tt-tabbar"
      :class="{ 'tt-tabbar--fixed': fixed, 'tt-tabbar--border': border, 'tt-tabbar--safe': safeAreaInsetBottom }"
    >
      <template v-if="items.length">
        <view
          v-for="(item, i) in items"
          :key="itemKey(item, i)"
          class="tt-tabbar__item"
          :class="{ 'tt-tabbar__item--active': isActive(item, i) }"
          :style="itemStyle(item, i)"
          @click="onSelect(item, i)"
        >
          <view class="tt-tabbar__icon">
            <tt-icon
              v-if="resolveIcon(item, i)"
              :name="resolveIcon(item, i)"
              :size="36"
            />
            <text v-else>○</text>
          </view>
          <text class="tt-tabbar__label">{{ item.text }}</text>
        </view>
      </template>
      <slot v-else />
    </view>
  </view>
</template>

<script setup >import { ref, computed, onMounted } from "vue";
import { tabbarProps } from "./props";
const props = defineProps(tabbarProps);
const emit = defineEmits();
const safeBottom = ref(0);
onMounted(() => {
  const info = uni.getSystemInfoSync();
  safeBottom.value = info.safeAreaInsets?.bottom || 0;
});
const placeholderHeight = computed(() => {
  const barH = uni.getSystemInfoSync().windowWidth * 100 / 750;
  const safe = props.safeAreaInsetBottom ? safeBottom.value : 0;
  return barH + safe + "px";
});
function itemKey(item, i) {
  return item.name ?? i;
}
function isActive(item, i) {
  if (item.name != null && typeof props.modelValue === "string") {
    return props.modelValue === item.name;
  }
  return props.modelValue === i;
}
function resolveIcon(item, i) {
  if (isActive(item, i) && item.selectedIcon) return item.selectedIcon;
  return item.icon || "";
}
function itemStyle(item, i) {
  const active = isActive(item, i);
  const color = active ? props.activeColor : props.inactiveColor;
  return color ? { color } : void 0;
}
function onSelect(item, i) {
  const value = item.name ?? i;
  emit("update:modelValue", value);
  emit("change", item, i);
}
</script>

<style>
.tt-tabbar { display: flex; align-items: flex-start; height: 100rpx; padding-top: 12rpx; background: var(--tt-background, #ffffff); }
.tt-tabbar--fixed { position: fixed; bottom: 0; left: 0; right: 0; z-index: 100; }
.tt-tabbar--border { border-top: 2rpx solid var(--tt-border, #e5e5e5); }
.tt-tabbar--safe { padding-bottom: env(safe-area-inset-bottom); }
.tt-tabbar__placeholder { width: 100%; }
.tt-tabbar__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  gap: 4rpx;
  transition: color .2s;
  color: var(--tt-muted-foreground, #737373);
}
.tt-tabbar__item--active { color: var(--tt-foreground, #171717); }
.tt-tabbar__icon { font-size: 36rpx; line-height: 1; }
.tt-tabbar__label { font-size: 20rpx; font-weight: 500; }
.tt-tabbar__item--active .tt-tabbar__label { font-weight: 600; }
</style>
