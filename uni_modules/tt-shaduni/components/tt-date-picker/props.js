const datePickerProps = {
  modelValue: { type: String, default: "" },
  mode: { type: String, default: "date" },
  title: { type: String, default: "" },
  show: { type: Boolean, default: false },
  minDate: { type: String, default: "" },
  maxDate: { type: String, default: "" },
  locale: { type: String, default: "en" },
  minYear: { type: Number, default: 2e3 },
  maxYear: { type: Number, default: 2040 }
};
export {
  datePickerProps
};
