<template>
  <view class="page px-xl py-lg">
    <text class="text-xs text-muted mb-lg block">更新日期：2026年4月1日</text>
    
    <view v-for="(section, idx) in sections" :key="idx" class="section mb-lg">
      <text class="text-sm font-semibold text-foreground mb-sm block">{{ section.title }}</text>
      <text class="text-sm text-foreground content">{{ section.content }}</text>
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

const sections = [
  {
    title: '1. 我们收集的信息',
    content: 'DaKa 仅收集以下必要信息以提供核心功能：\n• 微信登录凭证（用于生成匿名用户标识）\n• 打卡项目数据（项目名称、图标、颜色、频率设置）\n• 打卡记录数据（打卡日期、完成时间）\n\n我们不收集您的真实姓名、手机号、通讯录、位置信息或其他敏感个人信息。',
  },
  {
    title: '2. 信息的使用方式',
    content: '我们收集的信息仅用于：\n• 提供打卡记录、统计分析和日历展示功能\n• 在您的设备间同步打卡数据\n• 改善应用体验和修复问题\n\n我们不会将您的数据用于广告推送、用户画像或任何商业目的。',
  },
  {
    title: '3. 信息的存储与安全',
    content: '您的数据存储于阿里云 EMAS 云端服务器，采用加密传输。我们会采取合理的技术措施保护您的数据安全，但无法保证绝对安全。如因不可抗力（如服务器故障、网络中断等）导致数据丢失，我们不承担赔偿责任。',
  },
  {
    title: '4. 信息的共享与披露',
    content: '我们不会向任何第三方出售、出租或共享您的个人数据，除非：\n• 获得您的明确同意\n• 法律法规要求\n• 为保护用户或公众的安全',
  },
  {
    title: '5. 数据的删除',
    content: '您可以随时通过「我的 → 清除缓存」清除本地数据。如需删除云端数据，请通过应用内反馈渠道联系我们，我们将在 15 个工作日内处理。',
  },
  {
    title: '6. 未成年人保护',
    content: '本应用不面向 14 周岁以下的未成年人。如果我们发现在未获得父母或监护人同意的情况下收集了未成年人的信息，将尽快删除相关数据。',
  },
  {
    title: '7. 免责声明',
    content: 'DaKa 是一款个人习惯管理工具，仅供辅助记录使用，不构成任何医疗、健康或专业建议。用户应自行对打卡数据的准确性负责，补打卡功能仅为便利设计，不代表实际完成情况。本应用为免费使用，开发者保留随时修改、暂停或终止服务的权利，且无需提前通知。',
  },
  {
    title: '8. 政策的更新',
    content: '我们可能会不时更新本政策。更新后的政策将在应用内发布，继续使用本应用即表示您同意更新后的条款。',
  },
  {
    title: '9. 联系我们',
    content: '如对本政策有任何疑问，请通过应用内反馈渠道联系我们。',
  },
]
</script>

<style lang="scss" scoped>
.section {
  padding: 0 8rpx;
}

.content {
  line-height: 1.8;
  white-space: pre-wrap;
}
</style>
