const calendarProps = {
  modelValue: {
    type: String,
    default: ""
  },
  minDate: {
    type: String,
    default: ""
  },
  maxDate: {
    type: String,
    default: ""
  },
  firstDayOfWeek: {
    type: Number,
    default: 0
  },
  readonly: {
    type: Boolean,
    default: false
  },
  locale: {
    type: String,
    default: "en"
  },
  formatter: {
    type: Function,
    default: void 0
  },
  showBottom: {
    type: Boolean,
    default: true
  }
};
export {
  calendarProps
};
