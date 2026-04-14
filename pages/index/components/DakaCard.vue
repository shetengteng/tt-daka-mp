<template>
  <view 
    class="daka-card" 
    :style="cardBgStyle"
    @click="$emit('card-tap', props.projectId)"
    @longpress="$emit('card-longpress', props.projectId)"
  >
    <view class="daka-card__bar" :style="barStyle"></view>
    <view class="daka-card__body">
      <view class="daka-card__info">
        <view class="daka-card__header flex-center-v">
          <view class="daka-card__icon flex-center rounded-xl" :style="iconBgStyle">
            <tt-icon :name="project?.icon || 'ri-checkbox-circle-line'" :size="36" :color="iconColor" />
          </view>
          <view class="ml-md">
            <text class="daka-card__name font-semibold text-base" :style="{ color: nameColor }">{{ project?.name }}</text>
            <view class="mt-xs">
              <text class="text-xs" :style="{ color: subColor }">连续{{ streak }}天 · 总计{{ totalDays }}天</text>
            </view>
          </view>
        </view>
      </view>
      <view class="daka-card__action" @click.stop="onToggle">
        <tt-button v-if="checked" class="daka-btn--checked" size="sm">
          <tt-icon name="ri-check-line" :size="28" color="#ffffff" />
          <text class="text-xs text-white ml-xs font-medium">已打卡</text>
        </tt-button>
        <tt-button v-else variant="outline" size="sm">
          <tt-icon name="ri-checkbox-blank-circle-line" :size="28" :color="c.fg" />
          <text class="text-xs ml-xs font-medium text-foreground">打卡</text>
        </tt-button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { useProjectStore } from '@/stores/project'
import { useRecordStore } from '@/stores/record'

const props = defineProps({
  projectId: { type: String, required: true },
})

const emit = defineEmits(['toggle', 'card-tap', 'card-longpress'])
const { isDark, c } = useThemeStore()
const projectStore = useProjectStore()
const recordStore = useRecordStore()

const project = computed(() =>
  projectStore.list.find(p => p._id === props.projectId)
)

const checked = computed(() =>
  recordStore.todayRecords.some(r => r.projectId === props.projectId)
)

const totalDays = computed(() => project.value?.totalDays || 0)
const streak = computed(() => project.value?.streak || 0)

const cardBgStyle = computed(() => {
  if (!checked.value) return { backgroundColor: c.card }
  return { backgroundColor: isDark ? 'rgba(34,197,94,0.12)' : '#DCFCE7' }
})

const barStyle = computed(() => ({
  backgroundColor: checked.value ? '#22C55E' : '#F97316'
}))

const nameColor = computed(() => checked.value && !isDark ? '#0a0a0a' : c.fg)
const subColor = computed(() => checked.value && !isDark ? '#737373' : c.muted)

const iconColor = computed(() => {
  return checked.value ? '#22C55E' : (project.value?.color || '#3B82F6')
})

const iconBgStyle = computed(() => {
  const color = checked.value ? '#22C55E' : (project.value?.color || '#3B82F6')
  return { backgroundColor: `${color}20` }
})

function onToggle() {
  emit('toggle', props.projectId)
}
</script>

<style lang="scss" scoped>
.daka-card {
  display: flex;
  flex-direction: row;
  margin-bottom: 24rpx;
  border-radius: 24rpx;
  overflow: hidden;
  
  &__bar {
    width: 8rpx;
    flex-shrink: 0;
  }
  
  &__body {
    flex: 1;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 32rpx;
    min-width: 0;
  }
  
  &__info {
    flex: 1;
    min-width: 0;
  }
  
  &__icon {
    width: 80rpx;
    height: 80rpx;
    flex-shrink: 0;
  }
  
  &__name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.daka-card__action :deep(.tt-button) {
  border-radius: 16rpx;
}

.daka-btn--checked {
  background-color: #22C55E !important;
}
</style>
