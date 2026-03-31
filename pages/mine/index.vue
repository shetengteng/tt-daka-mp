<template>
  <view class="page">
    <view class="header px-xl">
      <!-- 用户信息卡片 -->
      <view class="user-card card flex-center-v">
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
          <TtSvg name="ri-arrow-right-s-line" :size="32" color="#71717A" />
        </view>
        <view class="list-item flex-between p-lg" @click="goArchived">
          <text class="text-sm text-foreground">已归档项目</text>
          <view class="flex-center-v gap-sm">
            <text class="text-xs text-muted">2</text>
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
          <text class="text-sm text-foreground">打卡提醒</text>
          <TtSwitch v-model="reminderEnabled" />
        </view>
        <view class="list-item flex-between p-lg" @click="pickTime">
          <text class="text-sm text-foreground">提醒时间</text>
          <view class="flex-center-v gap-sm">
            <text class="text-sm text-muted">{{ reminderTime }}</text>
            <TtSvg name="ri-arrow-right-s-line" :size="32" color="#71717A" />
          </view>
        </view>
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
        <view class="list-item flex-between p-lg">
          <text class="text-sm text-foreground">关于 TT Daka</text>
          <TtSvg name="ri-arrow-right-s-line" :size="32" color="#71717A" />
        </view>
      </view>
    </view>
    
    <view class="text-center mt-xl mb-lg">
      <text class="text-xs" style="color: #D4D4D8">v1.0.0</text>
    </view>
    
    <TtBottomPlaceholder />
    <TtTabbar current="mine" />
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { goToProjectManage, goToProjectArchived } from '@/route/index'

const totalDays = ref(45)
const reminderEnabled = ref(true)
const reminderTime = ref('20:00')
const darkMode = ref(false)

onMounted(() => {
  const cached = uni.getStorageSync('dk_reminder_enabled')
  if (cached !== undefined && cached !== '') reminderEnabled.value = cached
  const cachedTime = uni.getStorageSync('dk_reminder_time')
  if (cachedTime) reminderTime.value = cachedTime
})

function goManage() {
  goToProjectManage()
}

function goArchived() {
  goToProjectArchived()
}

function pickTime() {
  // uni-app 时间选择器
}

function clearCache() {
  uni.showModal({
    title: '清除缓存',
    content: '确定清除本地缓存数据吗？',
    success: (res) => {
      if (res.confirm) {
        uni.clearStorageSync()
        uni.showToast({ title: '缓存已清除', icon: 'success' })
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.header {
  padding-top: calc(var(--status-bar-height, 44px) + 24rpx);
}

.user-card {
  padding: 40rpx;
  gap: 32rpx;
}

.avatar {
  width: 112rpx;
  height: 112rpx;
  flex-shrink: 0;
  background-color: #09090B;
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
