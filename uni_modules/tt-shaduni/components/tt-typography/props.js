const typographyProps = {
  type: { type: String, default: "text" },
  level: { type: Number, default: 3 },
  ellipsis: { type: [Boolean, Number], default: false },
  bold: { type: Boolean, default: false },
  underline: { type: Boolean, default: false },
  delete: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  href: { type: String, default: "" }
};
export {
  typographyProps
};
