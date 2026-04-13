<template>
  <view v-if="show" class="tt-picker">
    <view class="tt-picker__toolbar">
      <text class="tt-picker__cancel" @click="$emit('update:show', false); $emit('cancel')">{{ cancelText }}</text>
      <text class="tt-picker__title">{{ title }}</text>
      <text class="tt-picker__confirm" @click="onConfirm">{{ confirmText }}</text>
    </view>
    <view class="tt-picker__columns">
      <scroll-view v-for="(col, ci) in normalizedColumns" :key="ci" class="tt-picker__column" scroll-y>
        <view v-for="item in col" :key="item.value" class="tt-picker__item" :class="{ 'tt-picker__item--active': selected[ci] === item.value }" @click="selectItem(ci, item.value)">
          <text>{{ item.text }}</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup >import { ref, computed } from "vue";
import { pickerProps } from "./props";
const props = defineProps(pickerProps);
const emit = defineEmits(["update:modelValue", "update:show", "confirm", "cancel", "change"]);
const selected = ref([]);
const normalizedColumns = computed(() => {
  if (!props.columns.length) return [];
  if (Array.isArray(props.columns[0])) return props.columns;
  return [props.columns];
});
function selectItem(colIdx, val) {
  const s = [...selected.value];
  s[colIdx] = val;
  selected.value = s;
  emit("change", { columnIndex: colIdx, value: val });
}
function onConfirm() {
  const val = selected.value.length === 1 ? selected.value[0] : selected.value;
  emit("update:modelValue", val);
  emit("confirm", val);
  emit("update:show", false);
}
</script>

<style>
.tt-picker { background: var(--tt-background, #fff); border-radius: var(--tt-radius, 12rpx) var(--tt-radius, 12rpx) 0 0; }
.tt-picker__toolbar { display: flex; align-items: center; justify-content: space-between; height: 88rpx; padding: 0 32rpx; border-bottom: 2rpx solid var(--tt-border, #e5e5e5); }
.tt-picker__cancel { font-size: 28rpx; color: var(--tt-muted-foreground, #737373); }
.tt-picker__title { font-size: 30rpx; font-weight: 600; }
.tt-picker__confirm { font-size: 28rpx; color: var(--tt-primary, #171717); font-weight: 500; }
.tt-picker__columns { display: flex; height: 440rpx; }
.tt-picker__column { flex: 1; overflow-y: auto; }
.tt-picker__item { display: flex; align-items: center; justify-content: center; height: 88rpx; font-size: 28rpx; color: var(--tt-muted-foreground, #737373); }
.tt-picker__item--active { color: var(--tt-foreground, #0a0a0a); font-weight: 600; }
</style>
