<template>
  <view class="tt-pagination">
    <view class="tt-pagination__btn" :class="{ 'tt-pagination__btn--disabled': modelValue <= 1 }" @click="go(modelValue - 1)">
      <text>‹</text>
    </view>
    <template v-if="mode === 'number'">
      <view v-for="p in pages" :key="p" class="tt-pagination__item" :class="{ 'tt-pagination__item--active': modelValue === p }" @click="go(p)">
        <text>{{ p }}</text>
      </view>
    </template>
    <template v-else>
      <view class="tt-pagination__simple">
        <text>{{ modelValue }} / {{ totalPages }}</text>
      </view>
    </template>
    <view class="tt-pagination__btn" :class="{ 'tt-pagination__btn--disabled': modelValue >= totalPages }" @click="go(modelValue + 1)">
      <text>›</text>
    </view>
  </view>
</template>

<script setup >import { computed } from "vue";
import { paginationProps } from "./props";
const props = defineProps(paginationProps);
const emit = defineEmits(["update:modelValue", "change"]);
const totalPages = computed(() => Math.ceil(props.totalItems / props.itemsPerPage) || 1);
const pages = computed(() => {
  const total = totalPages.value;
  const half = Math.floor(props.showPageSize / 2);
  let start = Math.max(1, props.modelValue - half);
  let end = start + props.showPageSize - 1;
  if (end > total) {
    end = total;
    start = Math.max(1, end - props.showPageSize + 1);
  }
  const arr = [];
  for (let i = start; i <= end; i++) arr.push(i);
  return arr;
});
function go(p) {
  if (p < 1 || p > totalPages.value || p === props.modelValue) return;
  emit("update:modelValue", p);
  emit("change", p);
}
</script>

<style>
.tt-pagination { display: flex; align-items: center; gap: 8rpx; }
.tt-pagination__btn { width: 64rpx; height: 64rpx; display: flex; align-items: center; justify-content: center; border: 2rpx solid var(--tt-border, #e5e5e5); border-radius: var(--tt-radius, 12rpx); cursor: pointer; font-size: 32rpx; transition: background .15s; }
.tt-pagination__btn:active { background: var(--tt-muted, #f5f5f5); }
.tt-pagination__btn--disabled { opacity: .4; pointer-events: none; }
.tt-pagination__item { min-width: 64rpx; height: 64rpx; display: flex; align-items: center; justify-content: center; border-radius: var(--tt-radius, 12rpx); font-size: 26rpx; cursor: pointer; transition: all .15s; }
.tt-pagination__item:active { background: var(--tt-muted, #f5f5f5); }
.tt-pagination__item--active { background: var(--tt-primary, #171717); color: var(--tt-primary-foreground, #fafafa); font-weight: 600; }
.tt-pagination__simple { font-size: 26rpx; padding: 0 16rpx; }
</style>
