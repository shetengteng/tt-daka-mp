<template>
  <view class="user-card card flex-center-v mt-lg" @click="onCardClick">
    <view class="avatar flex-center rounded-full">
      <image v-if="userStore.avatar" class="avatar-img rounded-full" :src="userStore.avatar" mode="aspectFill" />
      <TtSvg v-else name="ri-user-fill" :size="56" color="#ffffff" />
    </view>
    <view class="user-info flex-1">
      <text class="text-lg font-semibold text-foreground">{{ userStore.nickname }}</text>
      <text class="text-sm text-muted block">已坚持打卡 {{ userStore.totalDays }} 天</text>
    </view>
    <TtSvg v-if="editable" name="ri-arrow-right-s-line" :size="32" color="#71717A" />
  </view>

  <ProfileEditor
    v-model:visible="showEditor"
    :nickname="userStore.nickname"
    :avatar="userStore.avatar"
    @saved="onProfileSaved"
  />
</template>

<script setup>
import { ref, computed } from 'vue'
import { getLoginType } from '@/utils/auth'
import { useUserStore } from '@/stores/user'
import ProfileEditor from './ProfileEditor.vue'

const userStore = useUserStore()
const showEditor = ref(false)

const editable = computed(() => {
  const type = getLoginType()
  return type === 'wechat' || type === 'anonymous'
})

function onCardClick() {
  if (!editable.value) return
  showEditor.value = true
}

function onProfileSaved({ nickname, avatar }) {
  userStore.setUser({ nickname, avatar })
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
</style>
