<template>
  <view v-if="show" class="tt-date-picker">
    <view class="tt-date-picker__mask" @click="$emit('update:show', false)" />
    <view class="tt-date-picker__panel">
      <view class="tt-date-picker__toolbar">
        <text class="tt-date-picker__cancel" @click="$emit('update:show', false)">{{ loc.cancel }}</text>
        <text class="tt-date-picker__title">{{ title || defaultTitle }}</text>
        <text class="tt-date-picker__confirm" @click="onConfirm">{{ loc.confirm }}</text>
      </view>
      <view class="tt-date-picker__body">
        <picker-view class="tt-date-picker__view" :value="pickerVal" indicator-style="height: 44px;" indicator-class="tt-date-picker__indicator" @change="onChange">
          <template v-if="hasDate">
            <picker-view-column>
              <view v-for="y in years" :key="y" class="tt-date-picker__item"><text>{{ loc.yearFmt(y) }}</text></view>
            </picker-view-column>
            <picker-view-column>
              <view v-for="m in 12" :key="m" class="tt-date-picker__item"><text>{{ loc.monthFmt(m) }}</text></view>
            </picker-view-column>
            <picker-view-column>
              <view v-for="d in days" :key="d" class="tt-date-picker__item"><text>{{ loc.dayFmt(d) }}</text></view>
            </picker-view-column>
          </template>
          <template v-if="hasTime">
            <picker-view-column>
              <view v-for="h in 24" :key="h" class="tt-date-picker__item"><text>{{ loc.hourFmt(h - 1) }}</text></view>
            </picker-view-column>
            <picker-view-column>
              <view v-for="mi in 60" :key="mi" class="tt-date-picker__item"><text>{{ loc.minuteFmt(mi - 1) }}</text></view>
            </picker-view-column>
          </template>
        </picker-view>
      </view>
    </view>
  </view>
</template>

<script setup >import { ref, computed, watch } from "vue";
import { datePickerProps } from "./props";
const props = defineProps(datePickerProps);
const emit = defineEmits(["update:modelValue", "update:show", "confirm"]);
function pad(n) { return n < 10 ? `0${n}` : `${n}`; }
const L = {
  en: {
    cancel: "Cancel", confirm: "Confirm",
    titleDate: "Select Date", titleTime: "Select Time", titleDatetime: "Select Date & Time",
    yearFmt: (y) => `${y}`, monthFmt: (m) => pad(m), dayFmt: (d) => pad(d),
    hourFmt: (h) => pad(h), minuteFmt: (mi) => pad(mi)
  },
  zh: {
    cancel: "取消", confirm: "确定",
    titleDate: "选择日期", titleTime: "选择时间", titleDatetime: "选择日期时间",
    yearFmt: (y) => `${y}年`, monthFmt: (m) => `${m}月`, dayFmt: (d) => `${d}日`,
    hourFmt: (h) => `${pad(h)}时`, minuteFmt: (mi) => `${pad(mi)}分`
  }
};
const loc = computed(() => L[props.locale] || L.en);
const hasDate = computed(() => props.mode === "date" || props.mode === "datetime");
const hasTime = computed(() => props.mode === "time" || props.mode === "datetime");
const defaultTitle = computed(() => {
  if (props.mode === "time") return loc.value.titleTime;
  if (props.mode === "datetime") return loc.value.titleDatetime;
  return loc.value.titleDate;
});
const now = /* @__PURE__ */ new Date();
function parseInit() {
  const s = props.modelValue || "";
  if (props.mode === "time") {
    const m = s.match(/^(\d{1,2}):(\d{1,2})/);
    if (m) return { y: now.getFullYear(), mo: now.getMonth() + 1, d: now.getDate(), h: +m[1], mi: +m[2] };
    return { y: now.getFullYear(), mo: now.getMonth() + 1, d: now.getDate(), h: now.getHours(), mi: now.getMinutes() };
  }
  if (props.mode === "datetime") {
    const m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})[T\s](\d{1,2}):(\d{1,2})/);
    if (m) return { y: +m[1], mo: +m[2], d: +m[3], h: +m[4], mi: +m[5] };
    return { y: now.getFullYear(), mo: now.getMonth() + 1, d: now.getDate(), h: now.getHours(), mi: now.getMinutes() };
  }
  const m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return { y: +m[1], mo: +m[2], d: +m[3], h: 0, mi: 0 };
  return { y: now.getFullYear(), mo: now.getMonth() + 1, d: now.getDate(), h: 0, mi: 0 };
}
const init = parseInit();
const selectedYear = ref(init.y);
const selectedMonth = ref(init.mo);
const selectedDay = ref(init.d);
const selectedHour = ref(init.h);
const selectedMinute = ref(init.mi);
function buildPickerVal() {
  const arr = [];
  if (hasDate.value) {
    arr.push(selectedYear.value - props.minYear);
    arr.push(selectedMonth.value - 1);
    arr.push(selectedDay.value - 1);
  }
  if (hasTime.value) {
    arr.push(selectedHour.value);
    arr.push(selectedMinute.value);
  }
  return arr;
}
const pickerVal = ref(buildPickerVal());
const years = computed(() => {
  const arr = [];
  for (let y = props.minYear; y <= props.maxYear; y++) arr.push(y);
  return arr;
});
const days = computed(() => new Date(selectedYear.value, selectedMonth.value, 0).getDate());
function onChange(e) {
  const v = e.detail.value;
  let idx = 0;
  if (hasDate.value) {
    selectedYear.value = props.minYear + v[idx++];
    selectedMonth.value = v[idx++] + 1;
    const maxD = new Date(selectedYear.value, selectedMonth.value, 0).getDate();
    selectedDay.value = Math.min(v[idx++] + 1, maxD);
  }
  if (hasTime.value) {
    selectedHour.value = v[idx++];
    selectedMinute.value = v[idx++];
  }
  pickerVal.value = buildPickerVal();
}
function formatValue() {
  if (props.mode === "time") {
    return `${pad(selectedHour.value)}:${pad(selectedMinute.value)}`;
  }
  const dateStr = `${selectedYear.value}-${pad(selectedMonth.value)}-${pad(selectedDay.value)}`;
  if (props.mode === "datetime") {
    return `${dateStr} ${pad(selectedHour.value)}:${pad(selectedMinute.value)}`;
  }
  return dateStr;
}
function onConfirm() {
  const val = formatValue();
  emit("update:modelValue", val);
  emit("confirm", val);
  emit("update:show", false);
}
watch(() => props.show, (v) => {
  if (v) {
    const i = parseInit();
    selectedYear.value = i.y;
    selectedMonth.value = i.mo;
    selectedDay.value = i.d;
    selectedHour.value = i.h;
    selectedMinute.value = i.mi;
    pickerVal.value = buildPickerVal();
  }
});
</script>

<style>
.tt-date-picker { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 1000; display: flex; flex-direction: column; justify-content: flex-end; }
.tt-date-picker__mask { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,.4); }
.tt-date-picker__panel { position: relative; background: var(--tt-background, #fff); border-radius: var(--tt-radius, 12rpx) var(--tt-radius, 12rpx) 0 0; z-index: 1; }
.tt-date-picker__toolbar { display: flex; align-items: center; justify-content: space-between; height: 96rpx; padding: 0 32rpx; border-bottom: 2rpx solid var(--tt-border, #e5e5e5); }
.tt-date-picker__cancel { font-size: 28rpx; color: var(--tt-muted-foreground, #737373); cursor: pointer; }
.tt-date-picker__title { font-size: 30rpx; font-weight: 600; color: var(--tt-foreground, #0a0a0a); }
.tt-date-picker__confirm { font-size: 28rpx; color: var(--tt-primary, #171717); font-weight: 600; cursor: pointer; }
.tt-date-picker__view { height: 480rpx; }
.tt-date-picker__body { padding: 0 32rpx 32rpx; }
.tt-date-picker__item { display: flex; align-items: center; justify-content: center; height: 44px; line-height: 44px; font-size: 30rpx; color: var(--tt-foreground, #0a0a0a); }
.tt-date-picker__indicator { height: 44px !important; border-top: 2rpx solid var(--tt-border, #e5e5e5) !important; border-bottom: 2rpx solid var(--tt-border, #e5e5e5) !important; }
</style>
