<template>
  <view class="tt-color-picker" :class="{ 'tt-color-picker--disabled': disabled }">
    <view class="tt-color-picker__row">
      <view
        v-for="item in previewItems"
        :key="item.value"
        class="tt-color-picker__swatch"
        :class="[
          `tt-color-picker__swatch--${size}`,
          `tt-color-picker__swatch--${shape}`,
          { 'tt-color-picker__swatch--active': isSame(item.value, modelValue) }
        ]"
        :style="{ backgroundColor: item.value }"
        @click="onSelectInline(item.value)"
      >
        <view
          v-if="showTick && isSame(item.value, modelValue)"
          class="tt-color-picker__swatch-tick"
          :style="{ borderColor: getTickColor(item.value) }"
        />
      </view>
      <view
        v-if="hasMore"
        class="tt-color-picker__more"
        :class="[
          `tt-color-picker__more--${size}`,
          `tt-color-picker__more--${shape}`
        ]"
        @click="openPopup"
      >
        <view class="tt-color-picker__more-dot" />
        <view class="tt-color-picker__more-dot" />
        <view class="tt-color-picker__more-dot" />
      </view>
    </view>

    <tt-popup :show="popupShow" position="bottom" round @update:show="onPopupShowChange">
      <view class="tt-color-picker__panel">
        <view class="tt-color-picker__header">
          <text class="tt-color-picker__title">{{ popupTitle }}</text>
          <view class="tt-color-picker__close" @click="closePopup">
            <view class="tt-color-picker__close-bar tt-color-picker__close-bar--a" />
            <view class="tt-color-picker__close-bar tt-color-picker__close-bar--b" />
          </view>
        </view>

        <scroll-view scroll-y class="tt-color-picker__body">
          <view v-if="recommendedItems.length > 0" class="tt-color-picker__group tt-color-picker__group--recommended">
            <text class="tt-color-picker__group-label">{{ resolvedRecommendedLabel }}</text>
            <view class="tt-color-picker__grid" :class="{ 'tt-color-picker__grid--labeled': showLabel }">
              <view
                v-for="item in recommendedItems"
                :key="`r-${item.value}`"
                class="tt-color-picker__cell"
                :class="{ 'tt-color-picker__cell--labeled': showLabel }"
                @click="onSelectGrid(item.value)"
              >
                <view
                  class="tt-color-picker__grid-item"
                  :class="[
                    `tt-color-picker__grid-item--${shape}`,
                    { 'tt-color-picker__grid-item--active': isSame(item.value, tempColor) }
                  ]"
                  :style="{ backgroundColor: item.value }"
                >
                  <view
                    v-if="isSame(item.value, tempColor)"
                    class="tt-color-picker__grid-tick"
                    :style="{ borderColor: getTickColor(item.value) }"
                  />
                </view>
                <text v-if="showLabel && item.label" class="tt-color-picker__cell-label">{{ item.label }}</text>
              </view>
            </view>
          </view>

          <template v-if="groupList.length > 0">
            <view v-for="group in groupList" :key="group.label" class="tt-color-picker__group">
              <text class="tt-color-picker__group-label">{{ group.label }}</text>
              <view class="tt-color-picker__grid" :class="{ 'tt-color-picker__grid--labeled': showLabel }">
                <view
                  v-for="item in normalizeColors(group.colors)"
                  :key="`g-${group.label}-${item.value}`"
                  class="tt-color-picker__cell"
                  :class="{ 'tt-color-picker__cell--labeled': showLabel }"
                  @click="onSelectGrid(item.value)"
                >
                  <view
                    class="tt-color-picker__grid-item"
                    :class="[
                      `tt-color-picker__grid-item--${shape}`,
                      { 'tt-color-picker__grid-item--active': isSame(item.value, tempColor) }
                    ]"
                    :style="{ backgroundColor: item.value }"
                  >
                    <view
                      v-if="isSame(item.value, tempColor)"
                      class="tt-color-picker__grid-tick"
                      :style="{ borderColor: getTickColor(item.value) }"
                    />
                  </view>
                  <text v-if="showLabel && item.label" class="tt-color-picker__cell-label">{{ item.label }}</text>
                </view>
              </view>
            </view>
          </template>

          <view v-else-if="recommendedItems.length === 0 || flatItems.length > 0" class="tt-color-picker__group">
            <view class="tt-color-picker__grid" :class="{ 'tt-color-picker__grid--labeled': showLabel }">
              <view
                v-for="item in flatItems"
                :key="`f-${item.value}`"
                class="tt-color-picker__cell"
                :class="{ 'tt-color-picker__cell--labeled': showLabel }"
                @click="onSelectGrid(item.value)"
              >
                <view
                  class="tt-color-picker__grid-item"
                  :class="[
                    `tt-color-picker__grid-item--${shape}`,
                    { 'tt-color-picker__grid-item--active': isSame(item.value, tempColor) }
                  ]"
                  :style="{ backgroundColor: item.value }"
                >
                  <view
                    v-if="isSame(item.value, tempColor)"
                    class="tt-color-picker__grid-tick"
                    :style="{ borderColor: getTickColor(item.value) }"
                  />
                </view>
                <text v-if="showLabel && item.label" class="tt-color-picker__cell-label">{{ item.label }}</text>
              </view>
            </view>
          </view>
        </scroll-view>

        <view class="tt-color-picker__footer">
          <view class="tt-color-picker__footer-row">
            <view class="tt-color-picker__btn tt-color-picker__btn--secondary" @click="closePopup">
              <text>{{ cancelText }}</text>
            </view>
            <view class="tt-color-picker__btn tt-color-picker__btn--primary" @click="onConfirm">
              <text>{{ confirmText }}</text>
            </view>
          </view>
          <view class="tt-color-picker__safe-bottom" />
        </view>
      </view>
    </tt-popup>
  </view>
</template>

<script setup >import { computed, ref, watch } from "vue";
import { colorPickerProps } from "./props";

const DEFAULT_COLORS = [
  { value: "hsl(0, 70%, 80%)", label: "Red" },
  { value: "hsl(20, 75%, 78%)", label: "Coral" },
  { value: "hsl(40, 80%, 78%)", label: "Amber" },
  { value: "hsl(60, 70%, 80%)", label: "Yellow" },
  { value: "hsl(120, 50%, 78%)", label: "Mint" },
  { value: "hsl(160, 55%, 78%)", label: "Teal" },
  { value: "hsl(200, 65%, 80%)", label: "Sky" },
  { value: "hsl(220, 65%, 82%)", label: "Blue" },
  { value: "hsl(260, 50%, 82%)", label: "Indigo" },
  { value: "hsl(285, 50%, 84%)", label: "Purple" },
  { value: "hsl(320, 55%, 86%)", label: "Pink" },
  { value: "#e5e5e5", label: "Neutral" }
];

const props = defineProps(colorPickerProps);
const emit = defineEmits();

const popupShow = ref(false);
const tempColor = ref(props.modelValue);

watch(() => props.modelValue, (val) => {
  tempColor.value = val;
});

function normalizeColors(arr) {
  return (arr || []).map((c) =>
    typeof c === "string" ? { value: c } : { value: c.value, label: c.label }
  );
}

const recommendedItems = computed(() => normalizeColors(props.recommended));
const resolvedRecommendedLabel = computed(() => props.recommendedLabel || "推荐");

const groupList = computed(() => {
  if (props.groups && props.groups.length > 0) return props.groups;
  return [];
});

const flatItems = computed(() => {
  if (groupList.value.length > 0) {
    return groupList.value.reduce((acc, g) => acc.concat(normalizeColors(g.colors)), []);
  }
  if (props.colors && props.colors.length > 0) {
    return normalizeColors(props.colors);
  }
  return DEFAULT_COLORS;
});

const allItems = computed(() => {
  const seen = new Set();
  const list = [];
  for (const item of recommendedItems.value) {
    const key = normalize(item.value);
    if (!seen.has(key)) {
      seen.add(key);
      list.push(item);
    }
  }
  for (const item of flatItems.value) {
    const key = normalize(item.value);
    if (!seen.has(key)) {
      seen.add(key);
      list.push(item);
    }
  }
  return list;
});

const previewItems = computed(() => {
  const list = allItems.value.slice();
  const current = props.modelValue;
  if (!current) return list.slice(0, props.previewCount);

  const head = list.slice(0, props.previewCount);
  if (head.some((c) => isSame(c.value, current))) {
    return head;
  }

  const meta = list.find((c) => isSame(c.value, current));
  const currentItem = meta || { value: current };
  const rest = list.filter((c) => !isSame(c.value, current));
  return [currentItem, ...rest].slice(0, props.previewCount);
});

const hasMore = computed(() => allItems.value.length > previewItems.value.length);

function normalize(s) {
  return (s || "").replace(/\s+/g, "").toLowerCase();
}

function isSame(a, b) {
  const av = unwrap(a);
  const bv = unwrap(b);
  if (!av || !bv) return false;
  return normalize(av) === normalize(bv);
}

function unwrap(v) {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object" && "value" in v) return String(v.value || "");
  return String(v);
}

function getTickColor(bg) {
  if (!bg) return "#171717";
  if (bg.startsWith("#")) {
    const hex = bg.replace("#", "");
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const bl = parseInt(hex.slice(4, 6), 16);
      const yiq = (r * 299 + g * 587 + bl * 114) / 1000;
      return yiq >= 200 ? "#171717" : "#ffffff";
    }
  }
  if (bg.startsWith("hsl")) {
    const m = bg.match(/hsl\(\s*\d+\s*,\s*\d+%?\s*,\s*(\d+)%/);
    if (m) {
      const lightness = parseInt(m[1], 10);
      return lightness >= 70 ? "#171717" : "#ffffff";
    }
  }
  return "#171717";
}

function onSelectInline(color) {
  if (props.disabled) return;
  tempColor.value = color;
  emit("update:modelValue", color);
  emit("change", color);
}

function openPopup() {
  if (props.disabled) return;
  tempColor.value = props.modelValue;
  popupShow.value = true;
}

function closePopup() {
  popupShow.value = false;
}

function onPopupShowChange(val) {
  popupShow.value = val;
}

function onSelectGrid(color) {
  tempColor.value = color;
}

function onConfirm() {
  emit("update:modelValue", tempColor.value);
  emit("change", tempColor.value);
  popupShow.value = false;
}
</script>

<style>
.tt-color-picker { display: inline-flex; align-items: center; }
.tt-color-picker--disabled { opacity: 0.5; pointer-events: none; }

.tt-color-picker__row { display: flex; flex-direction: row; align-items: center; gap: 12rpx; flex-wrap: wrap; justify-content: flex-end; }

.tt-color-picker__swatch { flex-shrink: 0; border: 4rpx solid transparent; box-sizing: border-box; position: relative; display: flex; align-items: center; justify-content: center; transition: transform 0.15s, border-color 0.15s, box-shadow 0.15s; }
.tt-color-picker__swatch:active { transform: scale(0.92); }
.tt-color-picker__swatch--sm { width: 36rpx; height: 36rpx; }
.tt-color-picker__swatch--md { width: 44rpx; height: 44rpx; }
.tt-color-picker__swatch--lg { width: 56rpx; height: 56rpx; }
.tt-color-picker__swatch--circle { border-radius: 50%; }
.tt-color-picker__swatch--square { border-radius: 12rpx; }
.tt-color-picker__swatch--active { border-color: var(--tt-foreground, #0a0a0a); }
.tt-color-picker__swatch-tick { width: 18rpx; height: 10rpx; border-left-width: 4rpx; border-bottom-width: 4rpx; border-left-style: solid; border-bottom-style: solid; border-top: 0; border-right: 0; border-left-color: #ffffff; border-bottom-color: #ffffff; transform: rotate(-45deg) translate(2rpx, -2rpx); pointer-events: none; }

.tt-color-picker__more { flex-shrink: 0; display: flex; align-items: center; justify-content: center; gap: 4rpx; background-color: var(--tt-background, #ffffff); border: 2rpx solid var(--tt-border, #e5e5e5); box-sizing: border-box; transition: background-color 0.15s, border-color 0.15s; }
.tt-color-picker__more:active { background-color: var(--tt-secondary, #f5f5f5); }
.tt-color-picker__more--sm { width: 36rpx; height: 36rpx; }
.tt-color-picker__more--md { width: 44rpx; height: 44rpx; }
.tt-color-picker__more--lg { width: 56rpx; height: 56rpx; }
.tt-color-picker__more--circle { border-radius: 50%; }
.tt-color-picker__more--square { border-radius: 12rpx; }
.tt-color-picker__more-dot { width: 6rpx; height: 6rpx; border-radius: 50%; background-color: var(--tt-muted-foreground, #737373); }

.tt-color-picker__panel { display: flex; flex-direction: column; background-color: var(--tt-background, #ffffff); border-top-left-radius: 28rpx; border-top-right-radius: 28rpx; max-height: 80vh; overflow: hidden; }
.tt-color-picker__header { display: flex; flex-direction: row; align-items: center; justify-content: space-between; padding: 32rpx; border-bottom: 2rpx solid var(--tt-border, #e5e5e5); flex-shrink: 0; }
.tt-color-picker__title { font-size: 32rpx; font-weight: 600; color: var(--tt-foreground, #0a0a0a); letter-spacing: -0.2rpx; }
.tt-color-picker__close { width: 56rpx; height: 56rpx; display: flex; align-items: center; justify-content: center; position: relative; }
.tt-color-picker__close-bar { position: absolute; width: 28rpx; height: 3rpx; background-color: var(--tt-muted-foreground, #737373); border-radius: 2rpx; }
.tt-color-picker__close-bar--a { transform: rotate(45deg); }
.tt-color-picker__close-bar--b { transform: rotate(-45deg); }

.tt-color-picker__body { flex: 1; max-height: 60vh; padding: 24rpx 32rpx; }
.tt-color-picker__group { margin-bottom: 32rpx; }
.tt-color-picker__group:last-child { margin-bottom: 0; }
.tt-color-picker__group--recommended { padding-bottom: 24rpx; border-bottom: 2rpx solid var(--tt-border, #e5e5e5); }
.tt-color-picker__group-label { display: block; font-size: 24rpx; color: var(--tt-muted-foreground, #737373); font-weight: 500; margin-bottom: 16rpx; }

.tt-color-picker__grid { display: flex; flex-direction: row; flex-wrap: wrap; gap: 16rpx; }
.tt-color-picker__grid--labeled { gap: 24rpx 12rpx; }
.tt-color-picker__cell { display: flex; flex-direction: column; align-items: center; gap: 8rpx; }
.tt-color-picker__cell--labeled { width: 120rpx; }
.tt-color-picker__grid-item { width: 88rpx; height: 88rpx; display: flex; align-items: center; justify-content: center; border: 4rpx solid transparent; box-sizing: border-box; transition: transform 0.15s, border-color 0.15s; position: relative; }
.tt-color-picker__grid-item:active { transform: scale(0.94); }
.tt-color-picker__grid-item--circle { border-radius: 50%; }
.tt-color-picker__grid-item--square { border-radius: 16rpx; }
.tt-color-picker__grid-item--active { border-color: var(--tt-foreground, #0a0a0a); }
.tt-color-picker__grid-tick { width: 32rpx; height: 16rpx; border-left-width: 5rpx; border-bottom-width: 5rpx; border-left-style: solid; border-bottom-style: solid; border-top: 0; border-right: 0; border-left-color: #ffffff; border-bottom-color: #ffffff; transform: rotate(-45deg) translate(2rpx, -2rpx); pointer-events: none; }
.tt-color-picker__cell-label { font-size: 22rpx; color: var(--tt-muted-foreground, #737373); text-align: center; line-height: 1.2; max-width: 120rpx; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.tt-color-picker__footer { padding: 24rpx 32rpx 0; border-top: 2rpx solid var(--tt-border, #e5e5e5); background-color: var(--tt-background, #ffffff); flex-shrink: 0; }
.tt-color-picker__footer-row { display: flex; flex-direction: row; gap: 24rpx; }
.tt-color-picker__btn { flex: 1; height: 88rpx; display: flex; align-items: center; justify-content: center; border-radius: 16rpx; font-size: 30rpx; font-weight: 500; transition: opacity 0.15s, background-color 0.15s; }
.tt-color-picker__btn:active { opacity: 0.85; }
.tt-color-picker__btn--primary { background-color: var(--tt-primary, #171717); color: var(--tt-primary-foreground, #fafafa); }
.tt-color-picker__btn--secondary { background-color: var(--tt-secondary, #f5f5f5); color: var(--tt-secondary-foreground, #171717); }
.tt-color-picker__safe-bottom { height: env(safe-area-inset-bottom); margin-top: 24rpx; }
</style>
