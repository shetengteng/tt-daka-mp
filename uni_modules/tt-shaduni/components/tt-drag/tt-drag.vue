<template>
	<view class="tt-drag" @mouseenter="mouseenter" @mouseleave="mouseleave">
		<movable-area
			class="drag-area"
			:style="{ height: areaHeight }">
			
			<movable-view
				v-for="(item, index) in dragList"
				:key="item._dragId"
				class="drag-item"
				direction="all"
				:x="item._x"
				:y="item._y"
				:damping="damping"
				:disabled="item._disabled"
				@change="onChange($event, item)"
				@touchstart="touchstart($event, item)"
				@touchend="touchend($event, item)"
				:style="itemStyle(item)">

				<view
					class="drag-content"
					:class="{ 'shake': shake && !item._disabled, 'drag-content--active': item._scale !== 1 }"
					:style="contentStyle(item)">
				<view
					v-if="showDragHandle && mode === 'single'"
					class="drag-handle"
					:class="'drag-handle-' + dragHandlePosition"
					:style="handleStyle"
					@touchstart="handleDragHandleTouchStart(item)"
					@touchend="handleDragHandleTouchEnd(item)">
					<slot name="dragHandle" :item="item" :index="index">
						<tt-icon name="ri-draggable-line" :size="28" color="var(--tt-muted-foreground, #666)" />
					</slot>
				</view>
					<view
						class="drag-content-inner"
						@touchstart="handleContentTouchStart"
						@touchmove="handleContentTouchMove"
						@touchend="handleContentTouchEnd">
						<slot :item="item" :index="index">
							<image
								v-if="mode === 'image'"
								class="drag-image"
								:src="getItemValue(item)"
								mode="aspectFill">
							</image>
							<view v-else class="drag-default">
								{{ getItemValue(item) }}
							</view>
						</slot>
					</view>

					<view
						v-if="deletable && item.deletable !== false"
						class="delete-btn"
						:style="deleteBtnStyle"
						@click="deleteItem(item, index)"
						@touchstart.stop="deleteItemMp(item, index)"
						@touchend.stop="nothing()">
						<view
							class="delete-wrap"
							:style="deleteWrapStyle">
							<tt-icon name="ri-close-line" :size="24" color="#ffffff" />
						</view>
					</view>
				</view>
			</movable-view>
			
		</movable-area>
	</view>
</template>

<script setup >import { ref, computed, watch, onMounted, nextTick, toRef } from "vue";
import { dragProps } from "./props";
import { useDragLayout } from "./composables/use-drag-layout";
import { useDragList } from "./composables/use-drag-list";
import { useDragTouch } from "./composables/use-drag-touch";
const props = defineProps(dragProps);
const emit = defineEmits();
const dragList = ref([]);
const modeRef = toRef(props, "mode");
const disabledRef = toRef(props, "disabled");
const showDragHandleRef = toRef(props, "showDragHandle");
const {
  areaHeight,
  contentWidth,
  contentHeight,
  contentMargin,
  itemWidthPx,
  itemHeightPx,
  cols,
  areaWidth,
  calculateSize,
  recalculateLayout
} = useDragLayout({
  mode: modeRef,
  columns: toRef(props, "columns"),
  itemWidth: toRef(props, "itemWidth"),
  itemHeight: toRef(props, "itemHeight"),
  singleItemHeight: toRef(props, "singleItemHeight"),
  gap: toRef(props, "gap"),
  dragList
});
const {
  isFirstLoad,
  isChangeEnabled,
  setChangeStatus,
  getItemValue,
  updateItemPosition,
  updateIndexMap,
  changeItemPosition,
  emitChange,
  deleteItemHandle,
  initDrag,
  updateList
} = useDragList({
  mode: modeRef,
  disabled: disabledRef,
  showDragHandle: showDragHandleRef,
  keyName: toRef(props, "keyName"),
  dragList,
  cols,
  itemWidthPx,
  itemHeightPx,
  areaWidth,
  calculateSize
});
const {
  touchstart,
  touchend,
  onChange,
  handleDragHandleTouchStart,
  handleDragHandleTouchEnd,
  handleContentTouchStart,
  handleContentTouchMove,
  handleContentTouchEnd,
  mouseenter,
  mouseleave,
  deleteItem,
  deleteItemMp,
  nothing
} = useDragTouch(
  {
    mode: modeRef,
    disabled: disabledRef,
    showDragHandle: showDragHandleRef,
    scale: toRef(props, "scale"),
    opacity: toRef(props, "opacity"),
    longPressDuration: toRef(props, "longPressDuration"),
    swipeThreshold: toRef(props, "swipeThreshold"),
    cols,
    itemWidthPx,
    itemHeightPx,
    dragList,
    isChangeEnabled,
    setChangeStatus,
    getItemValue,
    updateItemPosition,
    updateIndexMap,
    changeItemPosition,
    emitChange,
    deleteItemHandle
  },
  emit,
  toRef(props, "onDelete")
);
function itemStyle(item) {
  return {
    width: itemWidthPx.value + "px",
    height: itemHeightPx.value + "px",
    "z-index": item._zIndex,
    opacity: item._opacity
  };
}
function contentStyle(item) {
  return {
    width: contentWidth.value,
    height: contentHeight.value,
    borderRadius: props.borderRadius + "rpx",
    transform: `scale(${item._scale})`,
    margin: contentMargin.value
  };
}
const DEFAULT_HANDLE = {
  width: 60,
  height: 60,
  backgroundColor: "transparent",
  borderRadius: 0,
  boxShadow: "none",
  offset: 8,
  icon: "bars",
  iconSize: 20,
  iconColor: "#666"
};
const mergedHandleStyles = computed(() => ({ ...DEFAULT_HANDLE, ...props.dragHandleStyles }));
const handleStyle = computed(() => {
  const s = mergedHandleStyles.value;
  return {
    width: s.width + "rpx",
    height: s.height + "rpx",
    backgroundColor: s.backgroundColor,
    borderRadius: s.borderRadius + "rpx",
    boxShadow: s.boxShadow,
    left: props.dragHandlePosition === "left" ? s.offset + "rpx" : "auto",
    right: props.dragHandlePosition === "right" ? s.offset + "rpx" : "auto"
  };
});
const deleteBtnStyle = computed(() => ({
  top: props.deleteTop + "rpx",
  right: props.deleteRight + "rpx"
}));
const deleteWrapStyle = computed(() => ({
  borderRadius: "0 " + props.borderRadius + "rpx 0 12rpx"
}));
watch(() => props.modelValue, (n) => {
  if (!isFirstLoad() && isChangeEnabled()) updateList(n, true);
}, { deep: true });
watch(() => props.disabled, () => {
  if (isFirstLoad()) return;
  dragList.value.forEach((item) => {
    item._disabled = true;
  });
});
watch(
  [() => props.columns, () => props.itemHeight, () => props.singleItemHeight, () => props.gap, () => props.itemWidth],
  () => {
    if (!isFirstLoad()) recalculateLayout();
  }
);
onMounted(() => {
  nextTick(() => initDrag(props.modelValue));
});
</script>

<style lang="scss" scoped>
.tt-drag {
	width: 100%;
	
	.drag-area {
		width: 100%;
		position: relative;
		touch-action: pan-y;
		
		.drag-item {
			display: flex;
			justify-content: center;
			align-items: center;
			touch-action: pan-y;

			.drag-content {
				position: relative;
				overflow: hidden;
				display: flex;
				justify-content: center;
				align-items: center;
				box-sizing: border-box;
				border: 2rpx solid transparent;
				transition: border-color 0.2s ease, box-shadow 0.2s ease;

				&--active {
					border-color: var(--tt-primary, #171717);
					box-shadow: 0 0 0 2rpx var(--tt-primary, #171717);
				}

				&.shake {
					animation: shake 0.5s ease-in-out infinite;
				}

			.drag-handle {
				position: absolute;
				top: 50%;
				transform: translateY(-50%);
				display: flex;
				justify-content: center;
				align-items: center;
				z-index: 2;
				cursor: grab;
				transition: all 0.2s ease;

				&:active {
					cursor: grabbing;
					transform: translateY(-50%) scale(0.95);
				}
			}
				.drag-content-inner {
					width: 100%;
					height: 100%;
					position: relative;
					display: flex;
					flex-direction: column;
					box-sizing: border-box;

					> view,
					> image {
						width: 100%;
						height: 100%;
						flex: 1;
						min-height: 0;
					}
					
					::v-deep > view,
					::v-deep > image {
						width: 100%;
						flex: 1;
						min-height: 0;
					}
				}

				.drag-image {
					width: 100%;
					height: 100%;
					flex: 1;
					min-height: 0;
				}

				.drag-default {
					width: 100%;
					height: 100%;
					flex: 1;
					min-height: 0;
					display: flex;
					justify-content: center;
					align-items: center;
					padding: 20rpx;
					box-sizing: border-box;
					word-break: break-all;
				}

				.delete-btn {
					position: absolute;
					z-index: 3;

					.delete-wrap {
						width: 40rpx;
						height: 40rpx;
						background-color: rgba(0, 0, 0, 0.5);
						display: flex;
						justify-content: center;
						align-items: center;
					}
				}
			}
		}
	}
}

@keyframes shake {
	0% { transform: translateX(0) rotate(0deg); }
	25% { transform: translateX(-1px) rotate(-0.5deg); }
	50% { transform: translateX(0) rotate(0deg); }
	75% { transform: translateX(1px) rotate(0.5deg); }
	100% { transform: translateX(0) rotate(0deg); }
}
</style>
