<template>
  <tt-popup v-model:show="showPopup" position="center">
    <view class="edit-panel">
      <view class="edit-panel__header">
        <text class="text-lg font-semibold text-foreground">修改个人信息</text>
      </view>
      
      <view class="edit-panel__body">
        <view class="edit-avatar-section flex-col flex-center">
          <view class="edit-avatar flex-center rounded-full" @click="onChooseAvatarFallback">
            <image v-if="localAvatar" class="edit-avatar-img rounded-full" :src="localAvatar" mode="aspectFill" />
            <tt-icon v-else name="ri-user-fill" :size="48" color="#ffffff" />
          </view>
          <!-- #ifdef MP-WEIXIN -->
          <tt-button variant="outline" size="sm" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">更换头像</tt-button>
          <!-- #endif -->
          <!-- #ifndef MP-WEIXIN -->
          <tt-button variant="outline" size="sm" @click="onChooseAvatarFallback">更换头像</tt-button>
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
          <tt-input v-model="localNickname" type="nickname" placeholder="请输入昵称" :maxlength="20" clearable />
          <!-- #endif -->
        </view>
      </view>
      
      <view class="edit-panel__footer">
        <tt-button variant="secondary" class="flex-1" @click="close">取消</tt-button>
        <tt-button variant="default" class="flex-1" :loading="saving" @click="onSave">保存</tt-button>
      </view>
    </view>
  </tt-popup>
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
const showPopup = ref(false)

watch(() => props.visible, (val) => {
  showPopup.value = val
  if (val) {
    localNickname.value = props.nickname
    localAvatar.value = props.avatar
  }
})

watch(showPopup, (val) => {
  if (!val) emit('update:visible', false)
})

function close() {
  showPopup.value = false
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
.edit-panel {
  width: 80vw;
  max-width: 600rpx;
  padding: 40rpx;
  box-sizing: border-box;
}

.edit-panel__header {
  text-align: center;
  margin-bottom: 32rpx;
}

.edit-panel__body {
  margin-bottom: 40rpx;
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
}

.flex-1 {
  flex: 1;
}
</style>
