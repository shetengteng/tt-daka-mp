const notifyProps = {
  show: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: ""
  },
  type: {
    type: String,
    default: "info"
  },
  duration: {
    type: Number,
    default: 2500
  },
  position: {
    type: String,
    default: "top"
  },
  safeAreaInsetTop: {
    type: Boolean,
    default: true
  },
  icon: {
    type: String,
    default: ""
  },
  color: {
    type: String,
    default: ""
  },
  background: {
    type: String,
    default: ""
  }
};
export {
  notifyProps
};
