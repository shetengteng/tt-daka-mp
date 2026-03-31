<template>
  <view class="tt-bottom-placeholder" :style="customStyle"></view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  height: {
    type: [Number, String],
    default: 280
  },
  backgroundColor: {
    type: String,
    default: 'transparent'
  }
})

const customStyle = computed(() => {
  const heightValue = typeof props.height === 'number' 
    ? `${props.height}rpx` 
    : props.height
  return {
    height: heightValue,
    backgroundColor: props.backgroundColor
  }
})
</script>

<style lang="scss" scoped>
.tt-bottom-placeholder {
  width: 100%;
  flex-shrink: 0;
}
</style>
