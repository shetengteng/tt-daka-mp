<template>
  <view class="section px-xl mt-xl">
    <text class="text-xs text-muted mb-sm block px-xs">其他</text>
    <view class="card overflow-hidden">
      <view class="list-item flex-between p-lg" @click="onRefreshCache">
        <text class="text-sm text-foreground">刷新缓存</text>
        <TtSvg name="ri-arrow-right-s-line" :size="32" color="#71717A" />
      </view>
      <view class="list-item flex-between p-lg" @click="showAbout = true">
        <text class="text-sm text-foreground">关于 DaKa</text>
        <TtSvg name="ri-arrow-right-s-line" :size="32" color="#71717A" />
      </view>
      <view class="list-item flex-between p-lg" @click="goToPrivacy()">
        <text class="text-sm text-foreground">隐私政策</text>
        <TtSvg name="ri-arrow-right-s-line" :size="32" color="#71717A" />
      </view>
    </view>
  </view>

  <TtDialog
    v-model:visible="showAbout"
    title="关于 DaKa"
    :message="aboutMessage"
    :showCancel="false"
    confirmText="知道了"
  />

  <TtDialog
    v-model:visible="showRefreshDialog"
    title="刷新缓存"
    message="将重新从云端拉取最新数据，确定刷新吗？"
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
