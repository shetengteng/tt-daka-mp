<template>
  <scroll-view scroll-x class="tt-table-wrap">
    <view class="tt-table" :class="{ 'tt-table--bordered': bordered, 'tt-table--striped': striped }">
      <view class="tt-table__header">
        <view v-for="col in columns" :key="col.key" class="tt-table__th" :style="{ width: col.width || 'auto', textAlign: col.align || 'left' }">
          <text>{{ col.title }}</text>
        </view>
      </view>
      <view v-for="(row, ri) in data" :key="ri" class="tt-table__row">
        <view v-for="col in columns" :key="col.key" class="tt-table__td" :style="{ width: col.width || 'auto', textAlign: col.align || 'left' }">
          <text>{{ row[col.key] }}</text>
        </view>
      </view>
    </view>
  </scroll-view>
</template>

<script setup >import { tableProps } from "./props";
defineProps(tableProps);
</script>

<style>
.tt-table-wrap { width: 100%; }
.tt-table { display: table; width: 100%; border-collapse: collapse; }
.tt-table--bordered .tt-table__th, .tt-table--bordered .tt-table__td { border: 2rpx solid var(--tt-border, #e5e5e5); }
.tt-table__header { display: table-row; background: var(--tt-muted, #f5f5f5); }
.tt-table__row { display: table-row; }
.tt-table--striped .tt-table__row:nth-child(even) { background: var(--tt-muted, #f5f5f5); }
.tt-table__th { display: table-cell; padding: 20rpx 24rpx; font-size: 26rpx; font-weight: 600; color: var(--tt-foreground, #0a0a0a); }
.tt-table__td { display: table-cell; padding: 20rpx 24rpx; font-size: 26rpx; color: var(--tt-foreground, #0a0a0a); }
</style>
