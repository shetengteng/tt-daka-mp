<template>
	<view class="tt-drag">
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
				:style="{
					width: itemWidthPx + 'px',
					height: itemHeightPx + 'px',
					'z-index': item._zIndex,
					opacity: item._opacity
				}">

				<view
					class="drag-content"
					:class="{ 'shake': shake && !item._disabled }"
					:style="{
						width: contentWidth,
						height: contentHeight,
						borderRadius: borderRadius + 'rpx',
						transform: 'scale(' + item._scale + ')',
						margin: contentMargin
					}">
				<!-- 拖拽手柄（单列模式） -->
				<view
					v-if="showDragHandle && mode === 'single'"
					class="drag-handle"
					:class="'drag-handle-' + dragHandlePosition"
					:style="{
						width: mergedHandleStyles.width + 'rpx',
						height: mergedHandleStyles.height + 'rpx',
						backgroundColor: mergedHandleStyles.backgroundColor,
						borderRadius: mergedHandleStyles.borderRadius + 'rpx',
						boxShadow: mergedHandleStyles.boxShadow,
						left: dragHandlePosition === 'left' ? mergedHandleStyles.offset + 'rpx' : 'auto',
						right: dragHandlePosition === 'right' ? mergedHandleStyles.offset + 'rpx' : 'auto'
					}"
					@touchstart="handleDragHandleTouchStart(item)"
					@touchend="handleDragHandleTouchEnd(item)">
					<!-- 手柄插槽，允许用户自定义手柄内容 -->
					<slot name="dragHandle" :item="item" :index="index">
						<text style="font-size: 28rpx; color: #666;">☰</text>
					</slot>
				</view>					<!-- 内容区域 -->
					<view
						class="drag-content-inner"
						@touchstart="handleContentTouchStart"
						@touchmove="handleContentTouchMove"
						@touchend="handleContentTouchEnd">
						<!-- 自定义内容插槽 -->
						<slot :item="item" :index="index">
							<!-- 默认展示（图片模式） -->
							<image
								v-if="mode === 'image'"
								class="drag-image"
								:src="getItemValue(item)"
								mode="aspectFill">
							</image>
							<!-- 默认展示（普通内容） -->
							<view v-else class="drag-default">
								{{ getItemValue(item) }}
							</view>
						</slot>
					</view>

					<!-- 删除按钮 -->
					<view
						v-if="deletable && item.deletable !== false"
						class="delete-btn"
						:style="{
							top: deleteTop + 'rpx',
							right: deleteRight + 'rpx'
						}"
						@click="deleteItem(item, index)"
						@touchstart.stop="deleteItemMp(item, index)"
						@touchend.stop="nothing()">
						<view
							class="delete-wrap"
							:style="{
								borderRadius: '0 ' + borderRadius + 'rpx 0 12rpx'
							}">
							<text style="font-size: 24rpx; color: #ffffff;">✕</text>
						</view>
					</view>
				</view>
			</movable-view>
			
		</movable-area>
	</view>
</template>

<script>
export default {
	name: 'tt-drag',
	emits: ['input', 'update:modelValue', 'change', 'delete'],
	props: {
		// Vue2 双向绑定
		value: {
			type: Array,
			default: () => []
		},
		// Vue3 双向绑定
		modelValue: {
			type: Array,
			default: () => []
		},
		// 全局禁用拖拽
		disabled: {
			type: Boolean,
			default: false
		},
		// 是否显示抖动效果
		shake: {
			type: Boolean,
			default: false
		},
		// 模式：single(单列)、grid(网格)、image(图片)、custom(自定义)
		mode: {
			type: String,
			default: 'grid'
		},
		// 从数组元素对象中读取的键名（用于图片或显示内容）
		keyName: {
			type: String,
			default: null
		},
		// 列数（网格模式）
		columns: {
			type: Number,
			default: 3
		},
		// 单列模式下的项高度，单位 rpx
		singleItemHeight: {
			type: Number,
			default: 120
		},
		// 网格模式下的项宽度，单位 rpx（设置后 columns 无效）
		itemWidth: {
			type: Number,
			default: 0
		},
		// 项高度（自定义高度），单位 rpx
		itemHeight: {
			type: Number,
			default: 0
		},
		// 项之间的间距，单位 rpx
		gap: {
			type: Number,
			default: 20
		},
		// 圆角，单位 rpx
		borderRadius: {
			type: Number,
			default: 10
		},
		// 拖动时放大倍数
		scale: {
			type: Number,
			default: 1.05
		},
		// 拖动时不透明度
		opacity: {
			type: Number,
			default: 0.8
		},
		// 阻尼系数
		damping: {
			type: Number,
			default: 40
		},
		// 是否可删除
		deletable: {
			type: Boolean,
			default: false
		},
		// 删除按钮位置调整 top，单位 rpx
		deleteTop: {
			type: Number,
			default: 0
		},
		// 删除按钮位置调整 right，单位 rpx
		deleteRight: {
			type: Number,
			default: 0
		},
		// 是否显示拖拽手柄（单列模式）
		showDragHandle: {
			type: Boolean,
			default: false
		},
		// 拖拽手柄位置（单列模式）：'left' 或 'right'
		dragHandlePosition: {
			type: String,
			default: 'right'
		},
		// 拖拽手柄样式配置对象
		dragHandleStyles: {
			type: Object,
			default: () => ({})
		},
		// 自定义删除方法（返回 Promise 或调用 done 函数）
		onDelete: {
			type: Function,
			default: null
		},
		// 长按时长（毫秒），触发拖拽的延迟时间
		longPressDuration: {
			type: Number,
			default: 600
		},
		// 滑动阈值（px），超过此距离认为是滑动而非点击，不触发预览
		swipeThreshold: {
			type: Number,
			default: 10
		}
	},
	data() {
		return {
			dragList: [],
			dragListIndexMap: new Map(), // 优化: 使用 Map 缓存索引,避免频繁遍历
			screenWidth: 0,
			areaWidth: 0,
			itemWidthPx: 0,
			itemHeightPx: 0,
			cols: 0,
			tempItem: null,
			timer: null,
			longPressTimer: null,
			isDraggingEnabled: false,
			changeStatus: true,
			previewStatus: true,
			firstLoad: true,
			// 优化: 记录触摸起始位置，用于判断是否为滑动
			touchStartX: 0,
			touchStartY: 0,
			touchEndX: 0,
			touchEndY: 0
		}
	},
	computed: {
		// 合并后的手柄样式配置
		mergedHandleStyles() {
			const defaults = {
				width: 60,
				height: 60,
				backgroundColor: 'rgba(0, 0, 0, 0.08)',
				borderRadius: 30,
				boxShadow: '0 2rpx 8rpx rgba(0, 0, 0, 0.15)',
				offset: 20,
				icon: 'bars',
				iconSize: 20,
				iconColor: '#666'
			}
			return { ...defaults, ...this.dragHandleStyles }
		},
		// 区域高度
		areaHeight() {
			let rows = 0
			const total = this.dragList.length

			if (this.mode === 'single') {
				rows = total
			} else {
				rows = Math.ceil(total / this.cols)
			}

			return (rows * this.itemHeightPx).toFixed() + 'px'
		},
		// 内容宽度
		contentWidth() {
			// 减去 margin 后的实际内容宽度
			const gap = this.rpx2px(this.gap)
			return (this.itemWidthPx - gap) + 'px'
		},
		// 内容高度
		contentHeight() {
			// 减去 margin 后的实际内容高度
			const gap = this.rpx2px(this.gap)
			return (this.itemHeightPx - gap) + 'px'
		},
		// 内容外边距（用于实现间距）
		contentMargin() {
			const gap = this.rpx2px(this.gap) / 2
			return `${gap}px`
		}
	},
	watch: {
		value: {
			handler(n) {
				if (!this.firstLoad && this.changeStatus) {
					this.updateList(n, true)
				}
			},
			deep: true
		},
		modelValue: {
			handler(n) {
				if (!this.firstLoad && this.changeStatus) {
					this.updateList(n, true)
				}
			},
			deep: true
		},
		disabled(newVal) {
			// 全局禁用状态改变时，更新所有项的禁用状态
			if (!this.firstLoad) {
				this.dragList.forEach(item => {
					// 如果项本身指定了 draggable: false，则始终禁用
					if (item.draggable === false) {
						item._disabled = true
					} else if (this.showDragHandle && this.mode === 'single') {
						// 单列手柄模式始终禁用（除非手柄被触摸）
						item._disabled = true
					} else if (newVal) {
						// 如果全局禁用，则禁用所有项
						item._disabled = true
					} else {
						// 如果全局启用，也要保持禁用状态，需要通过长按来启用
						// 不要直接设置为 false，保持需要长按的机制
						item._disabled = true
					}
				})
			}
		},
		columns() {
			if (!this.firstLoad) {
				this.recalculateLayout()
			}
		},
		itemHeight() {
			if (!this.firstLoad) {
				this.recalculateLayout()
			}
		},
		singleItemHeight() {
			if (!this.firstLoad) {
				this.recalculateLayout()
			}
		},
		gap() {
			if (!this.firstLoad) {
				this.recalculateLayout()
			}
		},
		itemWidth() {
			if (!this.firstLoad) {
				this.recalculateLayout()
			}
		}
	},
	created() {
		this.screenWidth = uni.getSystemInfoSync().windowWidth
	},
	mounted() {
		this.$nextTick(() => {
			this.initDrag()
		})
	},
	beforeUnmount() {
		// 清理所有定时器和引用
		this.clearAllTimers()
		this.tempItem = null
		this.dragListIndexMap.clear()
	},
	methods: {
		// 优化: 统一清理定时器的方法
		clearAllTimers() {
			if (this.longPressTimer) {
				clearTimeout(this.longPressTimer)
				this.longPressTimer = null
			}
			if (this.timer) {
				clearTimeout(this.timer)
				this.timer = null
			}
		},
		// 优化: 统一更新项位置的方法,移除重复的 setTimeout 嵌套
		updateItemPosition(item) {
			this.$nextTick(() => {
				item._x = item._absX * this.itemWidthPx
				item._y = item._absY * this.itemHeightPx
			})
		},
		// 优化: 更新索引映射
		updateIndexMap() {
			this.dragListIndexMap.clear()
			this.dragList.forEach((item, index) => {
				this.dragListIndexMap.set(item._dragId, index)
			})
		},
		// 初始化拖拽
		initDrag() {
			const query = uni.createSelectorQuery().in(this)
		query.select('.tt-drag').boundingClientRect(data => {
			if (!data) {
					console.error('TtDrag: 组件未正确渲染，将在下一帧重试')
					// 如果首次查询失败，延迟重试
					this.$nextTick(() => {
						setTimeout(() => {
							this.initDrag()
						}, 50)
					})
					return
				}

				this.areaWidth = data.width
				this.calculateSize()

				// 初始化数据
				const list = this.modelValue.length > 0 ? this.modelValue : this.value
				list.forEach(item => {
					this.addItemToList(item)
				})

				this.firstLoad = false
			}).exec()
		},
		// 计算尺寸
		calculateSize() {
			if (this.mode === 'single') {
				// 单列模式
				this.cols = 1
				this.itemWidthPx = this.areaWidth
				this.itemHeightPx = this.itemHeight > 0 ? this.rpx2px(this.itemHeight) : this.rpx2px(this.singleItemHeight)
			} else {
				// 网格模式和图片模式
				if (this.itemWidth > 0) {
					// 使用自定义宽度
					this.itemWidthPx = this.rpx2px(this.itemWidth)
					this.cols = Math.floor(this.areaWidth / this.itemWidthPx)
				} else {
					// 使用列数
					this.cols = this.columns
					this.itemWidthPx = this.areaWidth / this.cols
				}

				// 高度：图片模式强制正方形，网格模式可自定义
				if (this.mode === 'image') {
					// 图片模式始终保持正方形
					this.itemHeightPx = this.itemWidthPx
				} else if (this.itemHeight > 0) {
					// 网格模式可自定义高度
					this.itemHeightPx = this.rpx2px(this.itemHeight)
				} else {
					// 网格模式默认使用宽度的 1.2 倍作为高度，避免强制正方形
					this.itemHeightPx = this.itemWidthPx * 1.2
				}
			}
		},
		// 重新计算布局
		recalculateLayout() {
			this.calculateSize()
			// 重新定位所有项
			this.dragList.forEach((item, index) => {
				const absX = this.mode === 'single' ? 0 : index % this.cols
				const absY = Math.floor(index / this.cols)
				item._x = absX * this.itemWidthPx
				item._y = absY * this.itemHeightPx
			})
		},
		// 获取项的显示值
		getItemValue(item) {
			// 如果有 keyName 属性，从对象中获取
			if (this.keyName && typeof item === 'object') {
				return item[this.keyName]
			}
			// 如果 item 有 value 属性（基本类型包装后的对象）
			if (typeof item === 'object' && item !== null && 'value' in item && !('id' in item)) {
				return item.value
			}
			return item
		},
		// 添加项到列表
		addItemToList(data) {
			const index = this.dragList.length
			const absX = this.mode === 'single' ? 0 : index % this.cols
			const absY = Math.floor(index / this.cols)
			const x = absX * this.itemWidthPx
			const y = absY * this.itemHeightPx

			// 处理基本类型（字符串、数字等）和对象类型
			const baseData = typeof data === 'object' && data !== null ? { ...data } : { value: data }

			// 判断是否禁用拖拽
			// 1. 如果全局 disabled 为 true，则禁用
			// 2. 如果数据项指定了 draggable: false，则禁用
			// 3. 如果是单列手柄模式，则禁用（只能通过手柄拖动）
			// 4. 其他情况默认禁用，需要长按后才能拖动
			const itemDisabled = this.disabled || (baseData.draggable === false) || (this.showDragHandle && this.mode === 'single')
			// 如果不是上述情况，则默认禁用，需要通过长按来启用拖拽
			const needLongPress = !this.disabled && baseData.draggable !== false && !(this.showDragHandle && this.mode === 'single')

			const dragId = this.generateId()
			const dragItem = {
				...baseData,
				_dragId: dragId,
				_x: x,
				_y: y,
				_oldX: x,
				_oldY: y,
				_absX: absX,
				_absY: absY,
				_scale: 1,
				_zIndex: index + 9,
				_opacity: 1,
				_index: index,
				_disabled: itemDisabled || needLongPress, // 初始禁用，需要长按或者满足禁用条件
				_offset: 0,
				_moveEnd: false
			}

			this.dragList.push(dragItem)
			// 优化: 更新索引映射
			this.dragListIndexMap.set(dragId, index)
		},
		// 更新列表
		updateList(newList, fromWatch = false) {
			// console.log('[zero-drag] updateList 被调用，fromWatch:', fromWatch, 'changeStatus:', this.changeStatus)
			
			// 优化: 如果是从 watch 触发，智能处理保存后的数据同步
			if (fromWatch && newList.length === this.dragList.length) {
				// 按当前 _index 排序，得到当前的显示顺序
				const sortedDragList = this.dragList.slice().sort((a, b) => a._index - b._index)
				
				// 检查新数据的顺序是否与当前显示顺序一致
				let isOrderSame = true
				const orderComparison = []
				for (let i = 0; i < newList.length; i++) {
					const newValue = this.getItemValue(newList[i])
					const oldValue = this.getItemValue(sortedDragList[i])
					orderComparison.push({ index: i, new: newValue, old: oldValue, same: newValue === oldValue })
					
					if (newValue !== oldValue) {
						isOrderSame = false
					}
				}
				
				// console.log('[zero-drag] 顺序比对:', orderComparison)
				
				// 如果顺序一致，说明是保存操作，只需更新数据内容，不改变位置
				if (isOrderSame) {
					// console.log('[zero-drag] ✅ 保存后数据同步，保持当前位置避免闪烁')
					
					// 只更新数据内容，保持所有位置和内部状态不变
					for (let i = 0; i < newList.length; i++) {
						const newData = newList[i]
						const oldItem = sortedDragList[i]
						
						// 更新非内部属性的数据
						const baseData = typeof newData === 'object' && newData !== null ? { ...newData } : { value: newData }
						Object.keys(baseData).forEach(key => {
							if (!key.startsWith('_')) {
								oldItem[key] = baseData[key]
							}
						})
					}
					
					return
				} else {
					// console.log('[zero-drag] ⚠️ 数据顺序变化，需要重新构建')
				}
			}
			
			// 如果不是保存操作，或者数据真的变了，才重新构建
			// console.log('[zero-drag] 🔄 需要重新构建列表')
			
			// 清空并重建列表
			this.dragList = []
			this.dragListIndexMap.clear()
			
			newList.forEach(item => {
				this.addItemToList(item)
			})
		},
		// 拖拽变化
		onChange(e, item) {
			if (!item) return
			
			item._oldX = e.detail.x
			item._oldY = e.detail.y
			
			if (e.detail.source === 'touch') {
				if (item._moveEnd) {
					item._offset = Math.sqrt(
						Math.pow(item._oldX - item._absX * this.itemWidthPx, 2) +
						Math.pow(item._oldY - item._absY * this.itemHeightPx, 2)
					)
				}
				
				// 计算新位置
				let x = Math.floor((e.detail.x + this.itemWidthPx / 2) / this.itemWidthPx)
				if (this.mode !== 'single' && x >= this.cols) return
				
				let y = Math.floor((e.detail.y + this.itemHeightPx / 2) / this.itemHeightPx)
				let newIndex = this.mode === 'single' ? y : this.cols * y + x
				
				if (item._index !== newIndex && newIndex < this.dragList.length) {
					// 优化: 更新其他项位置,减少重复代码
					this.dragList.forEach(obj => {
						if (item._index > newIndex && obj._index >= newIndex && obj._index < item._index) {
							this.changeItemPosition(obj, 1)
						} else if (item._index < newIndex && obj._index <= newIndex && obj._index > item._index) {
							this.changeItemPosition(obj, -1)
						} else if (obj._dragId !== item._dragId) {
							obj._offset = 0
							obj._x = obj._oldX
							obj._y = obj._oldY
							// 优化: 使用统一的更新方法,移除重复的 setTimeout 嵌套
							this.updateItemPosition(obj)
						}
					})
					
					// 更新当前项位置
					item._index = newIndex
					item._absX = this.mode === 'single' ? 0 : x
					item._absY = y
					
					if (!item._moveEnd) {
						// 优化: 使用统一的更新方法
						this.updateItemPosition(item)
					}
					
					// 优化: 更新索引映射
					this.updateIndexMap()
					
					// emitChange 会自动管理 changeStatus
					this.emitChange()
				}
			}
		},
		// 改变项位置
		changeItemPosition(item, offset) {
			item._index += offset
			item._offset = 0
			item._x = item._oldX
			item._y = item._oldY
			item._absX = this.mode === 'single' ? 0 : item._index % this.cols
			item._absY = Math.floor(item._index / this.cols)
			
			// 优化: 使用统一的更新方法,移除重复的 setTimeout 嵌套
			this.updateItemPosition(item)
		},
		// 触摸开始
		touchstart(e, item) {
			// 优化: 记录触摸起始位置
			if (e.touches && e.touches.length > 0) {
				this.touchStartX = e.touches[0].clientX
				this.touchStartY = e.touches[0].clientY
			}
			
			// 单列手柄模式下，不执行放大等效果，因为只有手柄才能触发拖动
			if (this.showDragHandle && this.mode === 'single') {
				return
			}

			// 如果全局禁用或该项禁用拖拽，则不处理任何效果
			if (this.disabled || (item.draggable === false)) {
				return
			}

			// 优化: 使用统一的清理方法
			this.clearAllTimers()

			// 优化: 直接遍历更新 zIndex,避免不必要的查找
			this.dragList.forEach(v => {
				v._zIndex = v._index + 9
			})
			item._zIndex = 99
			item._moveEnd = true
			this.tempItem = item

			// 设置长按定时器，达到指定时长后启用拖拽和视觉反馈
			this.longPressTimer = setTimeout(() => {
				// 启用拖拽
				item._disabled = false
				
				// 视觉反馈：轻微放大和透明度
				item._scale = this.scale
				item._opacity = this.opacity
				
				// 优化: 定时器执行完毕后清理
				this.longPressTimer = null
			}, this.longPressDuration)
		},
		// 触摸结束
		touchend(e, item) {
			// 优化: 记录触摸结束位置
			if (e.changedTouches && e.changedTouches.length > 0) {
				this.touchEndX = e.changedTouches[0].clientX
				this.touchEndY = e.changedTouches[0].clientY
			}
			
			// 单列手柄模式下，直接返回
			if (this.showDragHandle && this.mode === 'single') {
				return
			}

			// 优化: 清除所有定时器
			const wasWaitingForLongPress = !!this.longPressTimer
			this.clearAllTimers()

			// 如果还在等待长按，说明是点击或短按，执行预览等操作
			const isClick = wasWaitingForLongPress

			// 预览功能（用于图片模式）
			if (this.mode === 'image' && isClick) {
				this.previewImage(item, true)
			}

			// 禁用拖拽
			item._disabled = true
			item._scale = 1
			item._opacity = 1
			
			// 先恢复到拖动开始前的位置
			item._x = item._oldX
			item._y = item._oldY
			item._offset = 0
			item._moveEnd = false

			// 使用 setTimeout 和 $nextTick 异步更新到最终位置
			// 这样确保 _absX 和 _absY 已经被 onChange 正确更新
			setTimeout(() => {
				this.$nextTick(() => {
					item._x = item._absX * this.itemWidthPx
					item._y = item._absY * this.itemHeightPx
					item._oldX = item._x
					item._oldY = item._y
					this.tempItem = null
					this.changeStatus = true
				})
			}, 0)
		},
		// 预览图片
		previewImage(item, isClick = false) {
			// 优化: 计算触摸移动距离，判断是否为滑动
			const moveDistance = Math.sqrt(
				Math.pow(this.touchEndX - this.touchStartX, 2) + 
				Math.pow(this.touchEndY - this.touchStartY, 2)
			)
			
			// 优化: 如果移动距离超过阈值，认为是滑动而非点击，不触发预览
			const isSwipe = moveDistance > this.swipeThreshold
			
			// console.log('[zero-drag] 预览判断 - 移动距离:', moveDistance.toFixed(2), 'px, 阈值:', this.swipeThreshold, 'px, 是否滑动:', isSwipe)
			
			if (isClick && this.previewStatus && this.changeStatus && !isSwipe && item._offset < 28.28) {
				// 使用排序后的 dragList 生成预览列表，保证顺序一致
				const sortedList = this.dragList.slice().sort((a, b) => a._index - b._index)
				const urls = sortedList.map(v => this.getItemValue(v))

				// H5 环境下延迟执行预览，避免事件冲突导致预览一闪而过
				let delay = 0
				// #ifdef H5
				delay = 100
				// #endif

				// 设置预览状态为 false，防止重复触发
				this.previewStatus = false

				setTimeout(() => {
					uni.previewImage({
						urls: urls,
						current: this.getItemValue(item),
						complete: () => {
							// 无论成功、失败还是用户关闭，都恢复预览状态
							setTimeout(() => {
								this.previewStatus = true
							}, 300)
						}
					})
				}, delay)
			} else if (isSwipe) {
			}
		},
		// 鼠标进入（H5）
		mouseenter() {
			// #ifdef H5
			this.dragList.forEach(v => {
				v._disabled = false
			})
			// #endif
		},
		// 鼠标离开（H5）
		mouseleave() {
			// #ifdef H5
			if (this.tempItem) {
				// 优化: 使用统一的清理方法
				this.clearAllTimers()
				
				const tempItemId = this.tempItem._dragId
				
				this.dragList.forEach(v => {
					v._disabled = true
					v._zIndex = v._index + 9
					v._offset = 0
					v._moveEnd = false
					
					if (v._dragId === tempItemId) {
						v._scale = 1
						v._opacity = 1
						
						// 先恢复到拖动开始前的位置
						v._x = v._oldX
						v._y = v._oldY
						
						this.$nextTick(() => {
							// 异步更新到最终位置，确保 _absX 和 _absY 已经被 onChange 正确更新
							v._x = v._absX * this.itemWidthPx
							v._y = v._absY * this.itemHeightPx
							v._oldX = v._x
							v._oldY = v._y
							// 优化: 清理 tempItem 引用,避免内存泄漏
							this.tempItem = null
						})
					}
				})
				this.changeStatus = true
			}
			// #endif
		},
		// 删除项
		deleteItem(item, index) {
			if (this.onDelete && typeof this.onDelete === 'function') {
				// 传递 item 信息和 done 回调给父组件
				this.onDelete(item, () => {
					this.deleteItemHandle(item, index)
				})
			} else {
				this.deleteItemHandle(item, index)
			}
		},
		// 删除项处理
		deleteItemHandle(item, index) {
			this.dragList.splice(index, 1)
			
			// 优化: 更新索引映射
			this.dragListIndexMap.delete(item._dragId)

			// 删除后触发 delete 事件
			this.$emit('delete', index, item)

			// 优化: 更新后续项的位置,使用统一的更新方法
			this.dragList.forEach(obj => {
				if (obj._index > item._index) {
					obj._index -= 1
					obj._x = obj._oldX
					obj._y = obj._oldY
					obj._absX = this.mode === 'single' ? 0 : obj._index % this.cols
					obj._absY = Math.floor(obj._index / this.cols)

					this.updateItemPosition(obj)
				}
			})
			
			// 优化: 重建索引映射
			this.updateIndexMap()

			this.emitChange()
		},
		// 小程序删除
		deleteItemMp(item, index) {
			// #ifdef MP
			this.deleteItem(item, index)
			// #endif
		},
		// 触发变化事件
		emitChange() {
			const result = []
			const sortedList = this.dragList.slice().sort((a, b) => a._index - b._index)
			
			sortedList.forEach(item => {
				// 创建不包含内部属性的对象
				const cleanItem = {}
				Object.keys(item).forEach(key => {
					if (!key.startsWith('_')) {
						cleanItem[key] = item[key]
					}
				})
				result.push(cleanItem)
			})
			
			// 优化: 暂时禁用 changeStatus，避免触发 watch 导致循环更新和闪烁
			this.changeStatus = false
			this.$emit('input', result)
			this.$emit('update:modelValue', result)
			this.$emit('change', result)
			
			// 优化: 延迟恢复 changeStatus，确保保存完成后才允许 watch 触发
			this.$nextTick(() => {
				setTimeout(() => {
					this.changeStatus = true
				}, 200)
			})
		},
		// 空函数
		nothing() {},
		// 处理手柄触摸开始（用于手柄模式）
		handleDragHandleTouchStart(item) {
			// 单列手柄模式下，触摸手柄时启用拖动
			if (this.showDragHandle && this.mode === 'single' && item) {
				// 启用拖动
				item._disabled = false
				
				// 设置拖拽状态
				this.dragList.forEach(v => {
					v._zIndex = v._index + 9
				})
				item._zIndex = 99
				item._moveEnd = true
				this.tempItem = item
				
				// 视觉反馈：轻微放大和透明度
				item._scale = this.scale
				item._opacity = this.opacity
			}
		},
		// 处理手柄触摸结束（用于手柄模式）
		handleDragHandleTouchEnd(item) {
			// 单列手柄模式下，触摸结束后禁用拖动并重置位置
			if (this.showDragHandle && this.mode === 'single' && item) {
				// 禁用拖拽
				item._disabled = true
				item._scale = 1
				item._opacity = 1
				
				// 先恢复到拖动开始前的位置
				item._x = item._oldX
				item._y = item._oldY
				item._offset = 0
				item._moveEnd = false

				// 使用 setTimeout 和 $nextTick 异步更新到最终位置
				// 这样确保 _absX 和 _absY 已经被 onChange 正确更新
				setTimeout(() => {
					this.$nextTick(() => {
						item._x = item._absX * this.itemWidthPx
						item._y = item._absY * this.itemHeightPx
						item._oldX = item._x
						item._oldY = item._y
						this.tempItem = null
						this.changeStatus = true
					})
				}, 0)
			}
		},
		// 处理内容区域触摸开始（用于手柄模式）
		handleContentTouchStart(e) {
			// 只在单列模式且启用手柄时阻止事件
			if (this.showDragHandle && this.mode === 'single') {
				e.stopPropagation()
			}
		},
		// 处理内容区域触摸移动（用于手柄模式）
		handleContentTouchMove(e) {
			// 只在单列模式且启用手柄时阻止事件传播
			if (this.showDragHandle && this.mode === 'single') {
				e.stopPropagation()
			}
		},
		// 处理内容区域触摸结束（用于手柄模式）
		handleContentTouchEnd(e) {
			// 只在单列模式且启用手柄时阻止事件
			if (this.showDragHandle && this.mode === 'single') {
				e.stopPropagation()
			}
		},
		// 处理内容区域鼠标按下（用于手柄模式）
		handleContentMouseDown(e) {
			if (this.showDragHandle && this.mode === 'single') {
				e.stopPropagation()
			}
		},
		// rpx 转 px
		rpx2px(rpx) {
			return this.screenWidth * rpx / 750
		},
		// 生成唯一 ID
		generateId() {
			return 'drag_' + Date.now() + '_' + Math.random().toString(36).slice(2, 11)
		}
	}
}
</script>

<style lang="scss" scoped>
.tt-drag {
	width: 100%;
	
	.drag-area {
		width: 100%;
		position: relative;
		
		.drag-item {
			display: flex;
			justify-content: center;
			align-items: center;

			.drag-content {
				position: relative;
				overflow: hidden;
				// background-color: #f5f5f5;
				display: flex;
				justify-content: center;
				align-items: center;
				box-sizing: border-box;

				// 抖动动画（无限循环，模仿 iOS 效果）
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
			}				.drag-content-inner {
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
					
					// 小程序插槽内容适配
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
						// border-radius 通过内联样式动态设置，右上角跟随组件圆角
						display: flex;
						justify-content: center;
						align-items: center;
					}
				}
			}
		}
	}
}

// 抖动动画（模仿 iOS 效果）
@keyframes shake {
	0% {
		transform: translateX(0) rotate(0deg);
	}
	25% {
		transform: translateX(-1px) rotate(-0.5deg);
	}
	50% {
		transform: translateX(0) rotate(0deg);
	}
	75% {
		transform: translateX(1px) rotate(0.5deg);
	}
	100% {
		transform: translateX(0) rotate(0deg);
	}
}
</style>