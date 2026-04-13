<template>
  <view class="tt-form">
    <slot />
  </view>
</template>

<script setup >import { formProps } from "./props";
defineProps(formProps);
</script>

<style>
.tt-form { width: 100%; }
</style>
