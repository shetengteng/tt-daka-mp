<template>
  <view class="section px-xl mt-xl">
    <text class="text-xs text-muted mb-sm block px-xs">其他</text>
    <view class="card overflow-hidden">
      <tt-cell title="刷新缓存" is-link @click="onRefreshCache" />
      <tt-cell title="关于 DaKa" is-link @click="showAbout = true" />
      <tt-cell title="隐私政策" is-link :border="false" @click="goToPrivacy()" />
    </view>
  </view>

  <tt-dialog
    v-model:show="showAbout"
    title="关于 DaKa"
    :message="aboutMessage"
    :show-cancel-button="false"
    confirm-text="知道了"
  />

  <tt-dialog
    v-model:show="showRefreshDialog"
    title="刷新缓存"
    message="将重新从云端拉取最新数据，确定刷新吗？"
    confirm-text="确定"
    cancel-text="取消"
    @confirm="onRefreshConfirm"
  />
</template>

<script setup>
import { ref } from 'vue'
import { goToPrivacy } from '@/route/index'
import { useProjectStore } from '@/stores/project'

const emit = defineEmits(['refresh'])

const projectStore = useProjectStore()
const showAbout = ref(false)
const showRefreshDialog = ref(false)

const aboutMessage = 'DaKa 是一款简洁高效的打卡习惯养成工具。\n\n支持自定义打卡项目、多种频率设置、补打卡、日历视图和统计分析，帮助你坚持每一天的好习惯。\n\n版本: v1.0.0'

function onRefreshCache() {
  showRefreshDialog.value = true
}

async function onRefreshConfirm() {
  projectStore.markDirty()
  emit('refresh')
  uni.showToast({ title: '缓存已刷新', icon: 'success' })
}
</script>
