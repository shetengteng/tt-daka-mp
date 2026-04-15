<template>
  <view class="tt-calendar">
    <view class="tt-calendar__header">
      <view class="tt-calendar__arrow" @click="onPrev">
        <tt-icon name="ri-arrow-left-s-line" :size="32" color="var(--tt-muted-foreground, #71717a)" />
      </view>
      <text class="tt-calendar__title" @click="onTitleClick">
        {{ headerTitle }}
      </text>
      <view class="tt-calendar__arrow" @click="onNext">
        <tt-icon name="ri-arrow-right-s-line" :size="32" color="var(--tt-muted-foreground, #71717a)" />
      </view>
    </view>

    <view v-if="pickerMode === 'year'" class="tt-calendar__picker">
      <view class="tt-calendar__picker-grid tt-calendar__picker-grid--year">
        <view
          v-for="y in yearRange"
          :key="y"
          class="tt-calendar__picker-cell"
          :class="{ 'tt-calendar__picker-cell--active': viewYear === y }"
          @click="pickYear(y)"
        >
          <text class="tt-calendar__picker-text">{{ y }}</text>
        </view>
      </view>
    </view>

    <view v-else-if="pickerMode === 'month'" class="tt-calendar__picker">
      <view class="tt-calendar__picker-grid">
        <view
          v-for="(m, i) in loc.months"
          :key="i"
          class="tt-calendar__picker-cell"
          :class="{ 'tt-calendar__picker-cell--active': viewMonth === i + 1 }"
          @click="pickMonth(i + 1)"
        >
          <text class="tt-calendar__picker-text">{{ m }}</text>
        </view>
      </view>
    </view>

    <template v-else>
      <view class="tt-calendar__weekdays">
        <text v-for="w in weekdays" :key="w" class="tt-calendar__weekday">{{ w }}</text>
      </view>
      <view class="tt-calendar__days" :class="{ 'tt-calendar__days--compact': !showBottom }">
        <view
          v-for="(cell, idx) in cells"
          :key="idx"
          class="tt-calendar__cell"
          :class="{
            'tt-calendar__cell--empty': !cell.day,
            'tt-calendar__cell--disabled': cell.disabled,
            'tt-calendar__cell--compact': !showBottom,
          }"
          @click="onSelect(cell)"
        >
          <view
            v-if="cell.day"
            class="tt-calendar__day-wrap"
            :class="{
              'tt-calendar__day-wrap--today': cell.isToday,
              'tt-calendar__day-wrap--selected': cell.isSelected && !cell.isToday,
            }"
            :style="(cell.isSelected || cell.isToday) ? undefined : cell.style"
          >
            <text
              class="tt-calendar__day"
              :class="{
                'tt-calendar__day--today': cell.isToday,
                'tt-calendar__day--selected': cell.isSelected && !cell.isToday,
              }"
            >{{ cell.day }}</text>
          </view>
          <view v-if="cell.day && showBottom" class="tt-calendar__bottom">
            <slot name="day" :day="cell">
              <text v-if="cell.bottom" class="tt-calendar__bottom-text">{{ cell.bottom }}</text>
            </slot>
          </view>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup >import { ref, computed } from "vue";
import { calendarProps } from "./props";
const props = defineProps(calendarProps);
const emit = defineEmits();
const today = /* @__PURE__ */ new Date();
const todayStr = fmt(today.getFullYear(), today.getMonth() + 1, today.getDate());
const viewYear = ref(props.modelValue ? parseInt(props.modelValue.slice(0, 4)) : today.getFullYear());
const viewMonth = ref(props.modelValue ? parseInt(props.modelValue.slice(5, 7)) : today.getMonth() + 1);
const pickerMode = ref("none");
const yearPageStart = ref(viewYear.value - 5);
const L = {
  en: {
    weekSun: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    weekMon: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    fmt: (m, y) => `${m} ${y}`
  },
  zh: {
    weekSun: ["日", "一", "二", "三", "四", "五", "六"],
    weekMon: ["一", "二", "三", "四", "五", "六", "日"],
    months: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
    fmt: (m, y) => `${y}年 ${m}`
  }
};
const loc = computed(() => L[props.locale] || L.en);
const weekdays = computed(() => props.firstDayOfWeek === 1 ? loc.value.weekMon : loc.value.weekSun);
const currentMonthStr = computed(() => {
  const m = viewMonth.value < 10 ? "0" + viewMonth.value : viewMonth.value;
  return `${viewYear.value}-${m}`;
});
const displayTitle = computed(() => {
  return loc.value.fmt(loc.value.months[viewMonth.value - 1], viewYear.value);
});
const headerTitle = computed(() => {
  if (pickerMode.value === "year") return `${yearPageStart.value} - ${yearPageStart.value + 11}`;
  if (pickerMode.value === "month") return `${viewYear.value}`;
  return displayTitle.value;
});
const yearRange = computed(() => {
  const arr = [];
  for (let i = 0; i < 12; i++) arr.push(yearPageStart.value + i);
  return arr;
});
const cells = computed(() => {
  const y = viewYear.value;
  const m = viewMonth.value;
  const daysInMonth = new Date(y, m, 0).getDate();
  let startDow = new Date(y, m - 1, 1).getDay();
  if (props.firstDayOfWeek === 1) {
    startDow = startDow === 0 ? 6 : startDow - 1;
  }
  const result = [];
  for (let i = 0; i < startDow; i++) {
    result.push({ date: new Date(y, m - 1, 0), dateStr: "", day: 0, isToday: false, isSelected: false, disabled: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = fmt(y, m, d);
    const disabled = props.minDate && ds < props.minDate || props.maxDate && ds > props.maxDate;
    const cell = {
      date: new Date(y, m - 1, d),
      dateStr: ds,
      day: d,
      isToday: ds === todayStr,
      isSelected: ds === props.modelValue,
      disabled: !!disabled
    };
    if (props.formatter) {
      props.formatter(cell);
    }
    result.push(cell);
  }
  return result;
});
function fmt(y, m, d) {
  return `${y}-${m < 10 ? "0" + m : m}-${d < 10 ? "0" + d : d}`;
}
function emitMonthChange() {
  emit("month-change", currentMonthStr.value);
}
function prevMonth() {
  if (viewMonth.value === 1) {
    viewMonth.value = 12;
    viewYear.value--;
  } else {
    viewMonth.value--;
  }
  emitMonthChange();
}
function nextMonth() {
  if (viewMonth.value === 12) {
    viewMonth.value = 1;
    viewYear.value++;
  } else {
    viewMonth.value++;
  }
  emitMonthChange();
}
function onTitleClick() {
  if (pickerMode.value === "none") {
    pickerMode.value = "month";
  } else if (pickerMode.value === "month") {
    yearPageStart.value = viewYear.value - 5;
    pickerMode.value = "year";
  } else {
    pickerMode.value = "none";
  }
}
function onPrev() {
  if (pickerMode.value === "year") yearPageStart.value -= 12;
  else if (pickerMode.value === "month") viewYear.value--;
  else prevMonth();
}
function onNext() {
  if (pickerMode.value === "year") yearPageStart.value += 12;
  else if (pickerMode.value === "month") viewYear.value++;
  else nextMonth();
}
function pickYear(y) {
  viewYear.value = y;
  pickerMode.value = "month";
}
function pickMonth(m) {
  viewMonth.value = m;
  pickerMode.value = "none";
  emitMonthChange();
}
function onSelect(cell) {
  if (!cell.day || cell.disabled || props.readonly) return;
  emit("update:modelValue", cell.dateStr);
  emit("select", cell.dateStr);
}
</script>

<style>
.tt-calendar {
  background: var(--tt-card, #f4f4f5);
  border-radius: 24rpx;
  padding: 24rpx;
}
.tt-calendar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}
.tt-calendar__arrow {
  padding: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: var(--tt-radius, 12rpx);
  transition: background .15s;
}
.tt-calendar__arrow:active {
  background: var(--tt-muted, #f5f5f5);
}
.tt-calendar__title {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--tt-foreground, #09090b);
  cursor: pointer;
  padding: 4rpx 16rpx;
  border-radius: var(--tt-radius, 12rpx);
  transition: background .15s;
}
.tt-calendar__title:active {
  background: var(--tt-muted, #f5f5f5);
}
.tt-calendar__picker {
  padding: 8rpx 0 16rpx;
}
.tt-calendar__picker-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8rpx;
}
.tt-calendar__picker-grid--year {
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}
.tt-calendar__picker-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  border-radius: var(--tt-radius, 12rpx);
  cursor: pointer;
  transition: all .2s ease;
  border: 2rpx solid transparent;
}
.tt-calendar__picker-cell:active {
  background: var(--tt-muted, #f5f5f5);
  transform: scale(0.95);
}
.tt-calendar__picker-cell--active {
  background: var(--tt-foreground, #09090b);
  border-color: var(--tt-foreground, #09090b);
}
.tt-calendar__picker-cell--active .tt-calendar__picker-text {
  color: var(--tt-background, #ffffff);
  font-weight: 600;
}
.tt-calendar__picker-text {
  font-size: 28rpx;
  color: var(--tt-foreground, #09090b);
}
.tt-calendar__weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  margin-bottom: 8rpx;
}
.tt-calendar__weekday {
  font-size: 22rpx;
  color: var(--tt-muted-foreground, #71717a);
  padding: 8rpx 0;
}
.tt-calendar__days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4rpx 0;
}
.tt-calendar__cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 88rpx;
  padding: 4rpx 0;
  border-radius: 12rpx;
  cursor: pointer;
}
.tt-calendar__cell--empty {
  height: 0;
  cursor: default;
}
.tt-calendar__cell--disabled {
  opacity: .3;
  cursor: not-allowed;
}
.tt-calendar__day-wrap {
  width: 52rpx;
  height: 52rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14rpx;
}
.tt-calendar__day {
  font-size: 26rpx;
  color: var(--tt-foreground, #09090b);
}
.tt-calendar__day-wrap--today {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background-color: var(--tt-foreground, #09090b);
}
.tt-calendar__day--today {
  color: var(--tt-background, #ffffff);
  font-weight: 600;
}
.tt-calendar__day-wrap--selected {
  background-color: var(--tt-foreground, #09090b);
}
.tt-calendar__day--selected {
  color: var(--tt-background, #ffffff);
  font-weight: 600;
}
.tt-calendar__bottom {
  min-height: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.tt-calendar__bottom-text {
  font-size: 18rpx;
  color: var(--tt-muted-foreground, #71717a);
  line-height: 1;
  margin-top: 2rpx;
}
.tt-calendar__cell--compact {
  height: 60rpx;
}
</style>
