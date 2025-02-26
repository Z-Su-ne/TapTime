const Logger = require("../../infrastructure/common/logger");

class AppError extends Error {
  /**
   * @param {string} logId - 日志ID
   * @param {string} moduleName - 函数模块名
   * @param {object} options - 错误配置项
   * @param {number} options.code - 错误码
   * @param {string} options.message - 错误信息
   * @param {object} details - 详细信息对象
   * @param {boolean} [isExpected=false] - 是否预期错误
   * @param {Error} [originalError] - 原始错误对象
   */
  constructor(logId, moduleName, { code, message }, details, isExpected = false, originalError) {
    // 优先使用自定义消息，否则使用原始错误消息
    super(message || (originalError && originalError.message));

    // 维护原型链
    Object.setPrototypeOf(this, new.target.prototype);

    // 错误元数据
    this.name = moduleName || this.constructor.name;
    this.code = code;
    this.message = message || "Application Error";
    this.details = details;
    this.isExpected = isExpected;
    this.originalError = originalError;

    // 构建日志记录对象
    const logPayload = {
      code,
      message,
      details,
      // stack: this.stack,
    };

    // 自动记录错误日志
    Logger.error(logId, moduleName, Logger.status.ERROR, logPayload, isExpected, originalError);

    // 保留原始堆栈跟踪
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = AppError;
