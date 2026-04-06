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
    
    <DayDetail :dateLabel="selectedDateLabel" :detail="selectedDayDetail" />
    <MonthStats :stats="monthStats" />
    
    <TtBottomPlaceholder />
    <TtTabbar current="calendar" />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useThemeStore } from '@/stores/theme'
import { useProjectStore } from '@/stores/project'
import { getRecordsByMonth } from '@/api/record/getRecordsByMonth'
import { dayjs, formatDate } from '@/utils/date'
import DayDetail from './components/DayDetail.vue'
import MonthStats from './components/MonthStats.vue'

const themeStore = useThemeStore()
const projectStore = useProjectStore()
let _calendarLoaded = false

const currentMonth = ref(dayjs().format('YYYY-MM'))
const selectedDate = ref(formatDate(new Date()))
const records = ref([])
const projects = ref([])
const calendarData = ref({})

const headerPaddingTop = computed(() => `${themeStore.statusBarHeight + 12}px`)

const selectedDateLabel = computed(() => dayjs(selectedDate.value).format('M月D日 ddd'))

const selectedDayRecords = computed(() =>
  records.value.filter(r => r.date === selectedDate.value)
)

const selectedDayDetail = computed(() => {
  const activeProjects = projects.value.filter(p => !p.archived)
  return activeProjects.map(p => ({
    project: p,
    record: selectedDayRecords.value.find(r => r.projectId === p._id),
  }))
})

const monthStats = computed(() => {
  const daysInMonth = dayjs(currentMonth.value + '-01').daysInMonth()
  const today = formatDate(new Date())
  const activeCount = projects.value.filter(p => !p.archived).length
  
  if (activeCount === 0) return { doneDays: 0, totalDays: 0, percent: 0 }
  
  let doneDays = 0
  let totalDays = 0
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = dayjs(currentMonth.value + '-01').date(i).format('YYYY-MM-DD')
    if (dateStr > today) break
    totalDays++
    const data = calendarData.value[dateStr]
    if (data && data.done === data.total) doneDays++
  }
  
  const percent = totalDays > 0 ? Math.round((doneDays / totalDays) * 100) : 0
  return { doneDays, totalDays, percent }
})

function formatter(day) {
  const dateStr = formatDate(day.date)
  const data = calendarData.value[dateStr]
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
  selectedDate.value = formatDate(date)
}

async function onMonthChange(month) {
  currentMonth.value = month
  await loadMonthData(month + '-01')
}

async function loadMonthData(monthDate) {
  const res = await getRecordsByMonth(monthDate || dayjs().format('YYYY-MM-DD'))
  if (!res.success) return
  records.value = res.list
  projects.value = res.projects
  buildCalendarData()
}

function buildCalendarData() {
  const data = {}
  const total = projects.value.filter(p => !p.archived).length
  records.value.forEach(r => {
    if (!data[r.date]) data[r.date] = { done: 0, total }
    data[r.date].done++
  })
  calendarData.value = data
}

onShow(() => {
  themeStore.applyTheme()
  if (!_calendarLoaded || !projectStore.isCacheValid()) {
    loadMonthData()
    _calendarLoaded = true
  }
})
</script>
