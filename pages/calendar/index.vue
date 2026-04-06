<template>
  <view class="page" :class="{ 'theme-dark': themeStore.mode === 'dark' }" :style="themeStore.themeStyle">
    <view class="header px-xl pt-lg" :style="{ paddingTop: headerPaddingTop }">
      <text class="text-xl font-bold text-foreground">打卡日历</text>
    </view>
    
    <view class="calendar-section px-xl mt-xl">
      <TtCalendar
        :formatter="formatter"
        @select="onDateSelect"
        @month-change="onMonthChange"
      />
    </view>
    
    <DayDetail />
    <MonthStats />
    
    <TtBottomPlaceholder />
    <TtTabbar current="calendar" />
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { useThemeStore } from '@/stores/theme'
import { useRecordStore } from '@/stores/record'
import { useCalendarStore } from '@/stores/calendar'
import { usePageFresh } from '@/composables/usePageFresh'
import { dayjs, formatDate } from '@/utils/date'
import DayDetail from './components/DayDetail.vue'
import MonthStats from './components/MonthStats.vue'

const themeStore = useThemeStore()
const recordStore = useRecordStore()
const calendarStore = useCalendarStore()
const { needRefresh, forceCheck, markLoaded } = usePageFresh('calendar')

const headerPaddingTop = computed(() => `${themeStore.statusBarHeight + 12}px`)

function formatter(day) {
  const dateStr = formatDate(day.date)
  const data = calendarStore.calendarData[dateStr]
  if (!data) return
  const { done, total } = data
  if (done === total && total > 0) {
    day.style = { backgroundColor: 'rgba(34,197,94,0.18)' }
    day.bottom = `${done}/${total}`
  } else if (done > 0) {
    day.style = { backgroundColor: 'rgba(249,115,22,0.18)' }
    day.bottom = `${done}/${total}`
  }
}

function onDateSelect(date) {
  calendarStore.setSelectedDate(formatDate(date))
}

async function onMonthChange(month) {
  calendarStore.setCurrentMonth(month)
  await loadMonthData(month + '-01')
}

async function loadMonthData(monthDate) {
  const res = await recordStore.fetchMonthRecords(monthDate || dayjs().format('YYYY-MM-DD'))
  if (!res.success) return
  calendarStore.setMonthData(res.list, res.projects)
  markLoaded()
}

onShow(async () => {
  themeStore.applyTheme()
  if (await needRefresh()) await loadMonthData()
})

onPullDownRefresh(async () => {
  if (await forceCheck()) {
    await loadMonthData()
  } else {
    uni.showToast({ title: '已是最新', icon: 'none' })
  }
  uni.stopPullDownRefresh()
})
</script>
