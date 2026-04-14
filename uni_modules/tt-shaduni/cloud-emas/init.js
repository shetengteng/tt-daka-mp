let _mpserverless = null;
let _initialized = false;
function createEmas(SDK, config) {
  const init = async () => {
    if (_initialized && _mpserverless) return true;
    try {
      _mpserverless = new SDK(uni, {
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
