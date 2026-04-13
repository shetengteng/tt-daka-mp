const dragProps = {
  modelValue: {
    type: Array,
    default: () => []
  },
  disabled: {
    type: Boolean,
    default: false
  },
  shake: {
    type: Boolean,
    default: false
  },
  mode: {
    type: String,
    default: "grid"
  },
  keyName: {
    type: String,
    default: null
  },
  columns: {
    type: Number,
    default: 3
  },
  singleItemHeight: {
    type: Number,
    default: 120
  },
  itemWidth: {
    type: Number,
    default: 0
  },
  itemHeight: {
    type: Number,
    default: 0
  },
  gap: {
    type: Number,
    default: 20
  },
  borderRadius: {
    type: Number,
    default: 10
  },
  scale: {
    type: Number,
    default: 1.05
  },
  opacity: {
    type: Number,
    default: 0.8
  },
  damping: {
    type: Number,
    default: 40
  },
  deletable: {
    type: Boolean,
    default: false
  },
  deleteTop: {
    type: Number,
    default: 0
  },
  deleteRight: {
    type: Number,
    default: 0
  },
  showDragHandle: {
    type: Boolean,
    default: false
  },
  dragHandlePosition: {
    type: String,
    default: "right"
  },
  dragHandleStyles: {
    type: Object,
    default: () => ({})
  },
  onDelete: {
    type: Function,
    default: null
  },
  longPressDuration: {
    type: Number,
    default: 600
  },
  swipeThreshold: {
    type: Number,
    default: 10
  }
};
export {
  dragProps
};
