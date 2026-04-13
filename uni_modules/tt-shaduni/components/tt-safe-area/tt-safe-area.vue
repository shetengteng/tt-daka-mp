<template>
  <view class="tt-safe-area" :class="'tt-safe-area--' + position" />
</template>

<script setup >import { safeAreaProps } from "./props";
defineProps(safeAreaProps);
</script>

<style>
.tt-safe-area--top { padding-top: env(safe-area-inset-top); }
.tt-safe-area--bottom { padding-bottom: env(safe-area-inset-bottom); }
</style>
