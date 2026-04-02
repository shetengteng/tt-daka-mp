<template>
  <view
    class="tt-radio"
    :class="{ 'tt-radio--checked': checked }"
    @click="$emit('click')"
  >
    <view v-if="checked" class="tt-radio__dot"></view>
  </view>
</template>

<script setup>
defineProps({
  checked: { type: Boolean, default: false },
})
defineEmits(['click'])
</script>

<style lang="scss" scoped>
.tt-radio {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  border: 2rpx solid var(--tt-disabled, #D4D4D8);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &--checked {
    border-color: var(--tt-foreground, #09090B);
  }

  &__dot {
    width: 20rpx;
    height: 20rpx;
    border-radius: 50%;
    background-color: var(--tt-foreground, #09090B);
  }
}
</style>
