<template>
  <view class="tt-dropdown-menu" :class="{ 'tt-dropdown-menu--disabled': disabled }">
    <view class="tt-dropdown-menu__bar" @click="toggle">
      <text class="tt-dropdown-menu__title">{{ displayText }}</text>
      <text class="tt-dropdown-menu__arrow" :class="{ 'tt-dropdown-menu__arrow--up': open }">▼</text>
    </view>
    <view v-if="open" class="tt-dropdown-menu__popup">
      <view class="tt-dropdown-menu__overlay" @click="open = false"></view>
      <view class="tt-dropdown-menu__content">
        <view v-for="opt in options" :key="opt.value" class="tt-dropdown-menu__option" :class="{ 'tt-dropdown-menu__option--active': modelValue === opt.value }" @click="select(opt)">
          <text>{{ opt.text }}</text>
          <text v-if="modelValue === opt.value" class="tt-dropdown-menu__check">✓</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup >import { ref, computed } from "vue";
import { dropdownMenuProps } from "./props";
const props = defineProps(dropdownMenuProps);
const emit = defineEmits(["update:modelValue", "change"]);
const open = ref(false);
const displayText = computed(() => {
  const found = props.options.find((o) => o.value === props.modelValue);
  return found ? found.text : props.title || "Select";
});
function toggle() {
  if (!props.disabled) open.value = !open.value;
}
function select(opt) {
  emit("update:modelValue", opt.value);
  emit("change", opt.value);
  open.value = false;
}
</script>

<style>
.tt-dropdown-menu { position: relative; }
.tt-dropdown-menu--disabled { opacity: .5; pointer-events: none; }
.tt-dropdown-menu__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 24rpx;
  cursor: pointer;
  gap: 12rpx;
  border: 2rpx solid var(--tt-border, #e5e5e5);
  border-radius: var(--tt-radius, 12rpx);
}
.tt-dropdown-menu__title { font-size: 28rpx; font-weight: 500; color: var(--tt-foreground, #0a0a0a); }
.tt-dropdown-menu__arrow { font-size: 24rpx; transition: transform .2s; color: var(--tt-muted-foreground, #737373); line-height: 1; }
.tt-dropdown-menu__arrow--up { transform: rotate(180deg); }
.tt-dropdown-menu__popup { position: absolute; left: 0; right: 0; top: calc(100% + 8rpx); z-index: 100; }
.tt-dropdown-menu__overlay { position: fixed; inset: 0; z-index: -1; background: transparent; }
.tt-dropdown-menu__content {
  background: var(--tt-background, #fff);
  border: 2rpx solid var(--tt-border, #e5e5e5);
  border-radius: var(--tt-radius, 12rpx);
  box-shadow: 0 8rpx 32rpx rgba(0,0,0,.12);
  overflow: hidden;
}
.tt-dropdown-menu__option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  font-size: 28rpx;
  color: var(--tt-foreground, #0a0a0a);
  cursor: pointer;
  transition: background .15s;
}
.tt-dropdown-menu__option:active { background: var(--tt-muted, #f5f5f5); }
.tt-dropdown-menu__option--active { color: var(--tt-primary, #171717); font-weight: 600; }
.tt-dropdown-menu__check { font-size: 28rpx; color: var(--tt-primary, #171717); }
</style>
