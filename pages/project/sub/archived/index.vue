<template>
  <view class="page px-lg" :class="{ 'theme-dark': themeStore.mode === 'dark' }" :style="themeStore.themeStyle">
    <TtNavbar title="已归档项目" />
    <view v-for="(item, idx) in archivedProjects" :key="item._id" class="card" :class="{ 'mt-sm': idx > 0 }">
      <view class="flex-between px-md py-md">
        <view class="flex-center-v flex-1 min-w-0">
          <view class="item-icon flex-center rounded-sm" :style="{ backgroundColor: `${item.color}15` }">
            <TtSvg :name="item.icon || 'ri-checkbox-circle-line'" :size="32" :color="item.color" />
          </view>
          <view class="ml-sm flex-1 min-w-0">
            <text class="text-base font-medium truncate block text-foreground">{{ item.name }}</text>
            <text class="text-xs text-muted">归档于 {{ item.updateTime?.slice(0, 10) }}</text>
          </view>
        </view>
        
        <view class="flex-center-v">
          <view class="action-btn action-btn--restore flex-center rounded-md" @click="onRestore(item._id)">
            <text class="text-xs text-foreground">恢复</text>
          </view>
          <view class="action-btn action-btn--delete flex-center rounded-md ml-xs" @click="onDelete(item._id)">
            <text class="text-xs text-error">删除</text>
          </view>
        </view>
      </view>
    </view>
    
    <view v-if="archivedProjects.length === 0" class="text-center py-xl">
      <TtEmpty description="没有归档的项目" />
    </view>
    
    <TtDialog
      v-model:visible="showDeleteDialog"
      title="永久删除"
      message="删除后所有打卡记录将一并删除，且不可恢复。"
      @confirm="confirmDelete"
    />
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { useProjectStore } from '@/stores/project'

const themeStore = useThemeStore()
const projectStore = useProjectStore()

const archivedProjects = ref([])
const showDeleteDialog = ref(false)
const deleteTargetId = ref('')

async function loadArchived() {
  const res = await projectStore.fetchArchivedProjects()
  if (res.success) {
    archivedProjects.value = res.list
  }
}

async function onRestore(id) {
  const res = await projectStore.archive(id, false)
  if (res.success) {
    uni.showToast({ title: '已恢复', icon: 'success' })
    archivedProjects.value = archivedProjects.value.filter(p => p._id !== id)
  }
}

function onDelete(id) {
  deleteTargetId.value = id
  showDeleteDialog.value = true
}

async function confirmDelete() {
  const res = await projectStore.removeProject(deleteTargetId.value)
  if (res.success) {
    uni.showToast({ title: '已删除', icon: 'success' })
    showDeleteDialog.value = false
    archivedProjects.value = archivedProjects.value.filter(p => p._id !== deleteTargetId.value)
  }
}

onMounted(() => {
  themeStore.applyTheme()
  loadArchived()
})
</script>

<style lang="scss" scoped>
.item-icon {
  width: 48rpx;
  height: 48rpx;
  flex-shrink: 0;
}

.block {
  display: block;
}

.action-btn {
  padding: 8rpx 20rpx;

  &--restore {
    border: 1rpx solid var(--tt-disabled, #D4D4D8);
  }

  &--delete {
    background: transparent;
  }
}
</style>
