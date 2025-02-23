const Logger = require("../../infrastructure/common/logger");

class AppError extends Error {
  /**
   * @param {string} logId 日志ID
   * @param {string} moduleName 函数模块名
   * @param {object} info 自定义描述 {code: 错误标识, message: 简短描述, info: 额外说明}
   * @param {boolean} isExpected 是否预期
   * @param {string} error 原始错误信息
   */
  constructor(logId = undefined, moduleName, info, isExpected = false, error) {
    super(info.message);

    // 确保原型链正确
    Object.setPrototypeOf(this, new.target.prototype);

    // 错误元数据
    this.name = moduleName || this.constructor.name;
    this.code = info.code;
    this.message = info.message;
    this.info = info.info;
    this.isExpected = isExpected;
    this.error = error;

    // 自动记录错误
    Logger.error(logId, moduleName, Logger.status.ERROR, info, isExpected, error);

    // 保留原始堆栈跟踪
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = AppError;
