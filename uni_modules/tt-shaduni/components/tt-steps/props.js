const stepsProps = {
  active: {
    type: Number,
    default: 0
  },
  direction: {
    type: String,
    default: "horizontal"
  },
  items: {
    type: Array,
    default: () => []
  }
};
export {
  stepsProps
};
