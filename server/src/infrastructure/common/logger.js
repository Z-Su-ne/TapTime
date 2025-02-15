const pino = require("pino");

const logger = pino({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});

const Log = {
  /**
   * 记录info
   * @param {string} logId 日志ID
   * @param {string} moduleName 函数模块名
   * @param {string} status 状态
   * @param {string} info 日志信息
   */
  info: (logId, moduleName, status, info) => {
    const date = new Date();
    logger.info({ logId, moduleName, status, info, date });
  },

  /**
   * 记录debug
   * @param {string} logId 日志ID
   * @param {string} moduleName 函数模块名
   * @param {string} status 状态
   * @param {string} info 日志信息
   */
  debug: (logId, moduleName, status, info) => {
    const date = new Date();
    logger.debug({ logId, moduleName, status, info, date });
  },

  /**
   * 记录error
   * @param {string} logId 日志ID
   * @param {string} moduleName 函数模块名
   * @param {string} status 状态
   * @param {string} info 日志信息
   * @param {string} code 状态码
   * @param {string} error 错误信息
   */
  error: (logId, moduleName, status, info, code, error) => {
    const date = new Date();
    logger.error({ logId, moduleName, status, info, code, error, date });
  },

  /**
   * 记录warn
   * @param {string} logId 日志ID
   * @param {string} moduleName 函数模块名
   * @param {string} status 状态
   * @param {string} info 日志信息
   * @param {string} code 状态码
   * @param {string} warning 警告信息
   */
  warn: (logId, moduleName, status, info, code, warning) => {
    const date = new Date();
    logger.error({ logId, moduleName, status, info, code, warning, date });
  },

  // 日志状态常量
  status: {
    START: "START.",
    END: "END.",
    FAIL: "FAIL.",
    ERROR: "ERROR.",
    SUCCESS: "SUCCESS.",
  },
};

module.exports = Log;
