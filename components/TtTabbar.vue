<template>
  <view class="tt-tabbar" :style="{ paddingBottom: safeBottom + 'px' }">
    <view 
      v-for="item in tabList" 
      :key="item.name"
      class="tt-tabbar__item"
      :class="{ 'tt-tabbar__item--active': current === item.name }"
      @click="onChange(item.name)"
    >
      <TtSvg 
        :name="current === item.name ? item.selectedIcon : item.icon" 
        :size="40" 
        :color="current === item.name ? '#09090B' : '#71717A'"
      />
      <text class="tt-tabbar__text">{{ item.text }}</text>
    </view>
  </view>
</template>

<script>
export default {
  options: { virtualHost: true, styleIsolation: 'shared' }
}
</script>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  current: { type: String, default: 'home' }
})

const safeBottom = ref(0)

onMounted(() => {
  const info = uni.getSystemInfoSync()
  safeBottom.value = info.safeAreaInsets?.bottom || 0
})

const tabList = [
  { name: 'home', text: '打卡', icon: 'ri-checkbox-circle-line', selectedIcon: 'ri-checkbox-circle-fill', path: '/pages/index/index' },
  { name: 'calendar', text: '日历', icon: 'ri-calendar-line', selectedIcon: 'ri-calendar-fill', path: '/pages/calendar/index' },
  { name: 'stats', text: '统计', icon: 'ri-bar-chart-line', selectedIcon: 'ri-bar-chart-fill', path: '/pages/stats/index' },
  { name: 'mine', text: '我的', icon: 'ri-user-line', selectedIcon: 'ri-user-fill', path: '/pages/mine/index' },
]

const onChange = (name) => {
  if (name !== props.current) {
    const tab = tabList.find(item => item.name === name)
    if (tab) uni.reLaunch({ url: tab.path })
  }
}
</script>

<style lang="scss" scoped>
.tt-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background: var(--tt-background, #ffffff);
  border-top: 1rpx solid var(--tt-border, #E4E4E7);
  display: flex;
  align-items: flex-start;
  padding-top: 12rpx;
  z-index: 999;

  &__item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4rpx;
    color: var(--tt-muted-foreground, #71717A);

    &--active {
      color: var(--tt-foreground, #09090B);
    }
  }

  &__text {
    font-size: 20rpx;
  }
}
</style>
