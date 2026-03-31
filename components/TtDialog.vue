<template>
  <view v-if="visible" class="tt-dialog-mask" @click="onMaskClick">
    <view class="tt-dialog" @click.stop>
      <view class="tt-dialog__header">
        <text class="tt-dialog__title">{{ title }}</text>
      </view>
      <view class="tt-dialog__body">
        <text class="tt-dialog__message">{{ message }}</text>
      </view>
      <view class="tt-dialog__footer">
        <view v-if="showCancel" class="tt-dialog__btn tt-dialog__btn--cancel" @click="onCancel">
          <text>{{ cancelText }}</text>
        </view>
        <view class="tt-dialog__btn tt-dialog__btn--confirm" @click="onConfirm">
          <text>{{ confirmText }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '' },
  message: { type: String, default: '' },
  showCancel: { type: Boolean, default: true },
  confirmText: { type: String, default: '确定' },
  cancelText: { type: String, default: '取消' },
})

const emit = defineEmits(['update:visible', 'confirm', 'cancel'])

function onMaskClick() {
  emit('update:visible', false)
  emit('cancel')
}

function onCancel() {
  emit('update:visible', false)
  emit('cancel')
}

function onConfirm() {
  emit('confirm')
  emit('update:visible', false)
}
</script>

<style lang="scss" scoped>
.tt-dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--tt-overlay, rgba(0, 0, 0, 0.4));
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.tt-dialog {
  width: 560rpx;
  background: var(--tt-popover, #ffffff);
  border-radius: 24rpx;
  overflow: hidden;

  &__header {
    padding: 40rpx 40rpx 16rpx;
    text-align: center;
  }

  &__title {
    font-size: 32rpx;
    font-weight: 600;
    color: var(--tt-foreground, #09090B);
  }

  &__body {
    padding: 0 40rpx 40rpx;
    text-align: center;
  }

  &__message {
    font-size: 28rpx;
    color: var(--tt-muted-foreground, #71717A);
    line-height: 1.5;
    white-space: pre-line;
  }

  &__footer {
    display: flex;
    border-top: 1rpx solid var(--tt-border, #E4E4E7);
  }

  &__btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 96rpx;
    font-size: 30rpx;

    &--cancel + &--confirm {
      border-left: 1rpx solid var(--tt-border, #E4E4E7);
    }

    &--cancel {
      color: var(--tt-muted-foreground, #71717A);
    }

    &--confirm {
      color: var(--tt-foreground, #09090B);
      font-weight: 600;
    }

    &:active {
      background: var(--tt-accent, #F4F4F5);
    }
  }
}
</style>
