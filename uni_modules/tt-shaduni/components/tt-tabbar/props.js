const tabbarProps = {
  modelValue: {
    type: [Number, String],
    default: 0
  },
  items: {
    type: Array,
    default: () => []
  },
  fixed: {
    type: Boolean,
    default: true
  },
  placeholder: {
    type: Boolean,
    default: true
  },
  border: {
    type: Boolean,
    default: true
  },
  safeAreaInsetBottom: {
    type: Boolean,
    default: true
  },
  activeColor: {
    type: String,
    default: ""
  },
  inactiveColor: {
    type: String,
    default: ""
  }
};
export {
  tabbarProps
};
