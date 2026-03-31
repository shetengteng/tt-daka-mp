<template>
  <view class="page px-xl">
    <!-- 项目信息 -->
    <view v-if="project" class="project-header flex-col flex-center mt-lg mb-xl">
      <view class="big-icon flex-center rounded-xl" :style="{ backgroundColor: `${project.color}20` }">
        <TtSvg :name="project.icon || 'ri-checkbox-circle-line'" :size="64" :color="project.color" />
      </view>
      <text class="text-lg font-bold text-foreground mt-md">{{ project.name }}</text>
      <text class="text-sm text-muted">
        目标: {{ frequencyLabel }} · 创建于 {{ project.createTime?.slice(0, 10) }}
      </text>
    </view>
    
    <!-- 统计卡片 -->
    <view class="stat-grid mb-xl">
      <view class="card flex-col flex-center p-md">
        <text class="text-xl font-bold text-foreground">{{ detail.totalDays }}</text>
        <text class="text-xs text-muted mt-xs">总打卡</text>
      </view>
      <view class="card flex-col flex-center p-md">
        <text class="text-xl font-bold text-foreground">{{ detail.longestStreak }}</text>
        <text class="text-xs text-muted mt-xs">最长连续</text>
      </view>
      <view class="card flex-col flex-center p-md">
        <text class="text-xl font-bold text-foreground">{{ detail.currentStreak }}</text>
        <text class="text-xs text-muted mt-xs">当前连续</text>
      </view>
    </view>
    
    <!-- 日历 -->
    <view class="calendar-section mb-xl">
      <text class="text-sm font-semibold text-foreground mb-md block">打卡日历</text>
      <TtCalendar
        :formatter="formatter"
        @select="onDateSelect"
      />
    </view>
    
    <!-- 最近打卡记录 -->
    <view class="records-section mb-xl">
      <text class="text-sm font-semibold text-foreground mb-md block">最近打卡记录</text>
      <view class="card overflow-hidden">
        <view 
          v-for="record in recentRecords" 
          :key="record._id"
          class="record-item flex-between p-md border-b"
        >
          <text class="text-sm text-foreground">{{ formatRecordDate(record.date) }}</text>
          <view class="flex-center-v">
            <view v-if="record.isRetroactive" class="retro-tag">
              <text class="retro-tag__text">补</text>
            </view>
            <text class="text-xs text-muted">{{ formatRecordTime(record.completedAt) }}</text>
          </view>
        </view>
        <view v-if="recentRecords.length === 0" class="text-center py-md">
          <text class="text-sm text-muted">暂无打卡记录</text>
        </view>
        <view v-if="records.length > showCount" class="text-center p-md" @click="showMore">
          <text class="text-xs text-muted">查看更多 ↓</text>
        </view>
      </view>
    </view>
    
    <view class="pb-xl"></view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getProjectDetail } from './api/getProjectDetail'
import { retroactiveDaka } from './api/retroactiveDaka'
import { goToProjectEdit } from '@/route/index'
import { dayjs, formatDate } from '@/utils/date'

const projectId = ref('')
const project = ref(null)
const records = ref([])
const showCount = ref(10)
const detail = ref({ totalDays: 0, currentStreak: 0, longestStreak: 0 })

const recordDateSet = computed(() => new Set(records.value.map(r => r.date)))

const frequencyLabel = computed(() => {
  if (!project.value) return ''
  const f = project.value.frequency
  if (f === 'daily') return '每天'
  if (f === 'weekday') return '工作日'
  return '自定义'
})

const recentRecords = computed(() => records.value.slice(0, showCount.value))

function formatter(day) {
  const dateStr = formatDate(day.date)
  if (recordDateSet.value.has(dateStr)) {
    day.style = { backgroundColor: 'rgba(34,197,94,0.3)', borderRadius: '8rpx' }
  }
}

function formatRecordDate(date) {
  return dayjs(date).format('MM-DD ddd')
}

function formatRecordTime(dateTime) {
  if (!dateTime) return ''
  return dayjs(dateTime).format('HH:mm')
}

async function onDateSelect(date) {
  const dateStr = formatDate(date)
  const today = formatDate(new Date())
  
  if (dateStr > today) return
  if (recordDateSet.value.has(dateStr)) return
  
  const diffDays = dayjs(today).diff(dayjs(dateStr), 'day')
  if (diffDays > 7) {
    uni.showToast({ title: '只能补打卡最近7天', icon: 'none' })
    return
  }
  
  uni.showModal({
    title: '补打卡',
    content: `确定补打卡 ${dateStr} 吗？`,
    success: async (modalRes) => {
      if (modalRes.confirm) {
        const res = await retroactiveDaka(projectId.value, dateStr)
        if (res.success) {
          records.value.unshift(res.record)
          records.value.sort((a, b) => b.date.localeCompare(a.date))
          uni.showToast({ title: '补打卡成功', icon: 'success' })
        } else {
          uni.showToast({ title: res.error || '补打卡失败', icon: 'none' })
        }
      }
    }
  })
}

function showMore() {
  showCount.value += 10
}

async function loadDetail() {
  const res = await getProjectDetail(projectId.value)
  if (res.success) {
    project.value = res.data.project
    records.value = res.data.records
    detail.value = {
      totalDays: res.data.totalDays,
      currentStreak: res.data.currentStreak,
      longestStreak: res.data.longestStreak,
    }
    uni.setNavigationBarTitle({ title: res.data.project.name })
  }
}

onLoad((options) => {
  if (options?.id) {
    projectId.value = options.id
    loadDetail()
  }
})
</script>

<style lang="scss" scoped>
.big-icon {
  width: 128rpx;
  height: 128rpx;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24rpx;
}

.block {
  display: block;
}

.retro-tag {
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  background-color: rgba(249, 115, 22, 0.1);
  margin-right: 16rpx;

  &__text {
    font-size: 22rpx;
    color: #F97316;
  }
}

.pb-xl {
  padding-bottom: 48rpx;
}
</style>
