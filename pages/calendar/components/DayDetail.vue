<template>
  <view class="detail-section px-xl mt-xl">
    <text class="text-sm font-semibold text-foreground mb-md block">{{ dateLabel }}</text>
    
    <view v-if="detail.length > 0" class="card overflow-hidden">
      <view 
        v-for="(item, idx) in detail" 
        :key="item.project._id"
        class="detail-item flex-center-v p-md"
        :class="{ 'border-b': idx < detail.length - 1 }"
        @click="goToProjectDetail(item.project._id)"
      >
        <view class="detail-bar" :style="{ backgroundColor: item.record ? '#22C55E' : 'transparent' }"></view>
        <TtSvg :name="item.project.icon || 'ri-checkbox-circle-line'" :size="32" :color="item.project.color" class="ml-sm" />
        <text class="text-sm font-medium text-foreground flex-1 ml-md">{{ item.project.name }}</text>
        <text class="text-xs" :style="{ color: item.record ? '#71717A' : '#D4D4D8' }">
          {{ item.record ? formatTime(item.record.completedAt) + ' 打卡' : '未打卡' }}
        </text>
      </view>
    </view>
    
    <view v-else class="card text-center py-lg">
      <text class="text-sm text-muted">该日无打卡记录</text>
    </view>
  </view>
</template>

<script setup>
import { goToProjectDetail } from '@/route/index'
import { dayjs } from '@/utils/date'

const props = defineProps({
  dateLabel: { type: String, default: '' },
  detail: { type: Array, default: () => [] },
})

function formatTime(dateTime) {
  if (!dateTime) return ''
  return dayjs(dateTime).format('HH:mm')
}
</script>

<style lang="scss" scoped>
.detail-bar {
  width: 6rpx;
  height: 64rpx;
  border-radius: 9999rpx;
  flex-shrink: 0;
  margin-right: 20rpx;
}
</style>
