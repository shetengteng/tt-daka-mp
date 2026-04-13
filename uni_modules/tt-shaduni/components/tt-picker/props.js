const pickerProps = {
  modelValue: { type: [String, Number, Array], default: "" },
  columns: { type: Array, default: () => [] },
  title: { type: String, default: "" },
  confirmText: { type: String, default: "Confirm" },
  cancelText: { type: String, default: "Cancel" },
  show: { type: Boolean, default: false }
};
export {
  pickerProps
};
