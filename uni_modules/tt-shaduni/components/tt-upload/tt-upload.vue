<template>
  <view class="tt-upload">
    <view v-for="(file, i) in fileList" :key="i" class="tt-upload__preview">
      <image :src="file.url" class="tt-upload__image" mode="aspectFill" @click="onPreview(i)" />
      <view v-if="deletable" class="tt-upload__delete" @click.stop="$emit('delete', i)">
        <text class="tt-upload__delete-icon">×</text>
      </view>
      <view v-if="file.status === 'uploading'" class="tt-upload__mask">
        <text class="tt-upload__loading-text">...</text>
      </view>
    </view>
    <view v-if="fileList.length < maxCount && !disabled" class="tt-upload__add" @click="chooseFile">
      <text class="tt-upload__add-icon">+</text>
    </view>
  </view>
</template>

<script setup >import { uploadProps } from "./props";
const props = defineProps(uploadProps);
const emit = defineEmits(["update:fileList", "delete", "oversize"]);
function chooseFile() {
  uni.chooseImage({
    count: props.maxCount - props.fileList.length,
    success: (res) => {
      const files = res.tempFilePaths.map((url) => ({ url, status: "done" }));
      emit("update:fileList", [...props.fileList, ...files]);
    }
  });
}
function onPreview(idx) {
  if (!props.previewImage) return;
  uni.previewImage({ current: idx, urls: props.fileList.map((f) => f.url) });
}
</script>

<style>
.tt-upload { display: flex; flex-wrap: wrap; gap: 16rpx; }
.tt-upload__preview { position: relative; width: 160rpx; height: 160rpx; border-radius: var(--tt-radius, 12rpx); overflow: hidden; }
.tt-upload__image { width: 100%; height: 100%; }
.tt-upload__delete { position: absolute; top: 0; right: 0; width: 36rpx; height: 36rpx; background: rgba(0,0,0,.6); border-radius: 0 0 0 12rpx; display: flex; align-items: center; justify-content: center; }
.tt-upload__delete-icon { color: #fff; font-size: 24rpx; }
.tt-upload__mask { position: absolute; inset: 0; background: rgba(0,0,0,.3); display: flex; align-items: center; justify-content: center; }
.tt-upload__loading-text { color: #fff; font-size: 24rpx; }
.tt-upload__add { width: 160rpx; height: 160rpx; border: 2rpx dashed var(--tt-border, #e5e5e5); border-radius: var(--tt-radius, 12rpx); display: flex; align-items: center; justify-content: center; cursor: pointer; }
.tt-upload__add-icon { font-size: 56rpx; color: var(--tt-muted-foreground, #737373); }
</style>
