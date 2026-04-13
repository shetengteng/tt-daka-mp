<template>
  <view class="tt-sticky" :style="stickyStyle"><slot /></view>
</template>

<script setup >import { computed } from "vue";
import { stickyProps } from "./props";
const props = defineProps(stickyProps);
const stickyStyle = computed(
  () => props.disabled ? {} : { position: "sticky", top: `${props.offsetTop}px`, "z-index": props.zIndex }
);
</script>

<style>
.tt-sticky { width: 100%; }
</style>
