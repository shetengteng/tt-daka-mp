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
        <view class="list-item flex-between p-lg" @click="showAbout = true">
          <text class="text-sm text-foreground">关于 DaKa</text>
          <TtSvg name="ri-arrow-right-s-line" :size="32" color="#71717A" />
        </view>
        <view class="list-item flex-between p-lg" @click="showDisclaimer = true">
          <text class="text-sm text-foreground">免责声明</text>
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
    
    <!-- 免责声明弹窗 -->
    <TtDialog
      v-model:visible="showDisclaimer"
      title="免责声明"
      :message="disclaimerMessage"
      :showCancel="false"
      confirmText="我已知晓"
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
import { ref, computed, onMounted } from 'vue'
import { goToProjectManage, goToProjectArchived } from '@/route/index'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()

const totalDays = ref(45)
const reminderEnabled = ref(true)
const reminderTime = ref('20:00')
const darkMode = computed({
  get: () => themeStore.mode === 'dark',
  set: (val) => themeStore.setMode(val ? 'dark' : 'light'),
})
const showAbout = ref(false)
const showDisclaimer = ref(false)
const aboutMessage = 'DaKa 是一款简洁高效的打卡习惯养成工具。\n\n支持自定义打卡项目、多种频率设置、补打卡、日历视图和统计分析，帮助你坚持每一天的好习惯。\n\n版本: v1.0.0'
const disclaimerMessage = '1. DaKa 是一款个人习惯管理工具，仅供辅助记录使用，不构成任何医疗、健康或专业建议。\n\n2. 用户数据存储于云端服务器，我们会尽力保障数据安全，但不对因不可抗力（如服务器故障、网络中断等）导致的数据丢失承担责任。\n\n3. 本应用不收集用户的敏感个人信息，仅使用微信授权的基本信息（昵称、头像）用于展示。\n\n4. 用户应自行对打卡数据的准确性负责，补打卡功能仅为便利设计，不代表实际完成情况。\n\n5. 本应用为免费使用，开发者保留随时修改、暂停或终止服务的权利，且无需提前通知。\n\n6. 使用本应用即表示您同意以上条款。如有疑问，请通过应用内反馈渠道联系我们。'

onMounted(() => {
  const cached = uni.getStorageSync('dk_reminder_enabled')
  if (cached !== undefined && cached !== '') reminderEnabled.value = cached
  const cachedTime = uni.getStorageSync('dk_reminder_time')
  if (cachedTime) reminderTime.value = cachedTime
  themeStore.applyTheme()
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
