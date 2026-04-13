const toastProps = {
  message: {
    type: String,
    default: ""
  },
  type: {
    type: String,
    default: "text"
  },
  duration: {
    type: Number,
    default: 2e3
  },
  show: {
    type: Boolean,
    default: false
  }
};
export {
  toastProps
};
