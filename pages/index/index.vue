<template>
  <view class="page" :class="{ 'theme-dark': themeStore.mode === 'dark' }" :style="themeStore.themeStyle">
    <!-- 顶部区域 -->
    <view class="header px-xl pt-lg" :style="{ paddingTop: `${themeStore.statusBarHeight + 12}px` }">
      <view class="header__top flex-between items-start" :style="capsuleStyle">
        <view>
          <text class="app-title text-foreground">DaKa</text>
          <view class="header__greeting">
            <text class="text-xs text-muted">{{ greeting }}</text>
          </view>
        </view>
        <view class="header__date-badge flex-center-v" @click="goCalendar">
          <text class="header__date-day">{{ todayDay }}</text>
          <view class="header__date-info">
            <text class="header__date-month">{{ todayMonth }}</text>
            <text class="header__date-weekday">{{ todayWeekday }}</text>
          </view>
        </view>
      </view>
      
      <!-- 今日进度 -->
      <view v-if="activeProjects.length > 0" class="progress-section card p-lg mt-lg mb-lg">
        <view class="flex-between mb-sm">
          <text class="text-sm text-muted">今日进度</text>
          <text class="text-sm font-semibold text-foreground">
            {{ todayProgress.done }}/{{ todayProgress.total }}
          </text>
        </view>
        <view class="progress-bar rounded-full">
          <view 
            class="progress-fill rounded-full" 
            :style="{ width: `${todayProgress.percent}%` }"
          ></view>
        </view>
      </view>
    </view>
    
    <!-- 打卡列表 -->
    <view class="list-section px-xl mt-md">
      <DakaCard
        v-for="item in cardList"
        :key="item.project._id"
        :project="item.project"
        :checked="item.checked"
        :streak="item.streak"
        :totalDays="item.totalDays"
        @toggle="onToggle"
        @card-tap="onCardTap"
        @card-longpress="onCardLongpress"
      />
      
      <!-- 空状态 -->
      <view v-if="!loading && activeProjects.length === 0" class="empty-state flex-col flex-center">
        <view class="empty-state__icon flex-center rounded-xl">
          <TtSvg name="ri-checkbox-circle-line" :size="48" color="#D4D4D8" />
        </view>
        <text class="text-sm text-muted mt-md">还没有打卡项目</text>
        <TtButton text="+ 创建打卡项目" type="primary" class="mt-lg" @click="goAdd" />
      </view>
      
      <!-- 新建按钮 -->
      <view 
        v-if="activeProjects.length > 0" 
        class="add-btn flex-center rounded-xl mt-md mb-lg"
        @click="goAdd"
      >
        <TtSvg name="ri-add-line" :size="28" color="#71717A" />
        <text class="text-sm text-muted ml-xs">新建打卡项目</text>
      </view>
    </view>
    
    <TtBottomPlaceholder />
    <TtTabbar current="home" />
    
    <!-- 操作菜单 -->
    <TtActionSheet
      v-model:visible="showActionSheet"
      :items="actionSheetItems"
      @select="onActionSelect"
    />
    
    <!-- 确认取消打卡 -->
    <TtDialog
      v-model:visible="showCancelDialog"
      title="取消打卡"
      message="确定取消今天的打卡记录吗？"
      @confirm="confirmCancelDaka"
    />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { useThemeStore } from '@/stores/theme'
import { useDakaStore } from '@/stores/daka'
import { getProjectList } from './api/getProjectList'
import { toggleDaka } from './api/toggleDaka'
import { goToProjectAdd, goToProjectDetail, goToProjectEdit } from '@/route/index'
import { dayjs, formatDate } from '@/utils/date'
import DakaCard from './components/DakaCard.vue'

const themeStore = useThemeStore()
const dakaStore = useDakaStore()

const capsuleStyle = computed(() => {
  if (themeStore.capsuleRight > 0) {
    const headerPadding = 20
    const gap = 8
    const pr = Math.max(themeStore.capsuleRight - headerPadding + gap, 0)
    return { paddingRight: `${pr}px` }
  }
  return {}
})
const loading = ref(false)
const showActionSheet = ref(false)
const showCancelDialog = ref(false)
const currentActionId = ref('')
const streakMap = ref({})
const totalDaysMap = ref({})

const todayDay = computed(() => dayjs().format('D'))
const todayMonth = computed(() => dayjs().format('MMM').toUpperCase())
const todayWeekday = computed(() => dayjs().format('ddd'))

const greeting = computed(() => {
  const hour = dayjs().hour()
  if (hour < 6) return '夜深了，早点休息'
  if (hour < 12) return '早上好，新的一天开始了'
  if (hour < 14) return '中午好，记得休息'
  if (hour < 18) return '下午好，继续加油'
  return '晚上好，今天辛苦了'
})

const activeProjects = computed(() => dakaStore.activeProjects)
const todayProgress = computed(() => dakaStore.todayProgress)

const todayRecordMap = computed(() => {
  const map = {}
  dakaStore.todayRecords.forEach(r => {
    map[r.projectId] = r
  })
  return map
})

const cardList = computed(() => {
  return activeProjects.value.map(p => ({
    project: p,
    checked: !!todayRecordMap.value[p._id],
    streak: streakMap.value[p._id] || 0,
    totalDays: totalDaysMap.value[p._id] || 0,
  }))
})

const actionSheetItems = [
  { label: '编辑', value: 'edit' },
  { label: '归档', value: 'archive' },
  { label: '删除', value: 'delete', color: '#EF4444' },
]

onShow(() => {
  themeStore.applyTheme()
  loadData()
})

onPullDownRefresh(async () => {
  await loadData()
  uni.stopPullDownRefresh()
})

async function loadData() {
  loading.value = true
  const res = await getProjectList()
  if (res.success) {
    dakaStore.setProjects(res.list)
    dakaStore.setTodayRecords(res.todayRecords)
  }
  loading.value = false
}

async function onToggle(projectId) {
  const isChecked = !!todayRecordMap.value[projectId]
  
  if (isChecked) {
    currentActionId.value = projectId
    showCancelDialog.value = true
    return
  }
  
  uni.vibrateShort()
  const res = await toggleDaka(projectId, false)
  if (res.success && res.record) {
    dakaStore.addTodayRecord(res.record)
  }
}

async function confirmCancelDaka() {
  const res = await toggleDaka(currentActionId.value, true)
  if (res.success) {
    dakaStore.removeTodayRecord(currentActionId.value)
  }
  showCancelDialog.value = false
}

function onCardTap(id) {
  if (!id || typeof id !== 'string') return
  goToProjectDetail(id)
}

function onCardLongpress(id) {
  if (!id || typeof id !== 'string') return
  currentActionId.value = id
  showActionSheet.value = true
}

function onActionSelect(item) {
  showActionSheet.value = false
  if (item.value === 'edit') {
    goToProjectEdit(currentActionId.value)
  } else if (item.value === 'archive') {
    // TODO: archiveProject API
  } else if (item.value === 'delete') {
    // TODO: deleteProject API with confirm
  }
}

function goAdd() {
  goToProjectAdd()
}

function goCalendar() {
  uni.switchTab({ url: '/pages/calendar/index' })
}
</script>

<style lang="scss" scoped>
.header__date-badge {
  padding: 12rpx 20rpx;
  flex-shrink: 0;
  gap: 12rpx;
  background-color: var(--tt-card);
  border-radius: 16rpx;
}

.header__date-day {
  font-size: 48rpx;
  font-weight: 700;
  line-height: 1;
  color: var(--tt-foreground);
}

.header__date-info {
  display: flex;
  flex-direction: column;
}

.header__date-month {
  font-size: 20rpx;
  font-weight: 600;
  letter-spacing: 2rpx;
  color: var(--tt-muted-foreground);
  line-height: 1.3;
}

.header__date-weekday {
  font-size: 20rpx;
  font-weight: 500;
  color: var(--tt-muted-foreground);
  line-height: 1.3;
}

.empty-state {
  min-height: 60vh;
}

.empty-state__icon {
  width: 120rpx;
  height: 120rpx;
  background-color: var(--tt-card, #F4F4F5);
}

.progress-bar {
  height: 16rpx;
  background-color: var(--tt-border, #E4E4E7);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: var(--tt-success, #22C55E);
  transition: width 0.3s ease;
  min-width: 0;
}

.app-title {
  font-size: 40rpx;
  font-weight: 700;
  letter-spacing: 1rpx;
  line-height: 1.2;
  font-family: 'Pacifico', 'PingFang SC', cursive;
}

.header__greeting {
  margin-top: 4rpx;
}

.add-btn {
  border: 3rpx dashed var(--tt-border, #E4E4E7);
  padding: 32rpx;
}

</style>
