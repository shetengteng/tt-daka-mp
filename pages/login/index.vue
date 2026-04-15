<template>
  <view class="page flex-col flex-center bg-background" :class="{ 'theme-dark': themeStore.mode === 'dark' }" :style="themeStore.themeStyle">
    <view class="login-area flex-col flex-center">
      <!-- 品牌区域 -->
      <view class="brand flex-col flex-center">
        <view class="brand__icon flex-center rounded-2xl">
          <tt-icon name="ri-checkbox-circle-line" :size="80" color="#ffffff" />
        </view>
        <text class="brand__title">DaKa</text>
        <text class="text-sm text-muted mt-xs">坚持每一天的好习惯</text>
      </view>

      <!-- 登录内容 -->
      <view class="login-content flex-col flex-center">
        <!-- 协议勾选 -->
        <view class="agreement flex-center-v">
          <tt-checkbox v-model="agreed">
            <text class="text-xs text-muted">我已阅读并同意</text>
            <text class="text-xs link" @click.stop="goPrivacy">《隐私政策》</text>
          </tt-checkbox>
        </view>

        <!-- #ifdef MP-WEIXIN -->
        <tt-button block size="lg" :loading="loading" @click="handleWechatLogin" variant="wechat">
          <tt-icon name="ri-wechat-fill" :size="36" color="#ffffff" />
          <text class="btn-text">{{ loading ? '登录中...' : '微信一键登录' }}</text>
        </tt-button>
        <!-- #endif -->

        <!-- #ifdef H5 -->
        <tt-button block size="lg" :loading="loading" @click="handleDevLogin">
          <text class="btn-text">{{ loading ? '登录中...' : '开发模式登录' }}</text>
        </tt-button>
        <!-- #endif -->
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useThemeStore } from '@/stores/theme'
import { DEV_MODE, TEST_ACCOUNT_ID } from '@/config/index'
import { isLoggedIn, setAccountId, setLoginType } from '@/utils/auth'
import { initEmas, anonymousAuth, wechatAuth } from '@/api/emas'
import { useUserStore } from '@/stores/user'

const agreed = ref(false)
const loading = ref(false)
const themeStore = useThemeStore()
const userStore = useUserStore()

onLoad(() => {
  themeStore.applyTheme()

  if (DEV_MODE) {
    autoLogin()
    return
  }

  if (isLoggedIn()) {
    goHome()
  }
})

async function autoLogin() {
  setAccountId(TEST_ACCOUNT_ID)
  goHome()
}

async function handleWechatLogin() {
  if (!agreed.value) {
    uni.showToast({ title: '请先同意隐私政策', icon: 'none' })
    return
  }
  if (loading.value) return
  loading.value = true

  try {
    await initEmas()
    const authResult = await wechatAuth()

    if (!authResult.success) {
      throw new Error(authResult.error || '微信授权失败')
    }

    const userInfo = authResult.userInfo || {}
    const openid = userInfo.openid || userInfo.oAuthUserId || userInfo.userId

    if (!openid) {
      console.error('[Login] 无 openid, userInfo:', userInfo)
      throw new Error('微信授权未返回用户标识')
    }

    const accountId = `wx_${openid}`
    setAccountId(accountId)
    setLoginType('wechat')

    const result = await userStore.ensure({ loginType: 'wechat', openid })
    if (result.success && result.user) {
      setAccountId(result.user.accountId || accountId)
    }

    goHome()
  } catch (error) {
    if (error.message?.includes('cancel') || error.code === 'auth/operation-cancelled') {
      uni.showToast({ title: '已取消登录', icon: 'none' })
    } else {
      console.error('[Login] 微信登录失败:', error)
      uni.showToast({ title: '登录失败，请重试', icon: 'none' })
    }
  } finally {
    loading.value = false
  }
}

async function handleDevLogin() {
  if (!agreed.value) {
    uni.showToast({ title: '请先同意隐私政策', icon: 'none' })
    return
  }
  if (loading.value) return
  loading.value = true

  try {
    setAccountId(TEST_ACCOUNT_ID)
    await initEmas()
    await anonymousAuth()
    setLoginType('anonymous')
    await userStore.ensure({ loginType: 'anonymous' })
    goHome()
  } catch (error) {
    console.error('[Login] 开发登录失败:', error)
    uni.showToast({ title: '登录失败，请重试', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function goHome() {
  uni.reLaunch({ url: '/pages/index/index' })
}

function goPrivacy() {
  uni.navigateTo({ url: '/pages/mine/sub/privacy/index' })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding: 0 64rpx;
  box-sizing: border-box;
  justify-content: center;
}

.login-area {
  width: 100%;
}

.brand {
  padding: 40rpx 0 60rpx;

  &__icon {
    width: 160rpx;
    height: 160rpx;
    background-color: #09090B;
    margin-bottom: 32rpx;
    border: 2rpx solid rgba(255, 255, 255, 0.15);
  }

  &__title {
    font-family: 'Pacifico', cursive;
    font-size: 56rpx;
    font-weight: 700;
    color: var(--tt-foreground);
    letter-spacing: 2rpx;
  }
}

.login-content {
  width: 100%;
  margin-top: 60rpx;
  gap: 32rpx;
}

.agreement {
  gap: 8rpx;
}

.link {
  color: var(--tt-foreground, #09090B);
  font-weight: 500;
}

.btn-text {
  font-size: 30rpx;
  color: #ffffff;
  font-weight: 500;
}

.rounded-2xl {
  border-radius: 32rpx;
}
</style>
