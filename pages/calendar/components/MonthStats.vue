<template>
  <view class="card flex-between p-md mt-md mb-lg mx-xl">
    <text class="text-xs text-muted">本月</text>
    <text class="text-sm font-semibold text-foreground">
      {{ stats.doneDays }}/{{ stats.totalDays }} 天 · 完成率 {{ stats.percent }}%
    </text>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { useCalendarStore } from '@/stores/calendar'
import { dayjs, formatDate } from '@/utils/date'

const calendarStore = useCalendarStore()

const stats = computed(() => {
  const daysInMonth = dayjs(calendarStore.currentMonth + '-01').daysInMonth()
  const today = formatDate(new Date())
  const activeCount = calendarStore.activeProjects.length
  
  if (activeCount === 0) return { doneDays: 0, totalDays: 0, percent: 0 }
  
  let doneDays = 0
  let totalDays = 0
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = dayjs(calendarStore.currentMonth + '-01').date(i).format('YYYY-MM-DD')
    if (dateStr > today) break
    totalDays++
    const data = calendarStore.calendarData[dateStr]
    if (data && data.done === data.total) doneDays++
  }
  
  const percent = totalDays > 0 ? Math.round((doneDays / totalDays) * 100) : 0
  return { doneDays, totalDays, percent }
})
</script>
