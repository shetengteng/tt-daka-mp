<template>
  <view class="tt-empty">
    <TtSvg name="ri-inbox-line" :size="80" color="#D4D4D8" />
    <text class="tt-empty__text">{{ description }}</text>
  </view>
</template>

<script setup>
defineProps({
  description: { type: String, default: '暂无数据' }
})
</script>

<style lang="scss" scoped>
.tt-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 0;

  &__text {
    font-size: 26rpx;
    color: #71717A;
    margin-top: 16rpx;
  }
}
</style>
