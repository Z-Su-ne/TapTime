const { v4: uuidv4 } = require("uuid");

const logger = require("./logger");
const { loggerStatus: loggerStatus } = require("./constant");

const moduleName = "Util";

const Util = {
  // 获取uuid
  uuid: () => {
    return uuidv4();
  },

  // 检查是否为空
  isEmpty: (eventId, param) => {
    try {
      logger.info(eventId, moduleName, loggerStatus.START, { param: param });

      // 检查null、undefined和falsy值（根据需要调整）
      if (param == null || param !== param) {
        logger.info(eventId, moduleName, loggerStatus.END, param);
        return true;
      }
      // 检查字符串是否为空
      if (typeof param === "string" && param.trim() === "") {
        logger.info(eventId, moduleName, loggerStatus.END, param);
        return true;
      }
      // 检查数组和对象是否为空
      if ((Array.isArray(param) || typeof param === "object") && Object.keys(param).length === 0) {
        logger.info(eventId, moduleName, loggerStatus.END, param);
        return true;
      }

      logger.info(eventId, moduleName, loggerStatus.END, param);
      return false;
    } catch (error) {
      logger.error(eventId, moduleName, loggerStatus.ERROR + "er: " + error.message + ", param's type: " + typeof param, param);
      return true;
    }
  },
};

module.exports = {
  uuid: Util.uuid,
  isEmpty: Util.isEmpty,
};
