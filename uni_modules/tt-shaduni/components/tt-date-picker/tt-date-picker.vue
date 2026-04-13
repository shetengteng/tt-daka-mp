<template>
  <view v-if="show" class="tt-date-picker">
    <view class="tt-date-picker__mask" @click="$emit('update:show', false)" />
    <view class="tt-date-picker__panel">
      <view class="tt-date-picker__toolbar">
        <text class="tt-date-picker__cancel" @click="$emit('update:show', false)">{{ loc.cancel }}</text>
        <text class="tt-date-picker__title">{{ title || loc.title }}</text>
        <text class="tt-date-picker__confirm" @click="onConfirm">{{ loc.confirm }}</text>
      </view>
      <view class="tt-date-picker__body">
        <picker-view class="tt-date-picker__view" :value="pickerVal" indicator-style="height: 44px;" indicator-class="tt-date-picker__indicator" @change="onChange">
          <picker-view-column>
            <view v-for="y in years" :key="y" class="tt-date-picker__item"><text>{{ loc.yearFmt(y) }}</text></view>
          </picker-view-column>
          <picker-view-column>
            <view v-for="m in 12" :key="m" class="tt-date-picker__item"><text>{{ loc.monthFmt(m) }}</text></view>
          </picker-view-column>
          <picker-view-column>
            <view v-for="d in days" :key="d" class="tt-date-picker__item"><text>{{ loc.dayFmt(d) }}</text></view>
          </picker-view-column>
        </picker-view>
      </view>
    </view>
  </view>
</template>

<script setup >import { ref, computed, watch } from "vue";
import { datePickerProps } from "./props";
const props = defineProps(datePickerProps);
const emit = defineEmits(["update:modelValue", "update:show", "confirm"]);
const L = {
  en: { cancel: "Cancel", confirm: "Confirm", title: "Select Date", yearFmt: (y) => `${y}`, monthFmt: (m) => pad(m), dayFmt: (d) => pad(d) },
  zh: { cancel: "\u53D6\u6D88", confirm: "\u786E\u5B9A", title: "\u9009\u62E9\u65E5\u671F", yearFmt: (y) => `${y}\u5E74`, monthFmt: (m) => `${m}\u6708`, dayFmt: (d) => `${d}\u65E5` }
};
const loc = computed(() => L[props.locale] || L.en);
const now = /* @__PURE__ */ new Date();
function parseInit() {
  if (props.modelValue) {
    const parts = props.modelValue.split("-").map(Number);
    if (parts.length >= 3) return { y: parts[0], m: parts[1], d: parts[2] };
  }
  return { y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() };
}
const init = parseInit();
const selectedYear = ref(init.y);
const selectedMonth = ref(init.m);
const selectedDay = ref(init.d);
const pickerVal = ref([selectedYear.value - props.minYear, selectedMonth.value - 1, selectedDay.value - 1]);
const years = computed(() => {
  const arr = [];
  for (let y = props.minYear; y <= props.maxYear; y++) arr.push(y);
  return arr;
});
const days = computed(() => new Date(selectedYear.value, selectedMonth.value, 0).getDate());
function pad(n) {
  return n < 10 ? `0${n}` : `${n}`;
}
function onChange(e) {
  const v = e.detail.value;
  selectedYear.value = props.minYear + v[0];
  selectedMonth.value = v[1] + 1;
  const maxD = new Date(selectedYear.value, selectedMonth.value, 0).getDate();
  selectedDay.value = Math.min(v[2] + 1, maxD);
  pickerVal.value = [v[0], v[1], selectedDay.value - 1];
}
function onConfirm() {
  const val = `${selectedYear.value}-${pad(selectedMonth.value)}-${pad(selectedDay.value)}`;
  emit("update:modelValue", val);
  emit("confirm", val);
  emit("update:show", false);
}
watch(() => props.show, (v) => {
  if (v) {
    const i = parseInit();
    selectedYear.value = i.y;
    selectedMonth.value = i.m;
    selectedDay.value = i.d;
    pickerVal.value = [i.y - props.minYear, i.m - 1, i.d - 1];
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
