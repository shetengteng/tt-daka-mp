const colorPickerProps = {
  modelValue: {
    type: String,
    default: ""
  },
  colors: {
    type: Array,
    default: () => []
  },
  groups: {
    type: Array,
    default: () => []
  },
  recommended: {
    type: Array,
    default: () => []
  },
  recommendedLabel: {
    type: String,
    default: ""
  },
  previewCount: {
    type: Number,
    default: 5
  },
  size: {
    type: String,
    default: "md"
  },
  shape: {
    type: String,
    default: "circle"
  },
  showLabel: {
    type: Boolean,
    default: false
  },
  showTick: {
    type: Boolean,
    default: true
  },
  popupTitle: {
    type: String,
    default: "选择颜色"
  },
  confirmText: {
    type: String,
    default: "确定"
  },
  cancelText: {
    type: String,
    default: "取消"
  },
  disabled: {
    type: Boolean,
    default: false
  }
};
export {
  colorPickerProps
};
