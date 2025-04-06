const { v4: uuidv4 } = require("uuid");

const { AppError, ErrorMap } = require("../../interfaces/error");
const Logger = require("./logger");

const moduleName = "Util";

const Util = {
  // 获取uuid
  uuid: () => uuidv4(),

  // 检查是否为空
  isEmpty: (logId, param) => {
    try {
      Logger.info(logId, moduleName, Logger.status.START, { type: typeof param, parm: param });

      if (param == null) {
        Logger.info(logId, moduleName, Logger.status.END, { message: "Param is null or undefined." });
        return true;
      }

      if (typeof param === "number" && isNaN(param)) {
        Logger.info(logId, moduleName, Logger.status.END, { message: "Param is NaN." });
        return true;
      }

      if (typeof param === "string" && param.trim() === "") {
        Logger.info(logId, moduleName, Logger.status.END, { message: "Param is an empty string." });
        return true;
      }

      if (Array.isArray(param)) {
        const isEmptyArray = param.length === 0;
        isEmptyArray && Logger.info(logId, moduleName, Logger.status.END, { message: "Param is an empty array." });
        return isEmptyArray;
      }

      if (typeof param === "object") {
        const isEmptyObject = Object.keys(param).length === 0;
        isEmptyObject && Logger.info(logId, moduleName, Logger.status.END, { message: "Param is an empty object." });
        return isEmptyObject;
      }

      Logger.info(logId, moduleName, Logger.status.END, { message: "Param not empty." });
      return false;
    } catch (error) {
      throw new AppError(logId, moduleName, ErrorMap.COMMON.INVALID_PARAMS, "isEmpty", true, error);
    }
  },

  // SQL保留有效entity
  toSqlEntity: (logId, entity) => {
    try {
      Logger.info(logId, moduleName, Logger.status.START, { entity: entity });

      const sqlEntity = {};
      for (const [key, value] of Object.entries(entity)) {
        if (!(value == null)) {
          const column = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
          sqlEntity[column] = value;
        }
      }

      Logger.info(logId, moduleName, Logger.status.END, { sqlEntity: sqlEntity });
      return sqlEntity;
    } catch (error) {
      throw new AppError(logId, moduleName, ErrorMap.COMMON.INVALID_PARAMS, "toSqlEntity", true, error);
    }
  },
};

module.exports = Util;
