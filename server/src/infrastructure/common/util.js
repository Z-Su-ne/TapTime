const { v4: uuidv4 } = require("uuid");

const Logger = require("./logger");
const AppError = require("../../interfaces/error");

const moduleName = "Util";

const Util = {
  // 获取uuid
  uuid: () => uuidv4(),

  // 检查是否为空
  isEmpty: (logId, param) => {
    try {
      Logger.info(logId, moduleName, Logger.status.START, { type: typeof param, parm: param });

      // 检查null或undefined
      if (param == null) {
        Logger.info(logId, moduleName, Logger.status.END, { message: "Param is null or undefined." });
        return true;
      }

      // 检查是否为NaN
      if (typeof param === "number" && isNaN(param)) {
        Logger.info(logId, moduleName, Logger.status.END, { message: "Param is NaN." });
        return true;
      }

      // 检查字符串是否为空
      if (typeof param === "string" && param.trim() === "") {
        Logger.info(logId, moduleName, Logger.status.END, { message: "Param is an empty string." });
        return true;
      }

      // 检查数组和对象是否为空
      if ((Array.isArray(param) || typeof param === "object") && Object.getOwnPropertyNames(param).length === 0) {
        Logger.info(logId, moduleName, Logger.status.END, { message: "Param is an empty array or object." });
        return true;
      }

      Logger.info(logId, moduleName, Logger.status.END, { message: "Param not empty." });
      return false;
    } catch (error) {
      Logger.error(logId, moduleName, Logger.status.ERROR, undefined, undefined, { error });
      throw new AppError();
    }
  },
};

module.exports = Util;
