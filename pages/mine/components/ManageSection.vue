<template>
  <view class="section px-xl mt-xl">
    <text class="text-xs text-muted mb-sm block px-xs">打卡管理</text>
    <view class="card overflow-hidden">
      <view class="list-item flex-between p-lg" @click="goManage">
        <text class="text-sm text-foreground">打卡项目管理</text>
        <view class="flex-center-v gap-sm">
          <text v-if="statsStore.activeCount > 0" class="text-xs text-muted">{{ statsStore.activeCount }}</text>
          <tt-icon name="ri-arrow-right-s-line" :size="32" color="#71717A" />
        </view>
      </view>
      <view class="list-item flex-between p-lg" @click="goArchived">
        <text class="text-sm text-foreground">已归档项目</text>
        <view class="flex-center-v gap-sm">
          <text v-if="statsStore.archivedCount > 0" class="text-xs text-muted">{{ statsStore.archivedCount }}</text>
          <tt-icon name="ri-arrow-right-s-line" :size="32" color="#71717A" />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { useStatsStore } from '@/stores/stats'
import { goToProjectManage, goToProjectArchived } from '@/route/index'

const statsStore = useStatsStore()

function goManage() { goToProjectManage() }
function goArchived() { goToProjectArchived() }
</script>
