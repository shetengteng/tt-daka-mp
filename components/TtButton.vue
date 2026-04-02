<template>
  <view
    class="tt-btn"
    :class="[
      type && `tt-btn--${type}`,
      block && 'tt-btn--block',
    ]"
    @click="$emit('click')"
  >
    <slot>
      <text class="tt-btn__text" :class="textClass">{{ text }}</text>
    </slot>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  text: { type: String, default: '' },
  type: { type: String, default: 'primary' },
  block: { type: Boolean, default: false },
})
defineEmits(['click'])

const textClass = computed(() => {
  if (props.type === 'danger-text') return 'tt-btn__text--danger'
  return ''
})
</script>

<style lang="scss" scoped>
.tt-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx 40rpx;
  border-radius: 20rpx;

  &--primary {
    background: var(--tt-foreground, #09090B);
  }

  &--block {
    width: 100%;
    box-sizing: border-box;
  }

  &--danger-text {
    background: transparent;
  }

  &__text {
    font-size: 28rpx;
    color: var(--tt-background, #ffffff);
    font-weight: 500;

    &--danger {
      color: var(--tt-error, #EF4444);
    }
  }
}
</style>
