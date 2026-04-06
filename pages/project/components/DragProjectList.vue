<template>
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
      :style="getItemStyle(idx)"
      @touchstart="onTouchStart(idx, $event)"
    >
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
</template>

<script setup>
import { ref, computed, getCurrentInstance } from 'vue'
import { useProjectStore } from '@/stores/project'
import { goToProjectEdit } from '@/route/index'

const projectStore = useProjectStore()
const projects = computed(() => projectStore.activeList)
const instance = getCurrentInstance()

const dragIdx = ref(-1)
const insertIdx = ref(-1)
const startY = ref(0)
const offsetY = ref(0)
const showArchiveDialog = ref(false)
const showDeleteDialog = ref(false)
const archiveTargetId = ref('')
const deleteTargetId = ref('')

let isDragging = false
let longPressTimer = null
let itemRects = []
let listTop = 0
const LONG_PRESS_MS = 300

function getItemStyle(idx) {
  if (dragIdx.value !== idx) return ''
  return `transform: translateY(${offsetY.value}px); z-index: 100; opacity: 0.85; box-shadow: 0 4px 16px rgba(0,0,0,0.18); transition: none; position: relative;`
}

function measureItems() {
  return new Promise((resolve) => {
    const query = uni.createSelectorQuery().in(instance)
    query.select('.drag-list').boundingClientRect()
    query.selectAll('.drag-item').boundingClientRect()
    query.exec((res) => {
      listTop = res[0]?.top || 0
      resolve(res[1] || [])
    })
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
    offsetY.value = 0
    uni.vibrateShort()
    itemRects = await measureItems()
  }, LONG_PRESS_MS)
}

function onDragMove(e) {
  if (!isDragging || dragIdx.value < 0) {
    if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null }
    return
  }
  const touch = e.touches?.[0]
  if (!touch) return

  const dy = touch.clientY - startY.value
  const dragRect = itemRects[dragIdx.value]
  if (!dragRect) return

  const minY = -(dragRect.top - listTop)
  const maxY = (itemRects[itemRects.length - 1].bottom - dragRect.bottom)
  offsetY.value = Math.max(minY, Math.min(maxY, dy))

  const touchY = touch.clientY
  let newInsertIdx = dragIdx.value
  for (let i = 0; i < itemRects.length; i++) {
    const midY = itemRects[i].top + itemRects[i].height / 2
    if (touchY < midY) { newInsertIdx = i; break }
    if (i === itemRects.length - 1) newInsertIdx = itemRects.length
  }
  if (newInsertIdx > dragIdx.value) {
    newInsertIdx = Math.min(newInsertIdx, projects.value.length)
  }
  insertIdx.value = newInsertIdx
}

async function onDragEnd() {
  if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null }
  if (!isDragging || dragIdx.value < 0) { isDragging = false; return }

  const from = dragIdx.value
  let to = insertIdx.value
  dragIdx.value = -1
  insertIdx.value = -1
  offsetY.value = 0
  isDragging = false
  itemRects = []

  if (to > from) to -= 1
  if (from === to) return

  const active = [...projects.value]
  const [moved] = active.splice(from, 1)
  active.splice(to, 0, moved)

  const changed = []
  active.forEach((item, idx) => {
    const newOrder = idx + 1
    if (item.sortOrder !== newOrder) {
      changed.push({ _id: item._id, sortOrder: newOrder })
    }
  })
  if (changed.length > 0) await projectStore.updateSort(changed)
}

function onEdit(id) {
  if (isDragging) return
  goToProjectEdit(id)
}

function onArchive(id) {
  if (isDragging) return
  archiveTargetId.value = id
  showArchiveDialog.value = true
}

async function onArchiveConfirm() {
  const res = await projectStore.archive(archiveTargetId.value, true)
  if (res.success) uni.showToast({ title: '已归档', icon: 'success' })
}

function onDelete(id) {
  if (isDragging) return
  deleteTargetId.value = id
  showDeleteDialog.value = true
}

async function onDeleteConfirm() {
  const res = await projectStore.removeProject(deleteTargetId.value)
  if (res.success) {
    uni.showToast({ title: '已删除', icon: 'success' })
  } else {
    uni.showToast({ title: res.error || '删除失败', icon: 'none' })
  }
}
</script>

<style lang="scss" scoped>
.drag-list { position: relative; }

.drag-item {
  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
  position: relative;
  &--active { opacity: 0.85; z-index: 100; }
}

.insert-line {
  position: absolute;
  left: 0; right: 0;
  height: 4rpx;
  background-color: #22C55E;
  border-radius: 4rpx;
  z-index: 50;
  &--top { top: -6rpx; }
  &--bottom { bottom: -6rpx; }
  &::before, &::after {
    content: '';
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 12rpx; height: 12rpx;
    border-radius: 50%;
    background-color: #22C55E;
  }
  &::before { left: -2rpx; }
  &::after { right: -2rpx; }
}

.drag-handle { width: 40rpx; height: 48rpx; flex-shrink: 0; }
.item-icon { width: 48rpx; height: 48rpx; flex-shrink: 0; }
.action-btn { width: 56rpx; height: 56rpx; }
.action-btn:active { background-color: var(--tt-accent, #f5f5f5); }
</style>
