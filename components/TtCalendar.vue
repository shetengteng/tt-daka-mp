<template>
  <view class="tt-cal">
    <!-- 月份导航 -->
    <view class="tt-cal__nav">
      <view class="tt-cal__arrow" @click="prevMonth">
        <TtSvg name="ri-arrow-left-s-line" :size="36" color="#71717A" />
      </view>
      <text class="tt-cal__month">{{ monthLabel }}</text>
      <view class="tt-cal__arrow" @click="nextMonth">
        <TtSvg name="ri-arrow-right-s-line" :size="36" color="#71717A" />
      </view>
    </view>

    <!-- 星期头 -->
    <view class="tt-cal__weekdays">
      <text v-for="w in weekdays" :key="w" class="tt-cal__weekday">{{ w }}</text>
    </view>

    <!-- 日期网格 -->
    <view class="tt-cal__grid">
      <view 
        v-for="(cell, idx) in cells" 
        :key="idx"
        class="tt-cal__cell"
        :class="cellClass(cell)"
        @click="onCellClick(cell)"
      >
        <view v-if="cell.day" class="tt-cal__day-wrap" :style="cell.style">
          <text class="tt-cal__day" :class="dayTextClass(cell)">{{ cell.day }}</text>
        </view>
        <text v-if="cell.bottom" class="tt-cal__bottom">{{ cell.bottom }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { dayjs, formatDate } from '@/utils/date'

const props = defineProps({
  current: { type: String, default: '' },
  formatter: { type: Function, default: null },
})

const emit = defineEmits(['select', 'month-change'])

const weekdays = ['日', '一', '二', '三', '四', '五', '六']
const currentMonth = ref(props.current || dayjs().format('YYYY-MM'))
const selectedDate = ref(formatDate(new Date()))

const monthLabel = computed(() => {
  const d = dayjs(currentMonth.value + '-01')
  return `${d.year()} 年 ${d.month() + 1} 月`
})

const cells = computed(() => {
  const d = dayjs(currentMonth.value + '-01')
  const daysInMonth = d.daysInMonth()
  const startDay = d.day()
  const today = formatDate(new Date())
  const result = []

  for (let i = 0; i < startDay; i++) {
    result.push({ day: 0, date: null })
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const date = d.date(i)
    const dateStr = date.format('YYYY-MM-DD')
    const cell = {
      day: i,
      date: date.toDate(),
      dateStr,
      isToday: dateStr === today,
      isSelected: dateStr === selectedDate.value,
      isFuture: dateStr > today,
      style: null,
      bottom: null,
    }

    if (props.formatter) {
      props.formatter(cell)
    }

    result.push(cell)
  }

  return result
})

function cellClass(cell) {
  if (!cell.day) return 'tt-cal__cell--empty'
  const cls = []
  if (cell.isToday) cls.push('tt-cal__cell--today')
  if (cell.isSelected) cls.push('tt-cal__cell--selected')
  if (cell.isFuture) cls.push('tt-cal__cell--disabled')
  return cls
}

function dayTextClass(cell) {
  if (cell.isToday && cell.isSelected) return 'tt-cal__day--today-selected'
  if (cell.isToday) return 'tt-cal__day--today'
  return ''
}

function onCellClick(cell) {
  if (!cell.day || cell.isFuture) return
  selectedDate.value = cell.dateStr
  emit('select', cell.date)
}

function prevMonth() {
  const d = dayjs(currentMonth.value + '-01').subtract(1, 'month')
  currentMonth.value = d.format('YYYY-MM')
  emit('month-change', currentMonth.value)
}

function nextMonth() {
  const d = dayjs(currentMonth.value + '-01').add(1, 'month')
  currentMonth.value = d.format('YYYY-MM')
  emit('month-change', currentMonth.value)
}

watch(() => props.current, (val) => {
  if (val) currentMonth.value = val
})
</script>

<style lang="scss" scoped>
.tt-cal {
  background: var(--tt-card, #F4F4F5);
  border-radius: 24rpx;
  padding: 24rpx;

  &__nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24rpx;
  }

  &__arrow {
    padding: 8rpx;
  }

  &__month {
    font-size: 28rpx;
    font-weight: 600;
    color: var(--tt-foreground, #09090B);
  }

  &__weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    text-align: center;
    margin-bottom: 8rpx;
  }

  &__weekday {
    font-size: 22rpx;
    color: var(--tt-muted-foreground, #71717A);
    padding: 8rpx 0;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4rpx 0;
  }

  &__cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    height: 88rpx;
    padding: 4rpx 0;
    border-radius: 12rpx;

    &--empty {
      height: 0;
    }

    &--disabled {
      opacity: 0.3;
    }

    &--selected:not(&--today) {
      .tt-cal__day-wrap {
        background-color: var(--tt-foreground, #09090B);
      }
      .tt-cal__day {
        color: var(--tt-background, #ffffff);
        font-weight: 600;
      }
    }
  }

  &__day-wrap {
    width: 52rpx;
    height: 52rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 14rpx;
  }

  &__day {
    font-size: 26rpx;
    color: var(--tt-foreground, #09090B);

    &--today {
      width: 48rpx;
      height: 48rpx;
      line-height: 48rpx;
      text-align: center;
      border-radius: 50%;
      background: var(--tt-foreground, #09090B);
      color: var(--tt-background, #ffffff);
      font-weight: 600;
    }

    &--today-selected {
      width: 48rpx;
      height: 48rpx;
      line-height: 48rpx;
      text-align: center;
      border-radius: 50%;
      background: var(--tt-foreground, #09090B);
      color: var(--tt-background, #ffffff);
      font-weight: 600;
    }
  }

  &__bottom {
    font-size: 18rpx;
    color: var(--tt-muted-foreground, #71717A);
    margin-top: 2rpx;
  }
}
</style>
