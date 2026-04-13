const actionSheetProps = {
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ""
  },
  actions: {
    type: Array,
    default: () => []
  },
  cancelText: {
    type: String,
    default: "Cancel"
  }
};
export {
  actionSheetProps
};
