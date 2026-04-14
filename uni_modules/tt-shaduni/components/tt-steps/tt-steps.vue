<template>
  <view class="tt-steps" :class="'tt-steps--' + direction">
    <template v-if="items.length">
      <view
        v-for="(item, i) in items"
        :key="i"
        class="tt-steps__item"
        :class="{ 'tt-steps__item--done': i < active, 'tt-steps__item--active': i === active }"
      >
        <view class="tt-steps__head">
          <view class="tt-steps__line" :class="{ 'tt-steps__line--done': i <= active, 'tt-steps__line--hide': i === 0 }" />
          <view class="tt-steps__circle" :class="{ 'tt-steps__circle--done': i < active, 'tt-steps__circle--active': i === active }">
            <tt-icon v-if="i < active" name="ri-check-line" :size="22" color="#fff" />
            <text v-else class="tt-steps__icon">{{ item.icon || String(i + 1) }}</text>
          </view>
          <view class="tt-steps__line" :class="{ 'tt-steps__line--done': i < active, 'tt-steps__line--hide': i === items.length - 1 }" />
        </view>
        <view class="tt-steps__main">
          <text class="tt-steps__title" :class="{ 'tt-steps__title--active': i <= active }">{{ item.title }}</text>
          <text v-if="item.description" class="tt-steps__desc">{{ item.description }}</text>
        </view>
      </view>
    </template>
    <slot v-else />
  </view>
</template>

<script setup >import { stepsProps } from "./props";
defineProps(stepsProps);
</script>

<style scoped>
.tt-steps { display: flex; }
.tt-steps--horizontal { flex-direction: row; }
.tt-steps--vertical { flex-direction: column; }

.tt-steps__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.tt-steps--vertical .tt-steps__item {
  flex-direction: row;
  align-items: flex-start;
  flex: none;
}

.tt-steps__head {
  display: flex;
  align-items: center;
  width: 100%;
}
.tt-steps--vertical .tt-steps__head {
  flex-direction: column;
  width: auto;
}

.tt-steps__line {
  flex: 1;
  height: 2px;
  background: var(--tt-border, #e5e5e5);
  min-width: 8px;
}
.tt-steps__line--done {
  background: var(--tt-primary, #171717);
}
.tt-steps__line--hide {
  visibility: hidden;
}
.tt-steps--vertical .tt-steps__line {
  width: 2px;
  height: 24px;
  min-width: auto;
  flex: none;
}

.tt-steps__circle {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--tt-muted, #f5f5f5);
  border: 1px solid var(--tt-border, #e5e5e5);
  flex-shrink: 0;
  box-sizing: border-box;
}
.tt-steps__circle--done {
  background: var(--tt-primary, #171717);
  border-color: var(--tt-primary, #171717);
}
.tt-steps__circle--active {
  border-color: var(--tt-primary, #171717);
  border-width: 2px;
}

.tt-steps__icon {
  font-size: 11px;
  color: var(--tt-muted-foreground, #737373);
  line-height: 1;
}
.tt-steps__circle--done .tt-steps__icon { color: #fff; }
.tt-steps__circle--active .tt-steps__icon {
  color: var(--tt-primary, #171717);
  font-weight: 600;
}

.tt-steps__main {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 6px;
}
.tt-steps--vertical .tt-steps__main {
  align-items: flex-start;
  margin-top: 0;
  margin-left: 8px;
  padding-bottom: 16px;
}

.tt-steps__title {
  font-size: 11px;
  color: var(--tt-muted-foreground, #a3a3a3);
}
.tt-steps__title--active {
  color: var(--tt-foreground, #0a0a0a);
  font-weight: 500;
}
.tt-steps__desc {
  font-size: 10px;
  color: var(--tt-muted-foreground, #a3a3a3);
  margin-top: 2px;
}
</style>
