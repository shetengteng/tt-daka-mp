<template>
  <view class="page" :class="{ 'theme-dark': themeStore.mode === 'dark' }" :style="themeStore.themeStyle">
    <view class="header px-xl" :style="{ paddingTop: headerPaddingTop }">
      <text class="text-xl font-bold text-foreground">我的</text>
      <!-- 用户信息卡片 -->
      <view class="user-card card flex-center-v mt-lg" @click="onUserCardClick">
        <view class="avatar flex-center rounded-full">
          <image v-if="userAvatar" class="avatar-img rounded-full" :src="userAvatar" mode="aspectFill" />
          <TtSvg v-else name="ri-user-fill" :size="56" color="#ffffff" />
        </view>
        <view class="user-info flex-1">
          <text class="text-lg font-semibold text-foreground">{{ userNickname }}</text>
          <text class="text-sm text-muted block">已坚持打卡 {{ totalDays }} 天</text>
        </view>
        <TtSvg v-if="isEditableMode" name="ri-arrow-right-s-line" :size="32" color="#71717A" />
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
        <view class="list-item flex-between p-lg" @click="refreshCache">
          <text class="text-sm text-foreground">刷新缓存</text>
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
    
    <!-- 退出登录 -->
    <view class="px-xl mt-xl">
      <view class="logout-btn flex-center rounded-xl" @click="showLogoutDialog = true">
        <text class="text-sm text-error">退出登录</text>
      </view>
    </view>
    
    <view class="text-center mt-lg mb-lg">
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
    
    <!-- 刷新缓存确认 -->
    <TtDialog
      v-model:visible="showRefreshCache"
      title="刷新缓存"
      message="将重新从云端拉取最新数据，确定刷新吗？"
      @confirm="onRefreshCacheConfirm"
    />
    
    <!-- 退出登录确认 -->
    <TtDialog
      v-model:visible="showLogoutDialog"
      title="退出登录"
      message="退出后需要重新登录，确定退出吗？"
      @confirm="onLogoutConfirm"
    />
    
    <!-- 编辑个人信息弹窗 -->
    <view v-if="showEditProfile" class="edit-mask" @click="showEditProfile = false">
      <view class="edit-panel" @click.stop>
        <view class="edit-panel__header">
          <text class="text-lg font-semibold text-foreground">修改个人信息</text>
        </view>
        
        <view class="edit-panel__body">
          <!-- 头像区域 -->
          <view class="edit-avatar-section flex-col flex-center">
            <view class="edit-avatar flex-center rounded-full" @click="onChooseAvatarFallback">
              <image v-if="editAvatar" class="edit-avatar-img rounded-full" :src="editAvatar" mode="aspectFill" />
              <TtSvg v-else name="ri-user-fill" :size="48" color="#ffffff" />
            </view>
            <!-- #ifdef MP-WEIXIN -->
            <button class="choose-avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
              <text class="text-sm" style="color: var(--tt-primary)">更换头像</text>
            </button>
            <!-- #endif -->
            <!-- #ifndef MP-WEIXIN -->
            <view class="choose-avatar-btn" @click="onChooseAvatarFallback">
              <text class="text-sm" style="color: var(--tt-primary)">更换头像</text>
            </view>
            <!-- #endif -->
          </view>
          
          <!-- 昵称输入 -->
          <view class="edit-nickname-section">
            <text class="text-sm text-muted mb-sm block">昵称</text>
            <!-- #ifdef MP-WEIXIN -->
            <view class="edit-input card">
              <input type="nickname" v-model="editNickname" placeholder="请输入昵称" class="edit-input__inner" maxlength="20" />
            </view>
            <!-- #endif -->
            <!-- #ifndef MP-WEIXIN -->
            <TtInput v-model="editNickname" placeholder="请输入昵称" :maxlength="20" />
            <!-- #endif -->
          </view>
        </view>
        
        <view class="edit-panel__footer">
          <view class="edit-btn edit-btn--cancel" @click="showEditProfile = false">
            <text class="text-sm text-muted">取消</text>
          </view>
          <view class="edit-btn edit-btn--save" @click="onSaveProfile">
            <text class="text-sm font-medium" style="color: var(--tt-background)">保存</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { goToProjectManage, goToProjectArchived, goToPrivacy } from '@/route/index'
import { useThemeStore } from '@/stores/theme'
import { clearAccountId, getLoginType, clearLoginType } from '@/utils/auth'
import { resetWechatAuthState } from '@/cloud-emas/database/api/wechatAuth'
import { resetAuthState } from '@/cloud-emas/database/api/anonymousAuth'
import { useProjectStore } from '@/stores/project'
import { getAccountId } from '@/utils/auth'
import { getPendingCount } from '@/utils/pending-ops'
import { clearUserCache } from '@/utils/local-store'
import { clearPendingOps } from '@/utils/pending-ops'
import { getMineStats } from './api/getMineStats'
import { getUser } from './api/getUser'
import { updateUserProfile } from './api/updateUserProfile'
import { fileToBase64, isLocalFile, compressImage } from '@/utils/file'

const projectStore = useProjectStore()
let _mineLoaded = false

const themeStore = useThemeStore()
const headerPaddingTop = computed(() => `${themeStore.statusBarHeight + 12}px`)

const totalDays = ref(0)
const activeCount = ref(0)
const archivedCount = ref(0)
const userNickname = ref('微信用户')
const userAvatar = ref('')
const isEditableMode = computed(() => {
  const type = getLoginType()
  return type === 'wechat' || type === 'anonymous'
})

const darkMode = computed({
  get: () => themeStore.mode === 'dark',
  set: (val) => themeStore.setMode(val ? 'dark' : 'light'),
})
const showAbout = ref(false)
const aboutMessage = 'DaKa 是一款简洁高效的打卡习惯养成工具。\n\n支持自定义打卡项目、多种频率设置、补打卡、日历视图和统计分析，帮助你坚持每一天的好习惯。\n\n版本: v1.0.0'

const showEditProfile = ref(false)
const editNickname = ref('')
const editAvatar = ref('')
const saving = ref(false)

async function loadMineData() {
  const [statsRes, userRes] = await Promise.all([getMineStats(), getUser()])
  if (statsRes.success) {
    totalDays.value = statsRes.totalDays
    activeCount.value = statsRes.activeCount
    archivedCount.value = statsRes.archivedCount
  }
  if (userRes.success && userRes.user) {
    userNickname.value = userRes.user.nickname || '微信用户'
    userAvatar.value = userRes.user.avatar || ''
  }
}

onShow(() => {
  themeStore.applyTheme()
  if (!_mineLoaded || !projectStore.isCacheValid()) {
    loadMineData()
    _mineLoaded = true
  }
})

function onUserCardClick() {
  if (!isEditableMode.value) return
  editNickname.value = userNickname.value
  editAvatar.value = userAvatar.value
  showEditProfile.value = true
}

function onChooseAvatar(e) {
  const { avatarUrl } = e.detail
  if (avatarUrl) editAvatar.value = avatarUrl
}

function onChooseAvatarFallback() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      if (res.tempFilePaths && res.tempFilePaths[0]) {
        editAvatar.value = res.tempFilePaths[0]
      }
    },
  })
}

async function onSaveProfile() {
  if (saving.value) return
  const nickname = editNickname.value.trim()
  if (!nickname) {
    uni.showToast({ title: '昵称不能为空', icon: 'none' })
    return
  }

  saving.value = true
  try {
    let avatarData = editAvatar.value

    if (isLocalFile(avatarData)) {
      avatarData = await compressImage(avatarData)
      avatarData = await fileToBase64(avatarData)
    }

    const res = await updateUserProfile({ nickname, avatar: avatarData })
    if (res.success) {
      userNickname.value = nickname
      userAvatar.value = avatarData
      showEditProfile.value = false
      uni.showToast({ title: '保存成功', icon: 'success' })
    } else {
      uni.showToast({ title: res.error || '保存失败', icon: 'none' })
    }
  } catch (e) {
    uni.showToast({ title: '保存失败', icon: 'none' })
  } finally {
    saving.value = false
  }
}

function goManage() {
  goToProjectManage()
}

function goArchived() {
  goToProjectArchived()
}

function goPrivacy() {
  goToPrivacy()
}

const showRefreshCache = ref(false)
const showLogoutDialog = ref(false)

function refreshCache() {
  showRefreshCache.value = true
}

async function onRefreshCacheConfirm() {
  projectStore.markDirty()
  _mineLoaded = false
  await loadMineData()
  uni.showToast({ title: '缓存已刷新', icon: 'success' })
}

function onLogoutConfirm() {
  const accountId = getAccountId()
  const pending = accountId ? getPendingCount(accountId) : 0

  if (pending > 0) {
    uni.showModal({
      title: '未同步数据',
      content: `有 ${pending} 条打卡记录未同步到云端，退出后将丢失。确定退出吗？`,
      success: (res) => {
        if (res.confirm) doLogout(accountId)
      },
    })
    return
  }

  doLogout(accountId)
}

function doLogout(accountId) {
  if (accountId) {
    clearPendingOps(accountId)
    clearUserCache(accountId)
  }
  clearAccountId()
  clearLoginType()
  resetAuthState()
  resetWechatAuthState()
  uni.reLaunch({ url: '/pages/login/index' })
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

.avatar-img {
  width: 112rpx;
  height: 112rpx;
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

.logout-btn {
  height: 88rpx;
}

.edit-mask {
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

.edit-panel {
  width: 600rpx;
  background: var(--tt-popover, #ffffff);
  border-radius: 24rpx;
  overflow: hidden;
}

.edit-panel__header {
  padding: 40rpx 40rpx 0;
  text-align: center;
}

.edit-panel__body {
  padding: 32rpx 40rpx 40rpx;
}

.edit-avatar-section {
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.edit-avatar {
  width: 128rpx;
  height: 128rpx;
  flex-shrink: 0;
  background-color: #171717;
}

.edit-avatar-img {
  width: 128rpx;
  height: 128rpx;
}

.choose-avatar-btn {
  background: transparent;
  border: none;
  padding: 8rpx 0;
  margin: 0;
  line-height: normal;
  &::after {
    display: none;
  }
}

.edit-nickname-section .mb-sm {
  margin-bottom: 12rpx;
}

.edit-input {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
}

.edit-input__inner {
  flex: 1;
  font-size: 28rpx;
  color: var(--tt-foreground, #09090B);
  background: transparent;
}

.edit-panel__footer {
  display: flex;
  gap: 24rpx;
  padding: 0 40rpx 40rpx;
}

.edit-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80rpx;
  border-radius: 16rpx;
}

.edit-btn--cancel {
  background: var(--tt-card, #F4F4F5);
}

.edit-btn--save {
  background: var(--tt-foreground, #09090B);
}

.edit-btn:active {
  opacity: 0.8;
}
</style>
