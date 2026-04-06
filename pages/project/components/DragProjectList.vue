<template>
  <su-drag
    v-if="dragList.length > 0"
    v-model="dragList"
    :columns="1"
    item-key="_id"
    item-margin="8rpx"
    custom-class="drag-item-wrap"
    @end="onDragEnd"
  >
    <template #default="{ data }">
      <view class="drag-item card">
        <view class="flex-between px-md py-md">
          <view class="flex-center-v flex-1 min-w-0">
            <view class="drag-handle flex-center mr-sm">
              <TtSvg name="ri-more-2-fill" :size="28" color="#D4D4D8" />
            </view>
            <view class="flex-center-v flex-1 min-w-0">
              <view class="item-icon flex-center rounded-sm" :style="{ backgroundColor: `${data.color}15` }">
                <TtSvg :name="data.icon || 'ri-checkbox-circle-line'" :size="32" :color="data.color" />
              </view>
              <view class="flex-col ml-sm flex-1 min-w-0">
                <text class="text-base font-medium truncate text-foreground">{{ data.name }}</text>
                <text class="text-xs text-muted">已打卡 {{ data.totalDays || 0 }} 天</text>
              </view>
            </view>
          </view>
          
          <view class="flex-center-v">
            <view class="action-btn flex-center rounded-md" @click.stop="onEdit(data._id)">
              <TtSvg name="ri-edit-line" :size="28" color="#737373" />
            </view>
            <view class="action-btn flex-center rounded-md ml-xs" @click.stop="onArchive(data._id)">
              <TtSvg name="ri-archive-line" :size="28" color="#737373" />
            </view>
            <view class="action-btn flex-center rounded-md ml-xs" @click.stop="onDelete(data._id)">
              <TtSvg name="ri-delete-bin-line" :size="28" color="#EF4444" />
            </view>
          </view>
        </view>
      </view>
    </template>
  </su-drag>
  
  <view v-if="dragList.length === 0" class="text-center py-xl">
    <TtEmpty description="暂无打卡项目" />
  </view>
  
  <view v-if="dragList.length > 1" class="text-center mt-md mb-lg">
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
import { ref, watch } from 'vue'
import { useProjectStore } from '@/stores/project'
import { goToProjectEdit } from '@/route/index'

const projectStore = useProjectStore()

const dragList = ref([])
const showArchiveDialog = ref(false)
const showDeleteDialog = ref(false)
const archiveTargetId = ref('')
const deleteTargetId = ref('')

watch(() => projectStore.activeList, (list) => {
  dragList.value = [...list]
}, { immediate: true })

async function onDragEnd() {
  const changed = []
  dragList.value.forEach((item, idx) => {
    const newOrder = idx + 1
    if (item.sortOrder !== newOrder) {
      changed.push({ _id: item._id, sortOrder: newOrder })
    }
  })
  if (changed.length > 0) await projectStore.updateSort(changed)
}

function onEdit(id) {
  goToProjectEdit(id)
}

function onArchive(id) {
  archiveTargetId.value = id
  showArchiveDialog.value = true
}

async function onArchiveConfirm() {
  const res = await projectStore.archive(archiveTargetId.value, true)
  if (res.success) uni.showToast({ title: '已归档', icon: 'success' })
}

function onDelete(id) {
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
.drag-item {
  width: 100%;
}

.drag-handle { width: 40rpx; height: 48rpx; flex-shrink: 0; }
.item-icon { width: 48rpx; height: 48rpx; flex-shrink: 0; }
.action-btn { width: 56rpx; height: 56rpx; }
.action-btn:active { background-color: var(--tt-accent, #f5f5f5); }
</style>
