<template>
  <view class="page" :class="{ 'theme-dark': themeStore.mode === 'dark' }" :style="themeStore.themeStyle">
    <DakaHeader
      :statusBarHeight="themeStore.statusBarHeight"
      :capsuleStyle="capsuleStyle"
      :showProgress="activeProjects.length > 0"
      :progress="todayProgress"
    />
    
    <OfflineBar :count="recordStore.pendingCount" />

    <!-- 打卡列表 -->
    <view class="list-section px-xl mt-md">
      <DakaCard
        v-for="p in activeProjects"
        :key="p._id"
        :projectId="p._id"
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
        class="add-btn flex-center rounded-xl mt-md"
        @click="goAdd"
      >
        <TtSvg name="ri-add-line" :size="28" color="#71717A" />
        <text class="text-sm text-muted ml-xs">新建打卡项目</text>
      </view>
      
      <text v-if="activeProjects.length > 0" class="text-xs text-muted block text-center mt-sm mb-lg" style="opacity:0.6">长按卡片可编辑、归档或删除</text>
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
    
    <!-- 确认删除项目 -->
    <TtDialog
      v-model:visible="showDeleteDialog"
      title="删除项目"
      message="删除后所有打卡记录将一并删除，且不可恢复。"
      @confirm="confirmDeleteProject"
    />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { useThemeStore } from '@/stores/theme'
import { useProjectStore } from '@/stores/project'
import { useRecordStore } from '@/stores/record'
import { syncPendingOps } from '@/utils/sync-manager'
import { getAccountId } from '@/utils/auth'
import { goToProjectAdd, goToProjectDetail, goToProjectEdit } from '@/route/index'
import DakaCard from './components/DakaCard.vue'
import DakaHeader from './components/DakaHeader.vue'
import OfflineBar from './components/OfflineBar.vue'

const themeStore = useThemeStore()
const projectStore = useProjectStore()
const recordStore = useRecordStore()

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
const showDeleteDialog = ref(false)
const currentActionId = ref('')

const activeProjects = computed(() => projectStore.activeList)
const todayProgress = computed(() => recordStore.todayProgress)

const actionSheetItems = [
  { label: '编辑', value: 'edit' },
  { label: '归档', value: 'archive' },
  { label: '删除', value: 'delete', color: '#EF4444' },
]

onShow(async () => {
  themeStore.applyTheme()
  const need = await projectStore.checkFresh()
  if (need) await loadData()
})

onPullDownRefresh(async () => {
  const accountId = getAccountId()
  if (accountId) await syncPendingOps(accountId)
  projectStore.markDirty()
  const need = await projectStore.checkFresh()
  if (need) {
    recordStore.markDirty()
    await loadData()
  } else {
    uni.showToast({ title: '已是最新', icon: 'none' })
  }
  uni.stopPullDownRefresh()
})

async function loadData() {
  loading.value = true
  const res = await projectStore.fetchProjectList()
  if (res.success) recordStore.markFresh()
  loading.value = false
}

async function onToggle(projectId) {
  const isChecked = recordStore.todayRecords.some(r => r.projectId === projectId)
  
  if (isChecked) {
    currentActionId.value = projectId
    showCancelDialog.value = true
    return
  }
  
  uni.vibrateShort()
  await recordStore.toggle(projectId, false)
}

async function confirmCancelDaka() {
  await recordStore.toggle(currentActionId.value, true)
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

async function onActionSelect(item) {
  showActionSheet.value = false
  if (item.value === 'edit') {
    goToProjectEdit(currentActionId.value)
  } else if (item.value === 'archive') {
    const res = await projectStore.archive(currentActionId.value, true)
    if (res.success) {
      uni.showToast({ title: '已归档', icon: 'success' })
    } else {
      uni.showToast({ title: res.error || '归档失败', icon: 'none' })
    }
  } else if (item.value === 'delete') {
    showDeleteDialog.value = true
  }
}

async function confirmDeleteProject() {
  const res = await projectStore.removeProject(currentActionId.value)
  if (res.success) {
    uni.showToast({ title: '已删除', icon: 'success' })
  } else {
    uni.showToast({ title: res.error || '删除失败', icon: 'none' })
  }
  showDeleteDialog.value = false
}

function goAdd() {
  goToProjectAdd()
}

</script>

<style lang="scss" scoped>
.empty-state {
  min-height: 60vh;
}

.empty-state__icon {
  width: 120rpx;
  height: 120rpx;
  background-color: var(--tt-card, #F4F4F5);
}

.add-btn {
  border: 3rpx dashed var(--tt-border, #E4E4E7);
  padding: 32rpx;
}
</style>
