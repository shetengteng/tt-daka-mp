<template>
  <view class="tt-index-bar">
    <scroll-view scroll-y class="tt-index-bar__content" :scroll-into-view="scrollTarget" @scroll="onScroll">
      <slot />
    </scroll-view>
    <view class="tt-index-bar__sidebar">
      <text
        v-for="idx in indexList"
        :key="idx"
        class="tt-index-bar__index"
        :class="{ 'tt-index-bar__index--active': currentIdx === idx }"
        @click="onSelect(idx)"
      >{{ idx }}</text>
    </view>
  </view>
</template>

<script setup >import { ref, computed, onMounted, nextTick } from "vue";
import { indexBarProps } from "./props";
const props = defineProps(indexBarProps);
const emit = defineEmits(["update:activeIndex", "select"]);
const innerIdx = ref(props.activeIndex || props.indexList[0] || "");
const currentIdx = computed(() => props.activeIndex || innerIdx.value);
const scrollTarget = ref("");
const anchorTops = ref([]);
let clickScrolling = false;
function onSelect(idx) {
  clickScrolling = true;
  innerIdx.value = idx;
  scrollTarget.value = "";
  setTimeout(() => {
    scrollTarget.value = `tt-index-anchor-${idx}`;
  }, 0);
  setTimeout(() => {
    clickScrolling = false;
  }, 500);
  emit("update:activeIndex", idx);
  emit("select", idx);
}
function cachePositions() {
  const query = uni.createSelectorQuery();
  query.select(".tt-index-bar__content").boundingClientRect();
  query.select(".tt-index-bar__content").scrollOffset();
  props.indexList.forEach((idx) => {
    query.select(`#tt-index-anchor-${idx}`).boundingClientRect();
  });
  query.exec((res) => {
    if (!res) return;
    const svRect = res[0];
    const svScroll = res[1];
    if (!svRect || !svScroll) return;
    const svTop = svRect.top;
    const scrollTop = svScroll.scrollTop || 0;
    anchorTops.value = [];
    for (let i = 0; i < props.indexList.length; i++) {
      const r = res[i + 2];
      if (r) anchorTops.value.push(r.top - svTop + scrollTop);
    }
  });
}
function onScroll(e) {
  if (clickScrolling) return;
  const scrollTop = e.detail.scrollTop;
  if (anchorTops.value.length === 0) return;
  let idx = 0;
  for (let i = 0; i < anchorTops.value.length; i++) {
    if (scrollTop >= anchorTops.value[i] - 5) idx = i;
  }
  const newVal = props.indexList[idx];
  if (newVal && newVal !== innerIdx.value) {
    innerIdx.value = newVal;
    emit("update:activeIndex", newVal);
  }
}
onMounted(() => {
  nextTick(() => {
    setTimeout(cachePositions, 300);
  });
});
</script>

<style>
.tt-index-bar { position: relative; height: 100%; }
.tt-index-bar__content { height: 100%; }
.tt-index-bar__sidebar { position: absolute; right: 0; top: 50%; transform: translateY(-50%); display: flex; flex-direction: column; align-items: center; padding: 4rpx; z-index: 2; }
.tt-index-bar__index { width: 32rpx; height: 32rpx; font-size: 20rpx; text-align: center; line-height: 32rpx; color: var(--tt-muted-foreground, #737373); cursor: pointer; }
.tt-index-bar__index--active { color: var(--tt-primary, #171717); font-weight: 700; background: var(--tt-muted, #f5f5f5); border-radius: 50%; }
</style>
