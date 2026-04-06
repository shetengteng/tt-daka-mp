<template>
  <view class="page" :class="{ 'theme-dark': themeStore.mode === 'dark' }" :style="themeStore.themeStyle">
    <view class="header px-xl" :style="{ paddingTop: headerPaddingTop }">
      <text class="text-xl font-bold text-foreground">我的</text>
      <UserCard />
    </view>
    
    <ManageSection />
    
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
    
    <OtherSection @refresh="onRefresh" />
    
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
    
    <TtDialog
      v-model:visible="showLogoutDialog"
      title="退出登录"
      message="退出后需要重新登录，确定退出吗？"
      @confirm="onLogoutConfirm"
    />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useThemeStore } from '@/stores/theme'
import { useUserStore } from '@/stores/user'
import { useStatsStore } from '@/stores/stats'
import { useProjectStore } from '@/stores/project'
import { clearAccountId, clearLoginType, getAccountId } from '@/utils/auth'
import { resetWechatAuthState } from '@/cloud-emas/database/api/wechatAuth'
import { resetAuthState } from '@/cloud-emas/database/api/anonymousAuth'
import { getPendingCount, clearPendingOps } from '@/utils/pending-ops'
import { clearUserCache } from '@/utils/local-store'
import UserCard from './components/UserCard.vue'
import ManageSection from './components/ManageSection.vue'
import OtherSection from './components/OtherSection.vue'
import { getMineStats } from '@/api/user/getMineStats'
import { getUser } from '@/api/user/getUser'

const projectStore = useProjectStore()
const userStore = useUserStore()
const statsStore = useStatsStore()
let _mineLoaded = false

const themeStore = useThemeStore()
const headerPaddingTop = computed(() => `${themeStore.statusBarHeight + 12}px`)

const darkMode = computed({
  get: () => themeStore.mode === 'dark',
  set: (val) => themeStore.setMode(val ? 'dark' : 'light'),
})

const showLogoutDialog = ref(false)

async function fetchMineData() {
  const [statsRes, userRes] = await Promise.all([getMineStats(), getUser()])
  if (statsRes.success) {
    statsStore.setMineCounts({
      active: statsRes.activeCount,
      archived: statsRes.archivedCount,
      totalDays: statsRes.totalDays,
    })
    userStore.setUser({ totalDays: statsRes.totalDays })
  }
  if (userRes.success && userRes.user) {
    userStore.setUser({
      nickname: userRes.user.nickname || '微信用户',
      avatar: userRes.user.avatar || '',
    })
  }
  projectStore.markFresh()
}

onShow(async () => {
  themeStore.applyTheme()
  if (!_mineLoaded) {
    await fetchMineData()
    _mineLoaded = true
  } else {
    await projectStore.ensureFresh(fetchMineData)
  }
})

async function onRefresh() {
  projectStore.markDirty()
  await projectStore.ensureFresh(fetchMineData)
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
  userStore.clear()
  statsStore.clear()
  clearAccountId()
  clearLoginType()
  resetAuthState()
  resetWechatAuthState()
  uni.reLaunch({ url: '/pages/login/index' })
}
</script>

<style lang="scss" scoped>
.logout-btn {
  height: 88rpx;
}
</style>
