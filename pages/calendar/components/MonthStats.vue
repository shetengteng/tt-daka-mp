<template>
  <view class="card flex-between p-md mt-md mb-lg mx-xl">
    <text class="text-xs text-muted">本月</text>
    <text class="text-sm font-semibold text-foreground">
      {{ stats.doneDays }}/{{ stats.totalDays }} 天 · 完成率 {{ stats.percent }}%
    </text>
  </view>
</template>

<script setup>
defineProps({
  stats: { type: Object, default: () => ({ doneDays: 0, totalDays: 0, percent: 0 }) },
})
</script>
