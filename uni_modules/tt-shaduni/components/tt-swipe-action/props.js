const swipeActionProps = {
  leftActions: { type: Array, default: () => [] },
  rightActions: { type: Array, default: () => [{ text: "Delete", bgColor: "#ef4444" }] },
  disabled: { type: Boolean, default: false },
  autoClose: { type: Boolean, default: true }
};
export {
  swipeActionProps
};
