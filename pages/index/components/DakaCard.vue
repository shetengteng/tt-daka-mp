<template>
  <view 
    class="daka-card" 
    :style="cardBgStyle"
    @click="$emit('card-tap', project._id)"
    @longpress="$emit('card-longpress', project._id)"
  >
    <view class="daka-card__bar" :style="barStyle"></view>
    <view class="daka-card__body">
      <view class="daka-card__info">
        <view class="daka-card__header flex-center-v">
          <view class="daka-card__icon flex-center rounded-xl" :style="iconBgStyle">
            <TtSvg :name="project.icon || 'ri-checkbox-circle-line'" :size="36" :color="iconColor" />
          </view>
          <view class="ml-md">
            <text class="daka-card__name font-semibold text-base" :style="{ color: nameColor }">{{ project.name }}</text>
            <view class="mt-xs">
              <text class="text-xs" :style="{ color: subColor }">连续{{ streak }}天 · 总计{{ totalDays }}天</text>
            </view>
          </view>
        </view>
      </view>
      <view class="daka-card__action" @click.stop="onToggle">
        <view v-if="checked" class="daka-btn daka-btn--checked flex-center rounded-lg">
          <TtSvg name="ri-check-line" :size="28" color="#ffffff" />
          <text class="text-xs text-white ml-xs font-medium">已打卡</text>
        </view>
        <view v-else class="daka-btn daka-btn--unchecked flex-center rounded-lg">
          <TtSvg name="ri-checkbox-blank-circle-line" :size="28" :color="isDark ? '#FAFAFA' : '#09090B'" />
          <text class="text-xs ml-xs font-medium text-foreground">打卡</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  project: {
    type: Object,
    required: true
  },
  checked: {
    type: Boolean,
    default: false
  },
  streak: {
    type: Number,
    default: 0
  },
  totalDays: {
    type: Number,
    default: 0
  },
  isDark: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle', 'card-tap', 'card-longpress'])

const cardBgStyle = computed(() => {
  if (!props.checked) return { backgroundColor: 'var(--tt-card, #F4F4F5)' }
  return { backgroundColor: props.isDark ? 'rgba(34,197,94,0.12)' : '#DCFCE7' }
})

const barStyle = computed(() => ({
  backgroundColor: props.checked ? '#22C55E' : '#F97316'
}))

const nameColor = computed(() => {
  if (props.isDark) return 'var(--tt-foreground)'
  return props.checked ? '#0a0a0a' : 'var(--tt-foreground)'
})

const subColor = computed(() => {
  if (props.isDark) return 'var(--tt-muted-foreground)'
  return props.checked ? '#737373' : 'var(--tt-muted-foreground)'
})

const iconColor = computed(() => {
  return props.checked ? '#22C55E' : (props.project.color || '#3B82F6')
})

const iconBgStyle = computed(() => {
  const color = props.checked ? '#22C55E' : (props.project.color || '#3B82F6')
  return { backgroundColor: `${color}20` }
})

function onToggle() {
  emit('toggle', props.project._id)
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

.daka-btn {
  padding: 12rpx 20rpx;
  flex-shrink: 0;
  
  &--checked {
    background-color: #22C55E;
  }
  
  &--unchecked {
    border: 1rpx solid var(--tt-foreground, #09090B);
  }
}
</style>
