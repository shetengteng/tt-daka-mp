<template>
  <view class="tt-input card">
    <input
      :value="modelValue"
      class="tt-input__inner"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :type="inputType"
      @input="$emit('update:modelValue', $event.detail.value)"
    />
    <view v-if="clearable && modelValue" class="tt-input__clear flex-center" @click="$emit('update:modelValue', '')">
      <text class="tt-input__clear-icon">&times;</text>
    </view>
  </view>
</template>

<script setup>
defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  maxlength: { type: Number, default: -1 },
  inputType: { type: String, default: 'text' },
  clearable: { type: Boolean, default: true },
})
defineEmits(['update:modelValue'])
</script>

<style lang="scss" scoped>
.tt-input {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;

  &__inner {
    flex: 1;
    font-size: 28rpx;
    color: var(--tt-foreground, #09090B);
    background: transparent;
  }

  &__clear {
    width: 40rpx;
    height: 40rpx;
    margin-left: 12rpx;
  }

  &__clear-icon {
    font-size: 32rpx;
    color: var(--tt-muted-foreground, #A1A1AA);
    line-height: 1;
  }
}
</style>
