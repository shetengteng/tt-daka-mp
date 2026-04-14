let _mpserverless = null;
let _initialized = false;
function loadSDK(sdkOverride) {
  if (sdkOverride) return sdkOverride;
  return require("@alicloud/mpserverless-sdk").default || require("@alicloud/mpserverless-sdk");
}
function createEmas(config, sdk) {
  const init = async () => {
    if (_initialized && _mpserverless) return true;
    try {
      const MPServerless = loadSDK(sdk);
      _mpserverless = new MPServerless(uni, {
        appId: config.appId,
        spaceId: config.spaceId,
        clientSecret: config.clientSecret,
        endpoint: config.endpoint
      });
      _initialized = true;
      return true;
    } catch (error) {
      console.error("[EMAS] 初始化失败:", error);
      return false;
    }
  };
  const getMpServerless = () => _mpserverless;
  const getDb = () => _mpserverless?.db || null;
  const isReady = () => _initialized && !!_mpserverless;
  const reset = () => {
    _mpserverless = null;
    _initialized = false;
  };
  return { init, getMpServerless, getDb, isReady, reset };
}
export {
  createEmas
};
