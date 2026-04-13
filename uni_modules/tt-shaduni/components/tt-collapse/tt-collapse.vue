<template>
  <view class="tt-collapse">
    <slot />
  </view>
</template>

<script setup >import { provide, computed } from "vue";
import { collapseProps } from "./props";
const props = defineProps(collapseProps);
const emit = defineEmits();
const value = computed(() => props.modelValue || []);
provide("tt-collapse-value", value);
provide("tt-collapse-toggle", (name) => {
  const arr = [...props.modelValue || []];
  const idx = arr.indexOf(name);
  if (props.accordion) {
    emit("update:modelValue", idx >= 0 ? [] : [name]);
  } else {
    if (idx >= 0) arr.splice(idx, 1);
    else arr.push(name);
    emit("update:modelValue", arr);
  }
});
</script>

<style>
.tt-collapse { border: 2rpx solid var(--tt-border, #e5e5e5); border-radius: var(--tt-radius, 12rpx); overflow: hidden; }
</style>
