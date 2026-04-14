function createAnonymousAuth(emas) {
  let _authorized = false;
  const isAuthorized = () => _authorized;
  const resetState = () => {
    _authorized = false;
  };
  const authorize = async () => {
    await emas.init();
    const mp = emas.getMpServerless();
    if (_authorized) return { success: true };
    try {
      await mp.user.authorize({ authType: "anonymous" });
      _authorized = true;
      return { success: true };
    } catch (error) {
      const msg = error?.message || error?.error?.message || "";
      if (msg.includes("already authorized") || msg.includes("已授权")) {
        _authorized = true;
        return { success: true };
      }
      console.error("[EMAS] 匿名授权失败:", error);
      return { success: false, error: msg || "授权失败" };
    }
  };
  return { authorize, isAuthorized, resetState };
}
function createWechatAuth(emas) {
  let _authorized = false;
  const isAuthorized = () => _authorized;
  const resetState = () => {
    _authorized = false;
  };
  const authorize = async () => {
    await emas.init();
    const mp = emas.getMpServerless();
    if (!mp) return { success: false, userInfo: null, error: "SDK 未初始化" };
    if (_authorized) {
      try {
        const res = await mp.user.getInfo();
        if (res.success) {
          return { success: true, userInfo: res.result?.user || res.result };
        }
      } catch {
        _authorized = false;
      }
    }
    try {
      await mp.user.authorize({ authProvider: "wechat_openapi" });
      const res = await mp.user.getInfo();
      if (res.success) {
        _authorized = true;
        return { success: true, userInfo: res.result?.user || res.result };
      }
      return { success: false, userInfo: null, error: "获取用户信息失败" };
    } catch (error) {
      const msg = error?.message || error?.error?.message || "";
      if (msg.includes("already authorized") || msg.includes("已授权")) {
        const res = await mp.user.getInfo();
        if (res.success) {
          _authorized = true;
          return { success: true, userInfo: res.result?.user || res.result };
        }
        return { success: false, userInfo: null, error: "获取用户信息失败" };
      }
      console.error("[EMAS] 微信授权失败:", error);
      return { success: false, userInfo: null, error: msg || "微信授权失败" };
    }
  };
  return { authorize, isAuthorized, resetState };
}
export {
  createAnonymousAuth,
  createWechatAuth
};
