<template>
  <view class="page" :class="{ 'theme-dark': themeStore.mode === 'dark' }" :style="themeStore.themeStyle">
    <view class="header px-xl" :style="{ paddingTop: headerPaddingTop }">
      <text class="text-xl font-bold text-foreground">我的</text>
      <!-- 用户信息卡片 -->
      <view class="user-card card flex-center-v mt-lg">
        <view class="avatar flex-center rounded-full">
          <TtSvg name="ri-user-fill" :size="56" color="#ffffff" />
        </view>
        <view class="user-info">
          <text class="text-lg font-semibold text-foreground">微信用户</text>
          <text class="text-sm text-muted block">已坚持打卡 {{ totalDays }} 天</text>
        </view>
      </view>
    </view>
    
    <!-- 打卡管理 -->
    <view class="section px-xl mt-xl">
      <text class="text-xs text-muted mb-sm block px-xs">打卡管理</text>
      <view class="card overflow-hidden">
        <view class="list-item flex-between p-lg" @click="goManage">
          <text class="text-sm text-foreground">打卡项目管理</text>
          <view class="flex-center-v gap-sm">
            <text v-if="activeCount > 0" class="text-xs text-muted">{{ activeCount }}</text>
            <TtSvg name="ri-arrow-right-s-line" :size="32" color="#71717A" />
          </view>
        </view>
        <view class="list-item flex-between p-lg" @click="goArchived">
          <text class="text-sm text-foreground">已归档项目</text>
          <view class="flex-center-v gap-sm">
            <text v-if="archivedCount > 0" class="text-xs text-muted">{{ archivedCount }}</text>
            <TtSvg name="ri-arrow-right-s-line" :size="32" color="#71717A" />
          </view>
        </view>
      </view>
    </view>
    
    <!-- 设置 -->
    <view class="section px-xl mt-xl">
      <text class="text-xs text-muted mb-sm block px-xs">设置</text>
      <view class="card overflow-hidden">
        <view class="list-item flex-between p-lg">
          <text class="text-sm text-foreground">深色模式</text>
          <TtSwitch v-model="darkMode" />
        </view>
      </view>
    </view>
    
    <!-- 其他 -->
    <view class="section px-xl mt-xl">
      <text class="text-xs text-muted mb-sm block px-xs">其他</text>
      <view class="card overflow-hidden">
        <view class="list-item flex-between p-lg" @click="clearCache">
          <text class="text-sm text-foreground">清除缓存</text>
          <TtSvg name="ri-arrow-right-s-line" :size="32" color="#71717A" />
        </view>
        <view class="list-item flex-between p-lg" @click="showAbout = true">
          <text class="text-sm text-foreground">关于 DaKa</text>
          <TtSvg name="ri-arrow-right-s-line" :size="32" color="#71717A" />
        </view>
        <view class="list-item flex-between p-lg" @click="goPrivacy">
          <text class="text-sm text-foreground">隐私政策</text>
          <TtSvg name="ri-arrow-right-s-line" :size="32" color="#71717A" />
        </view>
      </view>
    </view>
    
    <view class="text-center mt-xl mb-lg">
      <text class="text-xs" style="color: #D4D4D8">v1.0.0</text>
    </view>
    
    <TtBottomPlaceholder />
    <TtTabbar current="mine" />
    
    <!-- 关于弹窗 -->
    <TtDialog
      v-model:visible="showAbout"
      title="关于 DaKa"
      :message="aboutMessage"
      :showCancel="false"
      confirmText="知道了"
    />
    
    <!-- 清除缓存确认 -->
    <TtDialog
      v-model:visible="showClearCache"
      title="清除缓存"
      message="确定清除本地缓存数据吗？"
      @confirm="onClearCacheConfirm"
    />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { goToProjectManage, goToProjectArchived, goToPrivacy } from '@/route/index'
import { useThemeStore } from '@/stores/theme'
import { getMineStats } from './api/getMineStats'

const themeStore = useThemeStore()
const headerPaddingTop = computed(() => `${themeStore.statusBarHeight + 12}px`)

const totalDays = ref(0)
const activeCount = ref(0)
const archivedCount = ref(0)
const darkMode = computed({
  get: () => themeStore.mode === 'dark',
  set: (val) => themeStore.setMode(val ? 'dark' : 'light'),
})
const showAbout = ref(false)
const aboutMessage = 'DaKa 是一款简洁高效的打卡习惯养成工具。\n\n支持自定义打卡项目、多种频率设置、补打卡、日历视图和统计分析，帮助你坚持每一天的好习惯。\n\n版本: v1.0.0'

async function loadMineData() {
  const res = await getMineStats()
  if (res.success) {
    totalDays.value = res.totalDays
    activeCount.value = res.activeCount
    archivedCount.value = res.archivedCount
  }
}

onShow(() => {
  themeStore.applyTheme()
  loadMineData()
})

function goManage() {
  goToProjectManage()
}

function goArchived() {
  goToProjectArchived()
}

function goPrivacy() {
  goToPrivacy()
}


const showClearCache = ref(false)

function clearCache() {
  showClearCache.value = true
}

function onClearCacheConfirm() {
  uni.clearStorageSync()
  uni.showToast({ title: '缓存已清除', icon: 'success' })
}
</script>

<style lang="scss" scoped>
.user-card {
  padding: 40rpx;
  gap: 32rpx;
}

.avatar {
  width: 112rpx;
  height: 112rpx;
  flex-shrink: 0;
  background-color: #171717;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.block {
  display: block;
}

.px-xs {
  padding-left: 8rpx;
  padding-right: 8rpx;
}

.gap-sm {
  gap: 16rpx;
}
</style>
