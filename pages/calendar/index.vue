<template>
  <view class="page" :class="{ 'theme-dark': themeStore.mode === 'dark' }" :style="themeStore.themeStyle">
    <view class="header px-xl pt-lg" :style="{ paddingTop: headerPaddingTop }">
      <text class="text-xl font-bold text-foreground">打卡日历</text>
    </view>
    
    <!-- 日历 -->
    <view class="calendar-section px-xl mt-xl">
      <TtCalendar
        :formatter="formatter"
        @select="onDateSelect"
        @month-change="onMonthChange"
      />
    </view>
    
    <!-- 选中日期详情 -->
    <view class="detail-section px-xl mt-xl">
      <text class="text-sm font-semibold text-foreground mb-md block">{{ selectedDateLabel }}</text>
      
      <view v-if="selectedDayDetail.length > 0" class="card overflow-hidden">
        <view 
          v-for="(item, idx) in selectedDayDetail" 
          :key="item.project._id"
          class="detail-item flex-center-v p-md"
          :class="{ 'border-b': idx < selectedDayDetail.length - 1 }"
          @click="onDetailTap(item.project._id)"
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
      
      <!-- 本月统计 -->
      <view class="card flex-between p-md mt-md mb-lg">
        <text class="text-xs text-muted">本月</text>
        <text class="text-sm font-semibold text-foreground">
          {{ monthStats.doneDays }}/{{ monthStats.totalDays }} 天 · 完成率 {{ monthStats.percent }}%
        </text>
      </view>
    </view>
    
    <TtBottomPlaceholder />
    <TtTabbar current="calendar" />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useThemeStore } from '@/stores/theme'
import { useDakaStore } from '@/stores/daka'
import { getRecordsByMonth } from './api/getRecordsByMonth'
import { goToProjectDetail } from '@/route/index'
import { dayjs, formatDate } from '@/utils/date'

const dakaStore = useDakaStore()
let _calendarLoaded = false

const currentMonth = ref(dayjs().format('YYYY-MM'))
const selectedDate = ref(formatDate(new Date()))
const records = ref([])
const projects = ref([])
const calendarData = ref({})

const selectedDateLabel = computed(() => {
  return dayjs(selectedDate.value).format('M月D日 ddd')
})

const projectMap = computed(() => {
  const map = {}
  projects.value.forEach(p => { map[p._id] = p })
  return map
})

const selectedDayRecords = computed(() => {
  return records.value.filter(r => r.date === selectedDate.value)
})

const selectedDayDetail = computed(() => {
  const activeProjects = projects.value.filter(p => !p.archived)
  return activeProjects.map(p => {
    const record = selectedDayRecords.value.find(r => r.projectId === p._id)
    return { project: p, record }
  })
})

const monthStats = computed(() => {
  const daysInMonth = dayjs(currentMonth.value + '-01').daysInMonth()
  const today = formatDate(new Date())
  const monthStart = currentMonth.value + '-01'
  
  let doneDays = 0
  let totalDays = 0
  const activeCount = projects.value.filter(p => !p.archived).length
  
  if (activeCount === 0) return { doneDays: 0, totalDays: 0, percent: 0 }
  
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

function formatTime(dateTime) {
  if (!dateTime) return ''
  return dayjs(dateTime).format('HH:mm')
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
  const activeProjects = projects.value.filter(p => !p.archived)
  const total = activeProjects.length
  
  records.value.forEach(r => {
    if (!data[r.date]) data[r.date] = { done: 0, total }
    data[r.date].done++
  })
  
  calendarData.value = data
}

function onDetailTap(projectId) {
  goToProjectDetail(projectId)
}

const themeStore = useThemeStore()
const headerPaddingTop = computed(() => `${themeStore.statusBarHeight + 12}px`)

onShow(() => {
  themeStore.applyTheme()
  if (!_calendarLoaded || dakaStore.isCacheValid() === false) {
    loadMonthData()
    _calendarLoaded = true
  }
})
</script>

<style lang="scss" scoped>
.detail-bar {
  width: 6rpx;
  height: 64rpx;
  border-radius: 9999rpx;
  flex-shrink: 0;
  margin-right: 20rpx;
}

.block {
  display: block;
}
</style>
