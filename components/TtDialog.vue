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
        <view class="tt-dialog__btn tt-dialog__btn--cancel" @click="onCancel">
          <text>取消</text>
        </view>
        <view class="tt-dialog__btn tt-dialog__btn--confirm" @click="onConfirm">
          <text>确定</text>
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
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.tt-dialog {
  width: 560rpx;
  background: #ffffff;
  border-radius: 24rpx;
  overflow: hidden;

  &__header {
    padding: 40rpx 40rpx 16rpx;
    text-align: center;
  }

  &__title {
    font-size: 32rpx;
    font-weight: 600;
    color: #09090B;
  }

  &__body {
    padding: 0 40rpx 40rpx;
    text-align: center;
  }

  &__message {
    font-size: 28rpx;
    color: #71717A;
    line-height: 1.5;
  }

  &__footer {
    display: flex;
    border-top: 1rpx solid #E4E4E7;
  }

  &__btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 96rpx;
    font-size: 30rpx;

    &--cancel {
      color: #71717A;
      border-right: 1rpx solid #E4E4E7;
    }

    &--confirm {
      color: #09090B;
      font-weight: 600;
    }

    &:active {
      background: #F4F4F5;
    }
  }
}
</style>
