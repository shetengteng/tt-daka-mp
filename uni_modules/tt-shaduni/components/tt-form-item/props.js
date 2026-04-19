const formItemProps = {
  label: {
    type: String,
    default: ""
  },
  prop: {
    type: String,
    default: ""
  },
  required: {
    type: Boolean,
    default: false
  },
  direction: {
    type: String,
    default: "horizontal"
  },
  hideLabel: {
    type: Boolean,
    default: false
  },
  arrow: {
    type: Boolean,
    default: false
  },
  clickable: {
    type: Boolean,
    default: false
  },
  border: {
    type: Boolean,
    default: true
  },
  labelWidth: {
    type: String,
    default: ""
  },
  labelStyle: {
    type: [String, Object],
    default: ""
  },
  contentStyle: {
    type: [String, Object],
    default: ""
  }
};
export {
  formItemProps
};
