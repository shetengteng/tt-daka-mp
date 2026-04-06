<template>
  <view v-if="visible" class="edit-mask" @click="close">
    <view class="edit-panel" @click.stop>
      <view class="edit-panel__header">
        <text class="text-lg font-semibold text-foreground">修改个人信息</text>
      </view>
      
      <view class="edit-panel__body">
        <view class="edit-avatar-section flex-col flex-center">
          <view class="edit-avatar flex-center rounded-full" @click="onChooseAvatarFallback">
            <image v-if="localAvatar" class="edit-avatar-img rounded-full" :src="localAvatar" mode="aspectFill" />
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
        
        <view class="edit-nickname-section">
          <text class="text-sm text-muted mb-sm block">昵称</text>
          <!-- #ifdef MP-WEIXIN -->
          <view class="edit-input card">
            <input type="nickname" v-model="localNickname" placeholder="请输入昵称" class="edit-input__inner" maxlength="20" />
          </view>
          <!-- #endif -->
          <!-- #ifndef MP-WEIXIN -->
          <TtInput v-model="localNickname" placeholder="请输入昵称" :maxlength="20" />
          <!-- #endif -->
        </view>
      </view>
      
      <view class="edit-panel__footer">
        <view class="edit-btn edit-btn--cancel" @click="close">
          <text class="text-sm text-muted">取消</text>
        </view>
        <view class="edit-btn edit-btn--save" @click="onSave">
          <text class="text-sm font-medium" style="color: var(--tt-background)">保存</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { fileToBase64, isLocalFile, compressImage } from '@/utils/file'

const userStore = useUserStore()

const props = defineProps({
  visible: { type: Boolean, default: false },
  nickname: { type: String, default: '' },
  avatar: { type: String, default: '' },
})

const emit = defineEmits(['update:visible', 'saved'])

const localNickname = ref('')
const localAvatar = ref('')
const saving = ref(false)

watch(() => props.visible, (val) => {
  if (val) {
    localNickname.value = props.nickname
    localAvatar.value = props.avatar
  }
})

function close() {
  emit('update:visible', false)
}

function onChooseAvatar(e) {
  const { avatarUrl } = e.detail
  if (avatarUrl) localAvatar.value = avatarUrl
}

function onChooseAvatarFallback() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      if (res.tempFilePaths && res.tempFilePaths[0]) {
        localAvatar.value = res.tempFilePaths[0]
      }
    },
  })
}

async function onSave() {
  if (saving.value) return
  const nickname = localNickname.value.trim()
  if (!nickname) {
    uni.showToast({ title: '昵称不能为空', icon: 'none' })
    return
  }

  saving.value = true
  try {
    let avatarData = localAvatar.value

    if (isLocalFile(avatarData)) {
      avatarData = await compressImage(avatarData)
      avatarData = await fileToBase64(avatarData)
    }

    const res = await userStore.updateProfile({ nickname, avatar: avatarData })
    if (res.success) {
      emit('saved', { nickname, avatar: avatarData })
      close()
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
</script>

<style lang="scss" scoped>
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
