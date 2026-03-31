<template>
  <view class="page px-xl pt-lg">
    <!-- 项目名称 -->
    <view class="section">
      <text class="text-xs text-muted mb-sm block">项目名称</text>
      <view class="tt-input card">
        <input
          v-model="form.name"
          class="tt-input__inner"
          placeholder="请输入打卡名称"
          :maxlength="20"
          type="text"
        />
        <view v-if="form.name" class="tt-input__clear flex-center" @click="form.name = ''">
          <text class="tt-input__clear-icon">×</text>
        </view>
      </view>
    </view>
    
    <!-- 选择图标 -->
    <view class="section mt-xl">
      <text class="text-xs text-muted mb-sm block">选择图标</text>
      <view class="icon-grid">
        <view 
          v-for="item in iconPresets" 
          :key="item.icon"
          class="icon-item flex-col flex-center"
          @click="form.icon = item.icon"
        >
          <view 
            class="icon-box flex-center rounded-lg" 
            :class="{ 'icon-box--active': form.icon === item.icon }"
            :style="form.icon === item.icon ? { backgroundColor: '#09090B' } : {}"
          >
            <TtSvg :name="item.icon" :size="36" :color="form.icon === item.icon ? '#ffffff' : '#737373'" />
          </view>
        </view>
      </view>
    </view>
    
    <!-- 选择颜色 -->
    <view class="section mt-xl">
      <text class="text-xs text-muted mb-sm block">选择颜色</text>
      <view class="color-grid flex-wrap">
        <view 
          v-for="color in colorPresets" 
          :key="color"
          class="color-item flex-center"
          @click="form.color = color"
        >
          <view 
            class="color-dot" 
            :style="{ backgroundColor: color }"
            :class="{ 'color-dot--active': form.color === color }"
          ></view>
        </view>
      </view>
    </view>
    
    <!-- 打卡频率 -->
    <view class="section mt-xl">
      <text class="text-xs text-muted mb-sm block">打卡频率</text>
      <view class="card overflow-hidden">
        <view class="freq-item border-b flex-center-v" @click="form.frequency = 'daily'">
          <view class="tt-radio" :class="{ 'tt-radio--checked': form.frequency === 'daily' }">
            <view v-if="form.frequency === 'daily'" class="tt-radio__dot"></view>
          </view>
          <text class="text-sm ml-md">每天</text>
        </view>
        <view class="freq-item border-b flex-center-v" @click="form.frequency = 'weekday'">
          <view class="tt-radio" :class="{ 'tt-radio--checked': form.frequency === 'weekday' }">
            <view v-if="form.frequency === 'weekday'" class="tt-radio__dot"></view>
          </view>
          <text class="text-sm ml-md">工作日（周一至周五）</text>
        </view>
        <view class="freq-item flex-center-v" @click="form.frequency = 'custom'">
          <view class="tt-radio" :class="{ 'tt-radio--checked': form.frequency === 'custom' }">
            <view v-if="form.frequency === 'custom'" class="tt-radio__dot"></view>
          </view>
          <text class="text-sm ml-md">自定义</text>
        </view>
      </view>
      
      <view v-if="form.frequency === 'custom'" class="custom-days flex-wrap mt-sm">
        <view 
          v-for="(label, idx) in weekLabels" 
          :key="idx"
          class="day-chip flex-center rounded-md"
          :class="{ 'day-chip--active': form.customDays.includes(idx) }"
          @click="toggleDay(idx)"
        >
          <text class="text-sm" :class="form.customDays.includes(idx) ? 'text-white' : 'text-foreground'">{{ label }}</text>
        </view>
      </view>
    </view>
    
    <!-- 预览 -->
    <view class="section mt-xl">
      <text class="text-xs text-muted mb-sm block">预览</text>
      <view class="card overflow-hidden">
        <view class="preview-card flex-row">
          <view class="preview-bar" :style="{ backgroundColor: form.color }"></view>
            <view class="preview-body flex-between flex-1 p-lg">
            <view class="flex-center-v">
              <view class="preview-icon flex-center rounded-xl" :style="{ backgroundColor: `${form.color}20` }">
                <TtSvg :name="form.icon" :size="36" :color="form.color" />
              </view>
              <view class="ml-md">
                <text class="text-base font-semibold">{{ form.name || '打卡名称' }}</text>
                <view class="mt-xs">
                  <text class="text-xs text-muted">目标: {{ frequencyText }} · 总计 0 天</text>
                </view>
              </view>
            </view>
            <view class="preview-btn flex-center rounded-lg" style="border: 1rpx solid #09090B">
              <text class="text-xs text-foreground">○ 打卡</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 删除按钮（编辑模式） -->
    <view v-if="isEdit" class="mt-xl mb-xl">
      <view class="tt-btn tt-btn--danger-text" @click="onDelete">
        <text class="tt-btn__text tt-btn__text--danger">删除此打卡项目</text>
      </view>
    </view>
    
    <!-- 底部保存 -->
    <view class="save-section mt-lg mb-xl">
      <view class="tt-btn tt-btn--primary tt-btn--block" @click="onSave">
        <text v-if="saving" class="tt-btn__text">保存中...</text>
        <text v-else class="tt-btn__text">{{ isEdit ? '保存修改' : '创建项目' }}</text>
      </view>
    </view>
    
    <TtDialog
      v-model:visible="showDeleteDialog"
      title="删除项目"
      message="删除后所有打卡记录将一并删除，且不可恢复。"
      @confirm="confirmDelete"
    />
  </view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { createProject } from './api/createProject'
import { updateProject } from './api/updateProject'
import { deleteProject } from './api/deleteProject'
import { goBack } from '@/route/index'
import { db, COLLECTIONS } from '@/cloud-emas/database/database'
import { requireAccountId } from '@/utils/auth'

const isEdit = ref(false)
const editId = ref('')
const saving = ref(false)
const showDeleteDialog = ref(false)

const form = reactive({
  name: '',
  icon: 'ri-run-line',
  color: '#3B82F6',
  frequency: 'daily',
  customDays: [],
})

const iconPresets = [
  { icon: 'ri-run-line', label: '运动' },
  { icon: 'ri-book-open-line', label: '阅读' },
  { icon: 'ri-sun-line', label: '早起' },
  { icon: 'ri-drop-line', label: '喝水' },
  { icon: 'ri-graduation-cap-line', label: '学习' },
  { icon: 'ri-mental-health-line', label: '冥想' },
  { icon: 'ri-edit-line', label: '写作' },
  { icon: 'ri-footprint-line', label: '跑步' },
  { icon: 'ri-heart-pulse-line', label: '健身' },
  { icon: 'ri-restaurant-line', label: '饮食' },
  { icon: 'ri-moon-line', label: '睡眠' },
  { icon: 'ri-checkbox-circle-line', label: '其他' },
]

const colorPresets = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E', '#06B6D4',
  '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280',
]

const weekLabels = ['日', '一', '二', '三', '四', '五', '六']

const frequencyText = computed(() => {
  if (form.frequency === 'daily') return '每天'
  if (form.frequency === 'weekday') return '工作日'
  return '自定义'
})

function toggleDay(idx) {
  const i = form.customDays.indexOf(idx)
  if (i >= 0) {
    form.customDays.splice(i, 1)
  } else {
    form.customDays.push(idx)
  }
}

async function onSave() {
  if (!form.name.trim()) {
    uni.showToast({ title: '请输入打卡名称', icon: 'none' })
    return
  }
  if (form.frequency === 'custom' && form.customDays.length === 0) {
    uni.showToast({ title: '请至少选择一天', icon: 'none' })
    return
  }
  
  saving.value = true
  let res
  if (isEdit.value) {
    res = await updateProject(editId.value, form)
  } else {
    res = await createProject(form)
  }
  saving.value = false
  
  if (res.success) {
    uni.showToast({ title: isEdit.value ? '已保存' : '创建成功', icon: 'success' })
    setTimeout(() => goBack(), 500)
  } else {
    uni.showToast({ title: res.error || '操作失败', icon: 'none' })
  }
}

function onDelete() {
  showDeleteDialog.value = true
}

async function confirmDelete() {
  const res = await deleteProject(editId.value)
  if (res.success) {
    uni.showToast({ title: '已删除', icon: 'success' })
    setTimeout(() => goBack(), 500)
  }
}

onLoad(async (options) => {
  if (options?.id) {
    isEdit.value = true
    editId.value = options.id
    uni.setNavigationBarTitle({ title: '编辑打卡' })
    
    const accountId = await requireAccountId()
    const res = await db.collection(COLLECTIONS.PROJECTS)
      .findOne({ _id: options.id, accountId })
    if (res?.result) {
      const p = res.result
      form.name = p.name
      form.icon = p.icon
      form.color = p.color
      form.frequency = p.frequency
      form.customDays = p.customDays || []
    }
  }
})
</script>

<style lang="scss" scoped>
.block { display: block; }

.icon-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16rpx;
}

.icon-item {
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-box {
  width: 96rpx;
  height: 96rpx;
  background-color: var(--tt-card, #F4F4F5);
  
  &--active {
    background-color: var(--tt-foreground, #09090B) !important;
  }
}

.color-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx;
}

.color-item {
  padding: 0;
}

.color-dot {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  
  &--active {
    outline: 3rpx solid var(--tt-foreground, #09090B);
    outline-offset: 4rpx;
  }
}

.freq-item {
  padding: 24rpx;
}

.custom-days {
  display: flex;
  gap: 12rpx;
}

.day-chip {
  width: 72rpx;
  height: 72rpx;
  border: 1rpx solid var(--tt-border, #e5e5e5);
  
  &--active {
    background-color: var(--tt-foreground, #171717);
    border-color: var(--tt-foreground, #171717);
  }
}

.preview-bar {
  width: 8rpx;
}

.preview-icon {
  width: 80rpx;
  height: 80rpx;
  flex-shrink: 0;
}

.preview-btn {
  padding: 12rpx 24rpx;
}

.tt-input {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;

  &__inner {
    flex: 1;
    font-size: 28rpx;
    color: var(--tt-foreground, #09090B);
    background: transparent;
  }

  &__clear {
    width: 40rpx;
    height: 40rpx;
    margin-left: 12rpx;
  }

  &__clear-icon {
    font-size: 32rpx;
    color: var(--tt-muted-foreground, #A1A1AA);
    line-height: 1;
  }
}

.tt-radio {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  border: 2rpx solid var(--tt-disabled, #D4D4D8);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &--checked {
    border-color: var(--tt-foreground, #09090B);
  }

  &__dot {
    width: 20rpx;
    height: 20rpx;
    border-radius: 50%;
    background-color: var(--tt-foreground, #09090B);
  }
}

.tt-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx 40rpx;
  border-radius: 20rpx;

  &--primary {
    background: var(--tt-foreground, #09090B);
  }

  &--block {
    width: 100%;
    box-sizing: border-box;
  }

  &--danger-text {
    background: transparent;
  }

  &__text {
    font-size: 28rpx;
    color: var(--tt-background, #ffffff);
    font-weight: 500;

    &--danger {
      color: var(--tt-error, #EF4444);
    }
  }
}
</style>
