<template>
  <view class="page px-lg" :class="{ 'theme-dark': themeStore.mode === 'dark' }" :style="themeStore.themeStyle">
    <view 
      class="drag-list"
      @touchmove.prevent="onDragMove"
      @touchend="onDragEnd"
      @touchcancel="onDragEnd"
    >
      <view 
        v-for="(item, idx) in projects" 
        :key="item._id" 
        class="drag-item card mt-sm"
        :class="{ 'drag-item--active': dragIdx === idx }"
        :style="dragIdx === idx ? activeStyle : ''"
        @touchstart="onTouchStart(idx, $event)"
      >
        <!-- 插入指示线（显示在此 item 上方） -->
        <view v-if="insertIdx === idx && dragIdx !== idx" class="insert-line insert-line--top"></view>
        
        <view class="flex-between px-md py-md">
          <view class="flex-center-v flex-1 min-w-0">
            <view class="drag-handle flex-center mr-sm">
              <TtSvg name="ri-more-2-fill" :size="28" color="#D4D4D8" />
            </view>
            <view class="flex-center-v flex-1 min-w-0">
              <view class="item-icon flex-center rounded-sm" :style="{ backgroundColor: `${item.color}15` }">
                <TtSvg :name="item.icon || 'ri-checkbox-circle-line'" :size="32" :color="item.color" />
              </view>
              <view class="flex-col ml-sm flex-1 min-w-0">
                <text class="text-base font-medium truncate text-foreground">{{ item.name }}</text>
                <text class="text-xs text-muted">已打卡 {{ item.totalDays || 0 }} 天</text>
              </view>
            </view>
          </view>
          
          <view class="flex-center-v">
            <view class="action-btn flex-center rounded-md" @click.stop="onEdit(item._id)">
              <TtSvg name="ri-edit-line" :size="28" color="#737373" />
            </view>
            <view class="action-btn flex-center rounded-md ml-xs" @click.stop="onArchive(item._id)">
              <TtSvg name="ri-archive-line" :size="28" color="#737373" />
            </view>
            <view class="action-btn flex-center rounded-md ml-xs" @click.stop="onDelete(item._id)">
              <TtSvg name="ri-delete-bin-line" :size="28" color="#EF4444" />
            </view>
          </view>
        </view>
        
        <!-- 插入指示线（显示在最后一个 item 下方） -->
        <view v-if="insertIdx === projects.length && idx === projects.length - 1 && dragIdx !== idx" class="insert-line insert-line--bottom"></view>
      </view>
    </view>
    
    <view v-if="projects.length === 0" class="text-center py-xl">
      <TtEmpty description="暂无打卡项目" />
    </view>
    
    <view v-if="projects.length > 1" class="text-center mt-md mb-lg">
      <text class="text-xs text-muted">长按拖拽调整顺序</text>
    </view>
    
    <TtDialog
      v-model:visible="showArchiveDialog"
      title="归档项目"
      message="归档后项目将不在首页显示，可在「已归档项目」中恢复。"
      @confirm="onArchiveConfirm"
    />
    
    <TtDialog
      v-model:visible="showDeleteDialog"
      title="删除项目"
      message="删除后所有打卡记录将一并删除，且不可恢复。"
      @confirm="onDeleteConfirm"
    />
  </view>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useThemeStore } from '@/stores/theme'
import { archiveProject } from './api/archiveProject'
import { deleteProject } from '@/pages/project/sub/add/api/deleteProject'
import { batchUpdateSort } from './api/batchUpdateSort'
import { getActiveProjects } from './api/getActiveProjects'
import { goToProjectEdit } from '@/route/index'

const projects = ref([])
const dragIdx = ref(-1)
const insertIdx = ref(-1)
const startY = ref(0)
const activeStyle = ref('')

let isDragging = false
let longPressTimer = null
let itemRects = []
const LONG_PRESS_MS = 200

async function loadProjects() {
  const res = await getActiveProjects()
  if (res.success) {
    projects.value = res.list
    uni.setNavigationBarTitle({
      title: `打卡项目管理 (${res.list.length})`,
    })
  }
}

function measureItems() {
  return new Promise((resolve) => {
    uni.createSelectorQuery().selectAll('.drag-item').boundingClientRect((rects) => {
      resolve(rects || [])
    }).exec()
  })
}

function onTouchStart(idx, e) {
  if (projects.value.length <= 1) return
  
  const touch = e.touches?.[0]
  if (!touch) return
  
  const sy = touch.clientY
  
  longPressTimer = setTimeout(async () => {
    isDragging = true
    dragIdx.value = idx
    insertIdx.value = idx
    startY.value = sy
    uni.vibrateShort()
    
    itemRects = await measureItems()
  }, LONG_PRESS_MS)
}

function onDragMove(e) {
  if (!isDragging || dragIdx.value < 0) {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      longPressTimer = null
    }
    return
  }
  
  const touch = e.touches?.[0]
  if (!touch) return
  
  const dy = touch.clientY - startY.value
  activeStyle.value = `transform: translateY(${dy}px); z-index: 100; opacity: 0.85; box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.18); transition: none;`
  
  const touchY = touch.clientY
  let newInsertIdx = dragIdx.value
  
  for (let i = 0; i < itemRects.length; i++) {
    const rect = itemRects[i]
    const midY = rect.top + rect.height / 2
    if (touchY < midY) {
      newInsertIdx = i
      break
    }
    if (i === itemRects.length - 1) {
      newInsertIdx = itemRects.length
    }
  }
  
  if (newInsertIdx > dragIdx.value) {
    newInsertIdx = Math.min(newInsertIdx, projects.value.length)
  }
  
  insertIdx.value = newInsertIdx
}

async function onDragEnd() {
  if (longPressTimer) {
    clearTimeout(longPressTimer)
    longPressTimer = null
  }
  
  if (!isDragging || dragIdx.value < 0) {
    isDragging = false
    return
  }
  
  const from = dragIdx.value
  let to = insertIdx.value
  
  activeStyle.value = ''
  dragIdx.value = -1
  insertIdx.value = -1
  isDragging = false
  itemRects = []
  
  if (to > from) to -= 1
  if (from === to) return
  
  const list = [...projects.value]
  const [moved] = list.splice(from, 1)
  list.splice(to, 0, moved)
  
  projects.value = list
  
  const updates = list.map((item, idx) => ({
    _id: item._id,
    sortOrder: idx + 1,
  }))
  await batchUpdateSort(updates)
}

function onEdit(id) {
  if (isDragging) return
  goToProjectEdit(id)
}

const showArchiveDialog = ref(false)
const showDeleteDialog = ref(false)
const archiveTargetId = ref('')
const deleteTargetId = ref('')

function onArchive(id) {
  if (isDragging) return
  archiveTargetId.value = id
  showArchiveDialog.value = true
}

async function onArchiveConfirm() {
  const res = await archiveProject(archiveTargetId.value, true)
  if (res.success) {
    uni.showToast({ title: '已归档', icon: 'success' })
    await loadProjects()
  }
}

function onDelete(id) {
  if (isDragging) return
  deleteTargetId.value = id
  showDeleteDialog.value = true
}

async function onDeleteConfirm() {
  const res = await deleteProject(deleteTargetId.value)
  if (res.success) {
    uni.showToast({ title: '已删除', icon: 'success' })
    await loadProjects()
  } else {
    uni.showToast({ title: res.error || '删除失败', icon: 'none' })
  }
}

const themeStore = useThemeStore()

onShow(() => {
  themeStore.applyTheme()
  loadProjects()
})
</script>

<style lang="scss" scoped>
.drag-list {
  position: relative;
}

.drag-item {
  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
  position: relative;
  
  &--active {
    opacity: 0.85;
    z-index: 100;
  }
}

.insert-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 4rpx;
  background-color: #22C55E;
  border-radius: 4rpx;
  z-index: 50;
  
  &--top {
    top: -6rpx;
  }
  
  &--bottom {
    bottom: -6rpx;
  }
  
  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 12rpx;
    height: 12rpx;
    border-radius: 50%;
    background-color: #22C55E;
  }
  
  &::before {
    left: -2rpx;
  }
  
  &::after {
    right: -2rpx;
  }
}

.drag-handle {
  width: 40rpx;
  height: 48rpx;
  flex-shrink: 0;
}

.item-icon {
  width: 48rpx;
  height: 48rpx;
  flex-shrink: 0;
}

.action-btn {
  width: 56rpx;
  height: 56rpx;
}

.action-btn:active {
  background-color: var(--tt-accent, #f5f5f5);
}
</style>
