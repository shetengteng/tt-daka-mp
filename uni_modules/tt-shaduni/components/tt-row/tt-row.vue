<template>
  <view class="tt-row" :class="[`tt-row--align-${align}`, wrap ? 'tt-row--wrap' : '']" :style="rowStyle">
    <slot />
  </view>
</template>

<script setup >import { computed, provide } from "vue";
import { rowProps } from "./props";
const props = defineProps(rowProps);
provide("tt-row-gutter", props.gutter);
const rowStyle = computed(() => {
  const s = {};
  if (props.justify !== "start") s["justify-content"] = props.justify;
  if (props.gutter) {
    const half = `-${props.gutter / 2}px`;
    s["margin-left"] = half;
    s["margin-right"] = half;
  }
  return s;
});
</script>

<style>
.tt-row { display: flex; justify-content: flex-start; }
.tt-row--wrap { flex-wrap: wrap; }
.tt-row--align-top { align-items: flex-start; }
.tt-row--align-middle { align-items: center; }
.tt-row--align-bottom { align-items: flex-end; }
</style>
