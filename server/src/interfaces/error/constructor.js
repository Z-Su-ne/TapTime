const Logger = require("../../infrastructure/common/logger");

class AppError extends Error {
  /**
   * @param {string} logId 日志ID
   * @param {string} moduleName 函数模块名
   * @param {object} custom 自定义错误
   * @param {string} info 自定义描述信息
   * @param {boolean} isExpected 是否预期
   * @param {string} error 原始错误信息
   */
  constructor(logId = undefined, moduleName, custom, info, isExpected = false, error) {
    super(info.message);

    // 确保原型链正确
    Object.setPrototypeOf(this, new.target.prototype);

    // 错误元数据
    this.name = moduleName || this.constructor.name;
    this.code = custom.code || undefined;
    this.message = custom.message || undefined;
    this.info = info || undefined;
    this.isExpected = isExpected;
    this.error = error;

    // 自动记录错误

    if (info) {
      custom.info = info;
    }
    Logger.error(logId, moduleName, Logger.status.ERROR, custom, isExpected, error);

    // 保留原始堆栈跟踪
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = AppError;
