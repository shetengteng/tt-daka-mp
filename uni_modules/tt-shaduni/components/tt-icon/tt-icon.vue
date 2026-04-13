<template>
  <!-- #ifdef MP -->
  <view class="tt-icon" :style="mpStyle" @click="emit('click')" />
  <!-- #endif -->
  <!-- #ifndef MP -->
  <view class="tt-icon" v-html="svgHtml" :style="h5Style" @click="emit('click')" />
  <!-- #endif -->
</template>

<script setup >import { computed } from "vue";
import { iconProps } from "./props";
import { useSvgIcon } from "../../composables/use-svg-icon";
const props = defineProps(iconProps);
const emit = defineEmits();
const { svgHtml, svgDataUri } = useSvgIcon(
  () => props.name,
  () => props.svg,
  () => props.color
);
const sizeWithUnit = computed(() => {
  const { size } = props;
  if (typeof size === "number") return `${size}rpx`;
  return size;
});
const h5Style = computed(() => {
  const w = sizeWithUnit.value;
  let s = `width:${w};height:${w};`;
  if (props.color) s += `color:${props.color};`;
  return s;
});
const mpStyle = computed(() => {
  const w = sizeWithUnit.value;
  let s = `width:${w};height:${w};`;
  if (svgDataUri.value) {
    s += `background-image:url("${svgDataUri.value}");`;
  }
  return s;
});
</script>

<style>
/* #ifndef MP */
.tt-icon svg {
  width: 100% !important;
  height: 100% !important;
  display: block;
}
/* #endif */
/* #ifdef MP */
.tt-icon {
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
}
/* #endif */
.tt-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}
</style>
