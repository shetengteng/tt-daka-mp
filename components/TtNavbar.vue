<template>
  <view :style="{ paddingTop: statusBarHeight + 'px' }">
    <tt-navbar :title="title" left-arrow :border="false" @click-left="onBack">
      <template #right>
        <slot name="right" />
      </template>
    </tt-navbar>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'

defineProps({
  title: { type: String, default: '' },
})

const themeStore = useThemeStore()
const statusBarHeight = computed(() => themeStore.statusBarHeight)

function onBack() {
  uni.navigateBack({ delta: 1 })
}
</script>
