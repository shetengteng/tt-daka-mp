<template>
  <view class="tt-input" :class="rootClass">
    <slot name="prefix" />
    <input
      class="tt-input__inner"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :maxlength="maxlength"
      :placeholder-style="placeholderStyle"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
    />
    <view
      v-if="clearable && String(modelValue).length > 0 && !disabled"
      class="tt-input__clear"
      @click="handleClear"
    >
      <text class="tt-input__clear-icon">×</text>
    </view>
    <slot name="suffix" />
  </view>
</template>

<script setup >import { computed, ref } from "vue";
import { inputProps } from "./props";
const props = defineProps(inputProps);
const emit = defineEmits();
const focused = ref(false);
const rootClass = computed(() => ({
  "tt-input--disabled": props.disabled,
  "tt-input--focused": focused.value
}));
const placeholderStyle = "color: var(--tt-muted-foreground, #737373)";
function handleInput(e) {
  emit("update:modelValue", e.detail.value);
}
function handleFocus(e) {
  focused.value = true;
  emit("focus", e);
}
function handleBlur(e) {
  focused.value = false;
  emit("blur", e);
}
function handleClear() {
  emit("update:modelValue", "");
  emit("clear");
}
</script>

<style>
.tt-input {
  display: flex;
  align-items: center;
  height: 80rpx;
  padding: 0 24rpx;
  border: 2rpx solid var(--tt-input, #e5e5e5);
  border-radius: var(--tt-radius, 12rpx);
  background-color: var(--tt-background, #ffffff);
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.tt-input--focused {
  border-color: var(--tt-ring, #a3a3a3);
  box-shadow: 0 0 0 4rpx rgba(163, 163, 163, 0.2);
}

.tt-input--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tt-input__inner {
  flex: 1;
  height: 100%;
  font-size: 28rpx;
  color: var(--tt-foreground, #0a0a0a);
  background: transparent;
  border: none;
  outline: none;
  padding: 0;
}

.tt-input__clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40rpx;
  height: 40rpx;
  margin-left: 8rpx;
  cursor: pointer;
}

.tt-input__clear-icon {
  font-size: 32rpx;
  color: var(--tt-muted-foreground, #737373);
  line-height: 1;
}
</style>
