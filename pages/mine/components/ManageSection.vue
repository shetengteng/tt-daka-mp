<template>
  <view class="section px-xl mt-xl">
    <text class="text-xs text-muted mb-sm block px-xs">打卡管理</text>
    <view class="card overflow-hidden">
      <tt-cell title="打卡项目管理" :value="statsStore.activeCount > 0 ? String(statsStore.activeCount) : ''" is-link @click="goManage" />
      <tt-cell title="已归档项目" :value="statsStore.archivedCount > 0 ? String(statsStore.archivedCount) : ''" is-link :border="false" @click="goArchived" />
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
