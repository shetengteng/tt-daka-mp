<template>
  <view class="tt-calendar">
    <view class="tt-calendar__header">
      <view class="tt-calendar__arrow" @click="onPrev">&#x2039;</view>
      <text class="tt-calendar__title" @click="onTitleClick">
        {{ headerTitle }}
      </text>
      <view class="tt-calendar__arrow" @click="onNext">&#x203A;</view>
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
      <view class="tt-calendar__days">
        <view
          v-for="(cell, idx) in cells"
          :key="idx"
          class="tt-calendar__cell"
          :class="{
            'tt-calendar__cell--empty': !cell.day,
            'tt-calendar__cell--today': cell.isToday,
            'tt-calendar__cell--selected': cell.isSelected,
            'tt-calendar__cell--disabled': cell.disabled,
          }"
          @click="onSelect(cell)"
        >
          <text v-if="cell.day" class="tt-calendar__day">{{ cell.day }}</text>
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
    weekSun: ["\u65E5", "\u4E00", "\u4E8C", "\u4E09", "\u56DB", "\u4E94", "\u516D"],
    weekMon: ["\u4E00", "\u4E8C", "\u4E09", "\u56DB", "\u4E94", "\u516D", "\u65E5"],
    months: ["1\u6708", "2\u6708", "3\u6708", "4\u6708", "5\u6708", "6\u6708", "7\u6708", "8\u6708", "9\u6708", "10\u6708", "11\u6708", "12\u6708"],
    fmt: (m, y) => `${y}\u5E74 ${m}`
  }
};
const loc = computed(() => L[props.locale] || L.en);
const weekdays = computed(() => props.firstDayOfWeek === 1 ? loc.value.weekMon : loc.value.weekSun);
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
    result.push({ day: 0, dateStr: "", isToday: false, isSelected: false, disabled: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = fmt(y, m, d);
    const disabled = props.minDate && ds < props.minDate || props.maxDate && ds > props.maxDate;
    result.push({
      day: d,
      dateStr: ds,
      isToday: ds === todayStr,
      isSelected: ds === props.modelValue,
      disabled: !!disabled
    });
  }
  return result;
});
function fmt(y, m, d) {
  return `${y}-${m < 10 ? "0" + m : m}-${d < 10 ? "0" + d : d}`;
}
function prevMonth() {
  if (viewMonth.value === 1) {
    viewMonth.value = 12;
    viewYear.value--;
  } else {
    viewMonth.value--;
  }
}
function nextMonth() {
  if (viewMonth.value === 12) {
    viewMonth.value = 1;
    viewYear.value++;
  } else {
    viewMonth.value++;
  }
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
}
function onSelect(cell) {
  if (!cell.day || cell.disabled || props.readonly) return;
  emit("update:modelValue", cell.dateStr);
  emit("select", cell.dateStr);
}
</script>

<style>
.tt-calendar {
  background: var(--tt-background, #fff);
  border-radius: var(--tt-radius, 12rpx);
  padding: 24rpx;
}
.tt-calendar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}
.tt-calendar__arrow {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  color: var(--tt-foreground, #0a0a0a);
  cursor: pointer;
  border-radius: var(--tt-radius, 12rpx);
  transition: background .15s;
}
.tt-calendar__arrow:active {
  background: var(--tt-muted, #f5f5f5);
}
.tt-calendar__title {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--tt-foreground, #0a0a0a);
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
  background: var(--tt-primary, #171717);
  border-color: var(--tt-primary, #171717);
}
.tt-calendar__picker-cell--active .tt-calendar__picker-text {
  color: var(--tt-primary-foreground, #fafafa);
  font-weight: 600;
}
.tt-calendar__picker-text {
  font-size: 28rpx;
  color: var(--tt-foreground, #0a0a0a);
}
.tt-calendar__weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 8rpx;
}
.tt-calendar__weekday {
  text-align: center;
  font-size: 24rpx;
  font-weight: 500;
  color: var(--tt-muted-foreground, #737373);
  padding: 8rpx 0;
}
.tt-calendar__days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4rpx;
}
.tt-calendar__cell {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 72rpx;
  border-radius: var(--tt-radius, 12rpx);
  cursor: pointer;
  transition: background .15s;
}
.tt-calendar__cell:active:not(.tt-calendar__cell--disabled):not(.tt-calendar__cell--empty) {
  background: var(--tt-muted, #f5f5f5);
}
.tt-calendar__cell--empty {
  cursor: default;
}
.tt-calendar__cell--today .tt-calendar__day {
  color: var(--tt-primary, #171717);
  font-weight: 700;
}
.tt-calendar__cell--selected {
  background: var(--tt-primary, #171717);
}
.tt-calendar__cell--selected .tt-calendar__day {
  color: var(--tt-primary-foreground, #fafafa);
  font-weight: 600;
}
.tt-calendar__cell--disabled {
  opacity: .3;
  cursor: not-allowed;
}
.tt-calendar__day {
  font-size: 28rpx;
  color: var(--tt-foreground, #0a0a0a);
}
</style>
