<template>
  <view v-if="visible" class="tt-as-mask" @click="close">
    <view class="tt-as" @click.stop>
      <view 
        v-for="item in items" 
        :key="item.value"
        class="tt-as__item"
        :style="item.color ? { color: item.color } : {}"
        @click="onSelect(item)"
      >
        <text>{{ item.label }}</text>
      </view>
      <view class="tt-as__gap"></view>
      <view class="tt-as__item tt-as__cancel" @click="close">
        <text>取消</text>
      </view>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  visible: { type: Boolean, default: false },
  items: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:visible', 'select'])

function onSelect(item) {
  emit('select', item)
  emit('update:visible', false)
}

function close() {
  emit('update:visible', false)
}
</script>

<style lang="scss" scoped>
.tt-as-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--tt-overlay, rgba(0, 0, 0, 0.4));
  display: flex;
  align-items: flex-end;
  z-index: 9999;
}

.tt-as {
  width: 100%;
  background: var(--tt-muted, #F4F4F5);
  border-radius: 24rpx 24rpx 0 0;
  padding-bottom: env(safe-area-inset-bottom);

  &__item {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 104rpx;
    font-size: 30rpx;
    color: var(--tt-foreground, #09090B);
    background: var(--tt-popover, #ffffff);

    &:first-child {
      border-radius: 24rpx 24rpx 0 0;
    }

    &:active {
      background: var(--tt-accent, #F4F4F5);
    }

    & + & {
      border-top: 1rpx solid var(--tt-border, #E4E4E7);
    }
  }

  &__gap {
    height: 12rpx;
    background: var(--tt-muted, #F4F4F5);
  }

  &__cancel {
    border-radius: 0;
    color: var(--tt-muted-foreground, #71717A);
  }
}
</style>
