<template>
  <view class="page px-lg">
    <view v-for="(item, idx) in projects" :key="item._id" class="card mt-sm">
      <view class="flex-between px-md py-md">
        <view class="flex-center-v flex-1 min-w-0">
          <!-- 排序按钮 -->
          <view class="sort-btns flex-col mr-sm">
            <view 
              class="sort-btn flex-center" 
              :class="{ 'sort-btn--disabled': idx === 0 }"
              @click="onSort(item._id, 'up')"
            >
              <TtSvg name="ri-arrow-up-s-line" :size="28" :color="idx === 0 ? '#d4d4d4' : '#737373'" />
            </view>
            <view 
              class="sort-btn flex-center" 
              :class="{ 'sort-btn--disabled': idx === projects.length - 1 }"
              @click="onSort(item._id, 'down')"
            >
              <TtSvg name="ri-arrow-down-s-line" :size="28" :color="idx === projects.length - 1 ? '#d4d4d4' : '#737373'" />
            </view>
          </view>
          
          <view class="flex-center-v flex-1 min-w-0">
            <view class="item-icon flex-center rounded-sm" :style="{ backgroundColor: `${item.color}15` }">
              <TtSvg :name="item.icon || 'ri-checkbox-circle-line'" :size="32" :color="item.color" />
            </view>
            <text class="text-base font-medium ml-sm truncate">{{ item.name }}</text>
          </view>
        </view>
        
        <view class="flex-center-v">
          <view class="action-btn flex-center rounded-md" @click="onEdit(item._id)">
            <TtSvg name="ri-edit-line" :size="28" color="#737373" />
          </view>
          <view class="action-btn flex-center rounded-md ml-xs" @click="onArchive(item._id)">
            <TtSvg name="ri-archive-line" :size="28" color="#737373" />
          </view>
        </view>
      </view>
    </view>
    
    <view v-if="projects.length === 0" class="text-center py-xl">
      <TtEmpty description="暂无打卡项目" />
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { archiveProject } from './api/archiveProject'
import { updateProjectSort } from './api/updateProjectSort'
import { goToProjectEdit } from '@/route/index'
import { db, COLLECTIONS } from '@/cloud-emas/database/database'
import { requireAccountId } from '@/utils/auth'

const projects = ref([])

async function loadProjects() {
  const accountId = await requireAccountId()
  const res = await db.collection(COLLECTIONS.PROJECTS)
    .find({ accountId, archived: false })
    .sort({ sortOrder: 1 })
    .exec()
  projects.value = res?.result || []
}

async function onSort(id, direction) {
  const res = await updateProjectSort(id, direction, projects.value)
  if (res.success) {
    await loadProjects()
  }
}

function onEdit(id) {
  goToProjectEdit(id)
}

async function onArchive(id) {
  uni.showModal({
    title: '归档项目',
    content: '归档后项目将不在首页显示，可在"已归档项目"中恢复。',
    success: async (modalRes) => {
      if (modalRes.confirm) {
        const res = await archiveProject(id, true)
        if (res.success) {
          uni.showToast({ title: '已归档', icon: 'success' })
          await loadProjects()
        }
      }
    }
  })
}

onMounted(() => {
  loadProjects()
})

onShow(() => {
  loadProjects()
})
</script>

<style lang="scss" scoped>
.sort-btns {
  gap: 4rpx;
}

.sort-btn {
  width: 40rpx;
  height: 32rpx;
  
  &--disabled {
    opacity: 0.3;
  }
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
  background-color: #f5f5f5;
}
</style>
