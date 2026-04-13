const uploadProps = {
  fileList: { type: Array, default: () => [] },
  maxCount: { type: Number, default: 9 },
  maxSize: { type: Number, default: 10 * 1024 * 1024 },
  accept: { type: String, default: "image" },
  disabled: { type: Boolean, default: false },
  previewImage: { type: Boolean, default: true },
  deletable: { type: Boolean, default: true }
};
export {
  uploadProps
};
