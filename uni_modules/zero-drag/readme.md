# zero-drag 通用拖拽排序组件

适用于 uni-app 的拖拽排序组件，支持 `single`、`grid`、`image`、`custom` 四种模式。

## 特性

- 支持 Vue2 / Vue3 双向绑定（`value` / `modelValue`）
- 移动端长按拖拽，H5 可鼠标拖拽
- 单列模式支持拖拽手柄（可自定义样式）
- 图片模式支持点击预览（自动按当前排序预览）
- 内置删除按钮和删除确认回调

## 使用方式

符合 `easycom` 规则，导入到 `uni_modules` 后可直接使用：

```vue
<zero-drag v-model="list" />
```

## 快速开始

### 1. 图片排序（推荐对象数组 + keyName）

```vue
<template>
  <zero-drag
    v-model="imageList"
    mode="image"
    key-name="url"
    :columns="3"
    @change="handleChange" />
</template>

<script>
export default {
  data() {
    return {
      imageList: [
        { id: 1, url: 'https://example.com/1.jpg' },
        { id: 2, url: 'https://example.com/2.jpg' },
        { id: 3, url: 'https://example.com/3.jpg' }
      ]
    }
  },
  methods: {
    handleChange(newList) {
      console.log('最新顺序', newList)
    }
  }
}
</script>
```

### 2. 单列 + 手柄拖拽 + 删除确认

```vue
<template>
  <zero-drag
    v-model="todoList"
    mode="single"
    :single-item-height="120"
    :show-drag-handle="true"
    drag-handle-position="right"
    :deletable="true"
    :on-delete="confirmDelete">
    <template #default="{ item }">
      <view class="todo-item">{{ item.title }}</view>
    </template>
  </zero-drag>
</template>

<script>
export default {
  data() {
    return {
      todoList: [
        { id: 1, title: '完成报告' },
        { id: 2, title: '整理需求' }
      ]
    }
  },
  methods: {
    confirmDelete(item, done) {
      uni.showModal({
        title: '提示',
        content: `删除 ${item.title} ?`,
        success: (res) => {
          if (res.confirm) done()
        }
      })
    }
  }
}
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `value` | Vue2 双向绑定数组 | `Array` | `[]` |
| `modelValue` | Vue3 双向绑定数组 | `Array` | `[]` |
| `mode` | 布局模式：`single` / `grid` / `image` / `custom` | `String` | `'grid'` |
| `disabled` | 全局禁用拖拽 | `Boolean` | `false` |
| `shake` | 是否开启抖动动画（常用于编辑态） | `Boolean` | `false` |
| `key-name` | 对象项取值字段（如图片 URL） | `String` | `null` |
| `columns` | 网格列数（`item-width` > 0 时无效） | `Number` | `3` |
| `single-item-height` | 单列项高度（rpx） | `Number` | `120` |
| `item-width` | 项宽度（rpx） | `Number` | `0` |
| `item-height` | 项高度（rpx） | `Number` | `0` |
| `gap` | 项间距（rpx） | `Number` | `20` |
| `border-radius` | 内容圆角（rpx） | `Number` | `10` |
| `scale` | 拖动时缩放比例 | `Number` | `1.05` |
| `opacity` | 拖动时透明度 | `Number` | `0.8` |
| `damping` | movable-view 阻尼系数 | `Number` | `40` |
| `deletable` | 是否显示删除按钮 | `Boolean` | `false` |
| `delete-top` | 删除按钮 top 偏移（rpx） | `Number` | `0` |
| `delete-right` | 删除按钮 right 偏移（rpx） | `Number` | `0` |
| `show-drag-handle` | 单列模式下是否启用拖拽手柄 | `Boolean` | `false` |
| `drag-handle-position` | 手柄位置：`left` / `right` | `String` | `'right'` |
| `drag-handle-styles` | 手柄样式配置对象 | `Object` | `{}` |
| `on-delete` | 自定义删除逻辑，签名 `(item, done) => void` | `Function` | `null` |
| `long-press-duration` | 长按触发拖拽时长（毫秒） | `Number` | `600` |
| `swipe-threshold` | 图片模式点击预览的滑动阈值（px） | `Number` | `10` |

### `drag-handle-styles` 默认值

```js
{
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
```

### Events

| 事件名 | 说明 | 参数 |
| --- | --- | --- |
| `input` | Vue2 双向绑定回传 | `newList` |
| `update:modelValue` | Vue3 双向绑定回传 | `newList` |
| `change` | 排序变化时触发 | `newList` |
| `delete` | 删除完成后触发 | `(index, item)` |

### Slots

| 插槽名 | 说明 | 参数 |
| --- | --- | --- |
| `default` | 自定义项内容 | `{ item, index }` |
| `dragHandle` | 自定义手柄内容 | `{ item, index }` |

## 数据项约定

- 可通过项级字段控制行为：
  - `draggable: false` 禁止该项拖拽
  - `deletable: false` 隐藏该项删除按钮（`deletable=true` 时生效）
- 推荐使用对象数组。
- 若传入基础类型数组（如 `string[]`），组件内部会包装为 `{ value: xxx }` 并回传。

## 行为说明

- `disabled=true` 表示全局禁用拖拽。
- `disabled=false` 时，移动端默认仍需长按，时长由 `long-press-duration` 控制。
- 单列手柄模式（`mode=single` + `show-drag-handle=true`）下，只能通过手柄触发拖拽。
- 图片模式短按触发预览，滑动距离大于 `swipe-threshold` 时不触发预览。

## 迁移说明（旧文档 -> 当前实现）

以下字段/能力在当前版本不存在，请勿继续使用：

- `addable`
- `max-count`
- `on-add`
- `add` 事件
- `add` 插槽

同时请注意以下已校准项：

- `drag-handle-position` 默认值为 `'right'`
- `long-press-duration` 默认值为 `600`
- `disabled` 语义是“禁用拖拽”，不是“立即可拖拽”





