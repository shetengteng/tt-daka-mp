<template>
  <view 
    class="tt-switch" 
    :class="{ 'tt-switch--on': modelValue }"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <view class="tt-switch__thumb"></view>
  </view>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false }
})
defineEmits(['update:modelValue'])
</script>

<style lang="scss" scoped>
.tt-switch {
  width: 88rpx;
  height: 48rpx;
  border-radius: 48rpx;
  background: var(--tt-disabled, #D4D4D8);
  position: relative;
  transition: background 0.2s;
  flex-shrink: 0;

  &--on {
    background: var(--tt-success, #22C55E);

    .tt-switch__thumb {
      transform: translateX(40rpx);
    }
  }

  &__thumb {
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%;
    background: #ffffff;
    position: absolute;
    top: 4rpx;
    left: 4rpx;
    transition: transform 0.2s;
    box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
  }
}
</style>
