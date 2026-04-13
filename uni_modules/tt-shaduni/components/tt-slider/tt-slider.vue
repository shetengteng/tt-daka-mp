<template>
  <view class="tt-slider" :class="{ 'tt-slider--disabled': disabled }">
    <slider
      class="tt-slider__native"
      :value="modelValue"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      :activeColor="activeColor || 'var(--tt-primary, #171717)'"
      :backgroundColor="'var(--tt-muted, #f5f5f5)'"
      :block-size="1"
      block-color="transparent"
      @changing="onChanging"
      @change="onChange"
    />
  </view>
</template>

<script setup >import { sliderProps } from "./props";
const props = defineProps(sliderProps);
const emit = defineEmits(["update:modelValue", "change"]);
function onChanging(e) {
  const val = e.detail?.value ?? e.target?.value ?? props.modelValue;
  emit("update:modelValue", Number(val));
}
function onChange(e) {
  const val = e.detail?.value ?? e.target?.value ?? props.modelValue;
  emit("update:modelValue", Number(val));
  emit("change", Number(val));
}
</script>

<style scoped>
.tt-slider { padding: 16rpx 0; }
.tt-slider__native { width: 100%; margin: 0; }
.tt-slider--disabled { opacity: .5; pointer-events: none; }

.tt-slider :deep(.uni-slider-handle-wrapper) {
  height: 4px !important;
  border-radius: 999px !important;
  background: var(--tt-muted, #f5f5f5) !important;
  overflow: visible !important;
}
.tt-slider :deep(.uni-slider-track) {
  height: 4px !important;
  border-radius: 999px !important;
  background: var(--tt-primary, #171717) !important;
}
.tt-slider :deep(.uni-slider-handle) {
  position: absolute !important;
  width: 20px !important;
  height: 20px !important;
  border-radius: 50% !important;
  background: var(--tt-background, #fff) !important;
  border: 2px solid var(--tt-primary, #171717) !important;
  box-shadow: 0 1px 4px rgba(0,0,0,.12) !important;
  margin-top: -10px !important;
  top: 50% !important;
  box-sizing: border-box !important;
  cursor: grab !important;
  z-index: 2 !important;
}
.tt-slider :deep(.uni-slider-handle)::before,
.tt-slider :deep(.uni-slider-handle)::after {
  display: none !important;
}
.tt-slider :deep(.uni-slider-thumb) {
  width: 0 !important;
  height: 0 !important;
  opacity: 0 !important;
  overflow: hidden !important;
}
</style>
