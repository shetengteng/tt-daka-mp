<template>
  <view class="page">
    <!-- 顶部区域 -->
    <view class="header px-xl pt-lg">
      <view class="flex-between">
        <text class="app-title text-foreground">DaKa</text>
        <text class="text-sm text-muted">{{ todayLabel }}</text>
      </view>
      
      <!-- 今日进度 -->
      <view v-if="activeProjects.length > 0" class="progress-section card p-lg mt-xl mb-lg">
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
      <view v-if="!loading && activeProjects.length === 0" class="empty-state flex-col flex-center py-xl">
        <TtEmpty description="还没有打卡项目" />
        <view class="tt-btn tt-btn--primary mt-lg" @click="goAdd">
          <text class="tt-btn__text">+ 创建打卡项目</text>
        </view>
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
import { ref, computed, onMounted } from 'vue'
import { onPullDownRefresh } from '@dcloudio/uni-app'
import { useDakaStore } from '@/stores/daka'
import { getProjectList } from './api/getProjectList'
import { toggleDaka } from './api/toggleDaka'
import { goToProjectAdd, goToProjectDetail, goToProjectEdit } from '@/route/index'
import { dayjs, formatDate } from '@/utils/date'
import DakaCard from './components/DakaCard.vue'

const dakaStore = useDakaStore()

const loading = ref(false)
const showActionSheet = ref(false)
const showCancelDialog = ref(false)
const currentActionId = ref('')
const streakMap = ref({})
const totalDaysMap = ref({})

const todayLabel = computed(() => dayjs().format('YYYY.MM.DD'))

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

onMounted(() => {
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
</script>

<style lang="scss" scoped>
.header {
  padding-top: calc(var(--status-bar-height, 44px) + 24rpx);
  /* #ifdef MP-WEIXIN */
  padding-right: 200rpx;
  /* #endif */
}

.progress-bar {
  height: 16rpx;
  background-color: #E4E4E7;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #22C55E;
  transition: width 0.3s ease;
  min-width: 0;
}

.app-title {
  font-size: 48rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
  font-family: 'Pacifico', 'PingFang SC', cursive;
}

.add-btn {
  border: 3rpx dashed #E4E4E7;
  padding: 32rpx;
}

.tt-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx 40rpx;
  border-radius: 20rpx;

  &--primary {
    background: #09090B;
  }

  &__text {
    font-size: 28rpx;
    color: #ffffff;
    font-weight: 500;
  }
}
</style>
