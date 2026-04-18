import { openNotify, closeNotify } from "./store";
function call(type, options) {
  if (typeof options === "string") {
    openNotify({ message: options, type });
  } else {
    openNotify({ ...options, type: options.type ?? type });
  }
}
const notifyFn = ((options) => {
  call("info", options);
});
notifyFn.info = (options) => call("info", options);
notifyFn.success = (options) => call("success", options);
notifyFn.warning = (options) => call("warning", options);
notifyFn.error = (options) => call("error", options);
notifyFn.primary = (options) => call("primary", options);
notifyFn.hide = () => closeNotify();
notifyFn.close = () => closeNotify();
const notify = notifyFn;
export {
  closeNotify,
  notify
};
