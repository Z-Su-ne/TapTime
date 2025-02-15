const { v4: uuidv4 } = require("uuid");

const Logger = require("./logger");

const moduleName = "Util";

const Util = {
  // 获取uuid
  uuid: () => {
    return uuidv4();
  },

  // 检查是否为空
  isEmpty: (logId, param) => {
    try {
      Logger.info(logId, moduleName, Logger.status.START, { param: param });

      // 检查null、undefined和falsy值（根据需要调整）
      if (param == null || param !== param) {
        Logger.info(logId, moduleName, Logger.status.END, param);
        return true;
      }
      // 检查字符串是否为空
      if (typeof param === "string" && param.trim() === "") {
        Logger.info(logId, moduleName, Logger.status.END, param);
        return true;
      }
      // 检查数组和对象是否为空
      if ((Array.isArray(param) || typeof param === "object") && Object.keys(param).length === 0) {
        Logger.info(logId, moduleName, Logger.status.END, param);
        return true;
      }

      Logger.info(logId, moduleName, Logger.status.END, param);
      return false;
    } catch (error) {
      Logger.error(logId, moduleName, Logger.status.ERROR + " errmsg: " + error.message + " , param's type: " + typeof param, param);
      return true;
    }
  },
};

module.exports = {
  uuid: Util.uuid,
  isEmpty: Util.isEmpty,
};
