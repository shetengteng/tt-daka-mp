<template>
  <text class="tt-typography" :class="classes" :style="ellipsisStyle" @click="onClick"><slot /></text>
</template>

<script setup >import { computed } from "vue";
import { typographyProps } from "./props";
const props = defineProps(typographyProps);
const emit = defineEmits(["click"]);
const classes = computed(() => [
  `tt-typography--${props.type}`,
  props.type === "title" ? `tt-typography--h${props.level}` : "",
  props.bold ? "tt-typography--bold" : "",
  props.underline ? "tt-typography--underline" : "",
  props.delete ? "tt-typography--delete" : "",
  props.disabled ? "tt-typography--disabled" : ""
]);
const ellipsisStyle = computed(() => {
  if (!props.ellipsis) return {};
  const lines = typeof props.ellipsis === "number" ? props.ellipsis : 1;
  return lines === 1 ? { overflow: "hidden", "text-overflow": "ellipsis", "white-space": "nowrap" } : { overflow: "hidden", display: "-webkit-box", "-webkit-line-clamp": `${lines}`, "-webkit-box-orient": "vertical" };
});
function onClick() {
  emit("click");
}
</script>

<style>
.tt-typography { color: var(--tt-foreground, #0a0a0a); }
.tt-typography--text { font-size: 28rpx; line-height: 1.6; }
.tt-typography--title { font-weight: 700; }
.tt-typography--h1 { font-size: 60rpx; line-height: 1.2; }
.tt-typography--h2 { font-size: 48rpx; line-height: 1.3; }
.tt-typography--h3 { font-size: 40rpx; line-height: 1.35; }
.tt-typography--h4 { font-size: 32rpx; line-height: 1.4; }
.tt-typography--h5 { font-size: 28rpx; line-height: 1.5; }
.tt-typography--link { color: var(--tt-primary, #171717); font-size: 28rpx; }
.tt-typography--bold { font-weight: 700; }
.tt-typography--underline { text-decoration: underline; }
.tt-typography--delete { text-decoration: line-through; }
.tt-typography--disabled { opacity: .5; }
</style>
