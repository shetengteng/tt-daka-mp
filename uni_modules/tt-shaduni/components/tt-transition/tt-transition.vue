<template>
  <view v-if="visible" class="tt-transition" :class="animClass" :style="{ 'animation-duration': `${duration}ms` }">
    <slot />
  </view>
</template>

<script setup >import { ref, watch, computed } from "vue";
import { transitionProps } from "./props";
const props = defineProps(transitionProps);
const visible = ref(props.show);
const leaving = ref(false);
const animClass = computed(
  () => leaving.value ? `tt-transition--${props.name}-leave` : `tt-transition--${props.name}-enter`
);
watch(() => props.show, (val) => {
  if (val) {
    visible.value = true;
    leaving.value = false;
  } else {
    leaving.value = true;
    setTimeout(() => {
      visible.value = false;
      leaving.value = false;
    }, props.duration);
  }
});
</script>

<style>
.tt-transition { animation-fill-mode: both; }
.tt-transition--fade-enter { animation-name: tt-fade-in; }
.tt-transition--fade-leave { animation-name: tt-fade-out; }
.tt-transition--slide-up-enter { animation-name: tt-slide-up-in; }
.tt-transition--slide-up-leave { animation-name: tt-slide-up-out; }
.tt-transition--slide-down-enter { animation-name: tt-slide-down-in; }
.tt-transition--slide-down-leave { animation-name: tt-slide-down-out; }
.tt-transition--zoom-enter { animation-name: tt-zoom-in; }
.tt-transition--zoom-leave { animation-name: tt-zoom-out; }
@keyframes tt-fade-in { from { opacity: 0 } to { opacity: 1 } }
@keyframes tt-fade-out { from { opacity: 1 } to { opacity: 0 } }
@keyframes tt-slide-up-in { from { transform: translateY(100%); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
@keyframes tt-slide-up-out { from { transform: translateY(0); opacity: 1 } to { transform: translateY(100%); opacity: 0 } }
@keyframes tt-slide-down-in { from { transform: translateY(-100%); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
@keyframes tt-slide-down-out { from { transform: translateY(0); opacity: 1 } to { transform: translateY(-100%); opacity: 0 } }
@keyframes tt-zoom-in { from { transform: scale(0.8); opacity: 0 } to { transform: scale(1); opacity: 1 } }
@keyframes tt-zoom-out { from { transform: scale(1); opacity: 1 } to { transform: scale(0.8); opacity: 0 } }
</style>
