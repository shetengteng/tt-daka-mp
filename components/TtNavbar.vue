<template>
  <view class="tt-navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
    <view class="tt-navbar__content">
      <view class="tt-navbar__left" @click="onBack">
        <TtSvg name="ri-arrow-left-s-line" :size="36" :color="iconColor" />
      </view>
      <text class="tt-navbar__title" :style="{ color: titleColor }">{{ title }}</text>
      <view class="tt-navbar__right">
        <slot name="right" />
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'

defineProps({
  title: { type: String, default: '' },
})

const themeStore = useThemeStore()
const statusBarHeight = computed(() => themeStore.statusBarHeight)
const iconColor = computed(() => themeStore.isDark ? '#FAFAFA' : '#09090B')
const titleColor = computed(() => themeStore.isDark ? '#FAFAFA' : '#09090B')

function onBack() {
  uni.navigateBack({ delta: 1 })
}
</script>

<style lang="scss" scoped>
.tt-navbar {
  position: relative;
  z-index: 100;

  &__content {
    display: flex;
    align-items: center;
    height: 88rpx;
    padding: 0 16rpx;
  }

  &__left {
    width: 72rpx;
    height: 72rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__title {
    flex: 1;
    text-align: center;
    font-size: 32rpx;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__right {
    width: 72rpx;
    height: 72rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
}
</style>
