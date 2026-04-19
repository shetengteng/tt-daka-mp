<template>
  <view
    class="tt-form-item"
    :class="[
      `tt-form-item--${effectiveDirection}`,
      isList && 'tt-form-item--list',
      isList && hasBorder && 'tt-form-item--list-border',
      props.clickable && 'tt-form-item--clickable',
      props.hideLabel && 'tt-form-item--no-label',
    ]"
    @click="onRowClick"
  >
    <view
      v-if="!props.hideLabel"
      class="tt-form-item__label"
      :style="labelStyleMerged"
    >
      <text v-if="props.required" class="tt-form-item__required">*</text>
      <text>{{ props.label }}</text>
    </view>

    <view
      class="tt-form-item__content"
      :style="props.contentStyle"
    >
      <slot />
    </view>

    <view v-if="props.arrow" class="tt-form-item__arrow">
      <text class="tt-form-item__arrow-icon">›</text>
    </view>
  </view>
</template>

<script setup>
import { computed, inject } from "vue";
import { formItemProps } from "./props";
import { TT_FORM_INJECT_KEY } from "../tt-form/props";

const props = defineProps(formItemProps);
const emit = defineEmits(["click"]);

const formCtx = inject(TT_FORM_INJECT_KEY, null);

const isList = computed(() => formCtx && formCtx.variant === "list");
const hasBorder = computed(() => isList.value && props.border);

const effectiveDirection = computed(() => props.direction);

const effectiveLabelWidth = computed(() => {
  if (props.labelWidth) return props.labelWidth;
  if (formCtx && formCtx.labelWidth) return formCtx.labelWidth;
  return "160rpx";
});

const labelStyleMerged = computed(() => {
  const base = { width: effectiveLabelWidth.value };
  if (typeof props.labelStyle === "string") {
    return [base, props.labelStyle];
  }
  if (props.labelStyle && typeof props.labelStyle === "object") {
    return { ...base, ...props.labelStyle };
  }
  return base;
});

function onRowClick(evt) {
  if (!props.clickable) return;
  emit("click", evt);
}
</script>

<style>
.tt-form-item {
  display: flex;
  align-items: center;
  margin-bottom: 32rpx;
  position: relative;
}

.tt-form-item--vertical {
  flex-direction: column;
  align-items: stretch;
}

.tt-form-item--vertical .tt-form-item__label {
  width: 100% !important;
  margin-bottom: 12rpx;
  padding-top: 0;
}

.tt-form-item--list {
  margin-bottom: 0;
  padding: 24rpx 0;
  min-height: 88rpx;
  box-sizing: border-box;
}

.tt-form-item--list-border {
  border-bottom: 1rpx solid var(--tt-border, #e5e5e5);
}

.tt-form-item--clickable {
  transition: background-color 0.15s;
}

.tt-form-item--clickable:active {
  background-color: var(--tt-muted, #f5f5f5);
}

.tt-form-item--no-label .tt-form-item__content {
  flex: 1;
  width: 100%;
}

.tt-form-item__label {
  width: 160rpx;
  font-size: 28rpx;
  color: var(--tt-foreground, #0a0a0a);
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.tt-form-item--list .tt-form-item__label {
  color: var(--tt-foreground, #0a0a0a);
  font-weight: 400;
}

.tt-form-item__required {
  color: var(--tt-destructive, #ef4444);
  margin-right: 4rpx;
}

.tt-form-item__content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 0;
}

.tt-form-item--vertical .tt-form-item__content {
  justify-content: flex-start;
}

.tt-form-item__arrow {
  margin-left: 8rpx;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.tt-form-item__arrow-icon {
  font-size: 36rpx;
  color: var(--tt-muted-foreground, #a3a3a3);
  line-height: 1;
}
</style>
