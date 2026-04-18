import { reactive } from "vue";
const notifyState = reactive({
  show: false,
  message: "",
  type: "info",
  duration: 2500,
  position: "top",
  icon: "",
  color: "",
  background: "",
  timer: null
});
function clearTimer() {
  if (notifyState.timer) {
    clearTimeout(notifyState.timer);
    notifyState.timer = null;
  }
}
function openNotify(options, type) {
  clearTimer();
  const opts = typeof options === "string" ? { message: options } : options;
  notifyState.message = opts.message || "";
  notifyState.type = opts.type ?? type ?? "info";
  notifyState.duration = opts.duration ?? 2500;
  notifyState.position = opts.position ?? "top";
  notifyState.icon = opts.icon ?? "";
  notifyState.color = opts.color ?? "";
  notifyState.background = opts.background ?? "";
  notifyState.show = true;
  if (notifyState.duration > 0) {
    notifyState.timer = setTimeout(() => {
      notifyState.show = false;
      notifyState.timer = null;
    }, notifyState.duration);
  }
}
function closeNotify() {
  clearTimer();
  notifyState.show = false;
}
export {
  closeNotify,
  notifyState,
  openNotify
};
