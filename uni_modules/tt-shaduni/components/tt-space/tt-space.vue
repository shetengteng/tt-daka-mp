<template>
  <view class="tt-space" :class="['tt-space--' + direction, { 'tt-space--wrap': wrap }]" :style="spaceStyle">
    <slot />
  </view>
</template>

<script setup >import { computed } from "vue";
import { spaceProps } from "./props";
const props = defineProps(spaceProps);
const spaceStyle = computed(() => {
  const g = typeof props.size === "number" ? props.size + "px" : props.size;
  return { gap: g, alignItems: props.align };
});
</script>

<style>
.tt-space { display: flex; }
.tt-space--horizontal { flex-direction: row; }
.tt-space--vertical { flex-direction: column; }
.tt-space--wrap { flex-wrap: wrap; }
</style>
