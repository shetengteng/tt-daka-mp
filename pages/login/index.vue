<template>
  <view class="page flex-col flex-center bg-background" :class="{ 'theme-dark': themeStore.mode === 'dark' }" :style="themeStore.themeStyle">
    <view class="login-area flex-col flex-center">
      <!-- 品牌区域 -->
      <view class="brand flex-col flex-center">
        <view class="brand__icon flex-center rounded-2xl">
          <TtSvg name="ri-checkbox-circle-line" :size="80" color="#ffffff" />
        </view>
        <text class="brand__title">DaKa</text>
        <text class="text-sm text-muted mt-xs">坚持每一天的好习惯</text>
      </view>

      <!-- 登录内容 -->
      <view class="login-content flex-col flex-center">
        <!-- 协议勾选 -->
        <view class="agreement flex-center-v" @click="agreed = !agreed">
          <view class="checkbox flex-center" :class="{ 'checkbox--checked': agreed }">
            <image v-if="agreed" class="checkbox__icon" src="/static/icons/check-white.svg" mode="aspectFit" />
          </view>
          <text class="text-xs text-muted">我已阅读并同意</text>
          <text class="text-xs link" @click.stop="goPrivacy">《隐私政策》</text>
        </view>

        <!-- #ifdef MP-WEIXIN -->
        <button class="wechat-btn flex-center" :disabled="loading" @click="handleWechatLogin">
          <TtSvg name="ri-wechat-fill" :size="36" color="#ffffff" />
          <text class="wechat-btn__text">{{ loading ? '登录中...' : '微信一键登录' }}</text>
        </button>
        <!-- #endif -->

        <!-- #ifdef H5 -->
        <view class="dev-btn flex-center" @click="handleDevLogin">
          <text class="dev-btn__text">{{ loading ? '登录中...' : '开发模式登录' }}</text>
        </view>
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
import { isLoggedIn, getAccountId, setAccountId } from '@/utils/auth'
import { initEmas } from '@/cloud-emas/database/index'
import { anonymousAuth } from '@/cloud-emas/database/api/anonymousAuth'

const agreed = ref(false)
const loading = ref(false)
const themeStore = useThemeStore()

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
  setAccountId('mock_user')
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
    await anonymousAuth()
    const stored = getAccountId()
    if (!stored) {
      setAccountId(`wx_${Date.now()}`)
    }
    goHome()
  } catch (error) {
    console.error('[Login] 微信登录失败:', error)
    uni.showToast({ title: '登录失败，请重试', icon: 'none' })
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

.checkbox {
  width: 36rpx;
  height: 36rpx;
  border-radius: 8rpx;
  border: 2rpx solid var(--tt-disabled, #D4D4D8);
  flex-shrink: 0;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &--checked {
    background-color: #09090B;
    border-color: rgba(255, 255, 255, 0.2);
  }

  &__icon {
    width: 22rpx;
    height: 22rpx;
  }
}

.link {
  color: var(--tt-foreground, #09090B);
  font-weight: 500;
}

.wechat-btn {
  width: 100%;
  height: 96rpx;
  background-color: #07C160 !important;
  border-radius: 24rpx;
  border: none;
  gap: 16rpx;

  &::after {
    border: none;
  }

  &[disabled] {
    opacity: 0.6;
  }

  &__text {
    font-size: 30rpx;
    color: #ffffff;
    font-weight: 500;
  }
}

.dev-btn {
  width: 100%;
  height: 96rpx;
  background-color: var(--tt-foreground, #09090B);
  border-radius: 24rpx;

  &__text {
    font-size: 30rpx;
    color: var(--tt-background, #ffffff);
    font-weight: 500;
  }
}

.rounded-2xl {
  border-radius: 32rpx;
}
</style>
