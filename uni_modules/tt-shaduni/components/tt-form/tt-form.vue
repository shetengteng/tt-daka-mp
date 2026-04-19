<template>
  <view
    class="tt-form"
    :class="[`tt-form--${props.variant}`]"
  >
    <slot />
  </view>
</template>

<script setup>
import { provide, reactive, watchEffect } from "vue";
import { formProps, TT_FORM_INJECT_KEY } from "./props";

const props = defineProps(formProps);

const ctx = reactive({
  variant: props.variant,
  labelWidth: props.labelWidth,
  borderedLast: props.borderedLast,
});

watchEffect(() => {
  ctx.variant = props.variant;
  ctx.labelWidth = props.labelWidth;
  ctx.borderedLast = props.borderedLast;
});

provide(TT_FORM_INJECT_KEY, ctx);
</script>

<style>
.tt-form { width: 100%; }
.tt-form--list { display: flex; flex-direction: column; }
</style>
