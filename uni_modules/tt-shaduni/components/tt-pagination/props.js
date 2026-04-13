const paginationProps = {
  modelValue: { type: Number, default: 1 },
  totalItems: { type: Number, default: 0 },
  itemsPerPage: { type: Number, default: 10 },
  mode: { type: String, default: "number" },
  showPageSize: { type: Number, default: 5 }
};
export {
  paginationProps
};
