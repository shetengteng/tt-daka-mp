<template>
  <view v-if="count > 0" class="offline-bar mx-xl mt-sm mb-sm px-lg py-sm rounded-lg flex-between">
    <view class="flex-center-v gap-xs">
      <view class="icon-wrap flex-center">
        <tt-icon name="ri-cloud-off-line" :size="32" color="#F59E0B" />
      </view>
      <text class="text-xs" style="color: #F59E0B">{{ count }} 条记录待同步</text>
    </view>
    <text class="sync-btn text-xs font-medium" style="color: #F59E0B" @click="onSync">
      {{ syncing ? '同步中...' : '立即同步' }}
    </text>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { syncPendingOps } from '@/utils/sync-manager'
import { useRecordStore } from '@/stores/record'
import { getPendingCount } from '@/utils/pending-ops'
import { getAccountId } from '@/utils/auth'

defineProps({ count: { type: Number, default: 0 } })

const syncing = ref(false)

async function onSync() {
  if (syncing.value) return
  syncing.value = true
  const res = await syncPendingOps()
  syncing.value = false

  const accountId = getAccountId()
  const recordStore = useRecordStore()
  recordStore.pendingCount = accountId ? getPendingCount(accountId) : 0

  if (res.synced > 0) {
    uni.showToast({ title: `已同步 ${res.synced} 条`, icon: 'success' })
  } else if (res.remaining === 0) {
    uni.showToast({ title: '已全部同步', icon: 'success' })
  } else {
    uni.showToast({ title: '同步失败，稍后重试', icon: 'none' })
  }
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
