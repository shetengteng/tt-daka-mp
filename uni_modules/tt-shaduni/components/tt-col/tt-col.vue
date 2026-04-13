<template>
  <view class="tt-col" :style="colStyle"><slot /></view>
</template>

<script setup >import { computed, inject } from "vue";
import { colProps } from "./props";
const props = defineProps(colProps);
const gutter = inject("tt-row-gutter", 0);
const colStyle = computed(() => {
  const s = {};
  const w = `${props.span / 24 * 100}%`;
  s.width = w;
  s["max-width"] = w;
  if (props.offset) s["margin-left"] = `${props.offset / 24 * 100}%`;
  if (gutter) {
    s["padding-left"] = `${gutter / 2}px`;
    s["padding-right"] = `${gutter / 2}px`;
  }
  return s;
});
</script>

<style>
.tt-col { box-sizing: border-box; }
</style>
