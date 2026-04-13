const swiperProps = {
  autoplay: { type: Boolean, default: false },
  interval: { type: Number, default: 3e3 },
  duration: { type: Number, default: 500 },
  circular: { type: Boolean, default: true },
  indicatorDots: { type: Boolean, default: true },
  indicatorColor: { type: String, default: "rgba(0,0,0,.3)" },
  indicatorActiveColor: { type: String, default: "" },
  current: { type: Number, default: 0 }
};
export {
  swiperProps
};
