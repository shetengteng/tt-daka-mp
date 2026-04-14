import { createEmas } from "./init";
import { createEmasDb, dbCmd, command } from "./database";
import { createAnonymousAuth, createWechatAuth } from "./auth";
import { isQuotaError, handleEmasError, checkEmasError } from "./error";
import { createEmas as createEmas2 } from "./init";
import { createEmasDb as createEmasDb2, dbCmd as dbCmd2 } from "./database";
import { createAnonymousAuth as createAnonymousAuth2, createWechatAuth as createWechatAuth2 } from "./auth";
function setupEmas(options) {
  const emas = createEmas2(options.config, options.sdk);
  const { db } = createEmasDb2(emas, options.mockDb);
  const anonAuth = createAnonymousAuth2(emas);
  const wxAuth = createWechatAuth2(emas);
  return {
    initEmas: () => emas.init(),
    getMpServerless: () => emas.getMpServerless(),
    isEmasReady: () => emas.isReady(),
    getDb: () => emas.getDb(),
    db,
    dbCmd: dbCmd2,
    command: dbCmd2,
    anonymousAuth: () => anonAuth.authorize(),
    isAuthorized: () => anonAuth.isAuthorized(),
    resetAuthState: () => anonAuth.resetState(),
    wechatAuth: () => wxAuth.authorize(),
    isWechatAuthorized: () => wxAuth.isAuthorized(),
    resetWechatAuthState: () => wxAuth.resetState()
  };
}
export {
  checkEmasError,
  command,
  createAnonymousAuth,
  createEmas,
  createEmasDb,
  createWechatAuth,
  dbCmd,
  handleEmasError,
  isQuotaError,
  setupEmas
};
