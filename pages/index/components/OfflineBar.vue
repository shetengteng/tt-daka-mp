<template>
  <view v-if="count > 0" class="offline-bar mx-xl mt-sm mb-sm px-lg py-sm rounded-lg flex-between items-center">
    <view class="flex-center-v gap-xs">
      <TtSvg name="ri-cloud-off-line" :size="16" color="#F59E0B" />
      <text class="text-xs" style="color: #F59E0B">{{ count }} 条记录待同步</text>
    </view>
    <text class="text-xs font-medium" style="color: #F59E0B" @click="onSync">立即同步</text>
  </view>
</template>

<script setup>
import { syncPendingOps } from '@/utils/sync-manager'
import { getAccountId } from '@/utils/auth'

defineProps({ count: { type: Number, default: 0 } })

async function onSync() {
  const accountId = getAccountId()
  if (accountId) {
    await syncPendingOps(accountId)
  }
}
</script>

<style lang="scss" scoped>
.offline-bar {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.2);
}
</style>
