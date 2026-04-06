<template>
  <view v-if="count > 0" class="offline-bar mx-xl mt-sm mb-sm px-lg py-sm rounded-lg flex-between">
    <view class="flex-center-v gap-xs">
      <view class="icon-wrap flex-center">
        <TtSvg name="ri-cloud-off-line" :size="32" color="#F59E0B" />
      </view>
      <text class="text-xs" style="color: #F59E0B">{{ count }} 条记录待同步</text>
    </view>
    <text class="sync-btn text-xs font-medium" style="color: #F59E0B" @click="onSync">立即同步</text>
  </view>
</template>

<script setup>
import { syncPendingOps } from '@/utils/sync-manager'

defineProps({ count: { type: Number, default: 0 } })

async function onSync() {
  await syncPendingOps()
}
</script>

<style lang="scss" scoped>
.offline-bar {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.2);
  align-items: center;
}

.icon-wrap {
  width: 32rpx;
  height: 32rpx;
  flex-shrink: 0;
}

.sync-btn {
  flex-shrink: 0;
}
</style>
