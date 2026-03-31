<template>
  <view class="page px-xl py-lg">
    <view v-for="(item, idx) in items" :key="idx" class="item mb-lg">
      <text class="text-sm text-foreground" style="line-height: 1.8">{{ item }}</text>
    </view>
  </view>
</template>

<script setup>
import { onMounted } from 'vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()

onMounted(() => {
  themeStore.applyTheme()
})

const items = [
  '1. DaKa 是一款个人习惯管理工具，仅供辅助记录使用，不构成任何医疗、健康或专业建议。',
  '2. 用户数据存储于云端服务器，我们会尽力保障数据安全，但不对因不可抗力（如服务器故障、网络中断等）导致的数据丢失承担责任。',
  '3. 本应用不收集用户的敏感个人信息，仅使用微信授权的基本信息（昵称、头像）用于展示。',
  '4. 用户应自行对打卡数据的准确性负责，补打卡功能仅为便利设计，不代表实际完成情况。',
  '5. 本应用为免费使用，开发者保留随时修改、暂停或终止服务的权利，且无需提前通知。',
  '6. 使用本应用即表示您同意以上条款。如有疑问，请通过应用内反馈渠道联系我们。',
]
</script>

<style lang="scss" scoped>
.item {
  padding: 0 8rpx;
}
</style>
