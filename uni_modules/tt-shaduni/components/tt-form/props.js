const formProps = {
  model: {
    type: Object,
    default: () => ({})
  },
  rules: {
    type: Object,
    default: () => ({})
  },
  labelWidth: {
    type: String,
    default: "160rpx"
  },
  variant: {
    type: String,
    default: "default"
  },
  borderedLast: {
    type: Boolean,
    default: false
  }
};
const TT_FORM_INJECT_KEY = Symbol("TtFormContext");
export {
  formProps,
  TT_FORM_INJECT_KEY
};
