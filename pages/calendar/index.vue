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
import { onShow } from '@dcloudio/uni-app'
import { useThemeStore } from '@/stores/theme'
import { useProjectStore } from '@/stores/project'
import { useCalendarStore } from '@/stores/calendar'
import { getRecordsByMonth } from '@/api/record/getRecordsByMonth'
import { getAccountId } from '@/utils/auth'
import { checkDataVersion, updateLocalVersion } from '@/utils/version-check'
import { dayjs, formatDate } from '@/utils/date'
import DayDetail from './components/DayDetail.vue'
import MonthStats from './components/MonthStats.vue'

const themeStore = useThemeStore()
const projectStore = useProjectStore()
const calendarStore = useCalendarStore()
let _calendarLoaded = false

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
  const res = await getRecordsByMonth(monthDate || dayjs().format('YYYY-MM-DD'))
  if (!res.success) return
  calendarStore.setMonthData(res.list, res.projects)
}

onShow(async () => {
  themeStore.applyTheme()

  if (!_calendarLoaded) {
    await loadMonthData()
    _calendarLoaded = true
    return
  }

  if (projectStore.isCacheValid()) return

  const accountId = getAccountId()
  if (!accountId) { await loadMonthData(); return }

  const { needRefresh, version } = await checkDataVersion(accountId)
  if (needRefresh) {
    await loadMonthData()
    updateLocalVersion(accountId, version)
  } else {
    projectStore.markFresh()
  }
})
</script>
