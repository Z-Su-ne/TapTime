const pino = require("pino");

const logger = pino({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});

// 自定义日志方法
const Log = {
  /**
   * 记录info
   * @param {string} eventId 日志ID
   * @param {string} moduleName 函数模块名
   * @param {string} status 状态
   * @param {string} info 日志信息
   */
  info: (eventId, moduleName, status, info) => {
    const date = new Date();
    logger.info({ eventId, moduleName, status, info, date });
  },

  /**
   * 记录error
   * @param {string} eventId 日志ID
   * @param {string} moduleName 函数模块名
   * @param {string} status 状态
   * @param {string} info 日志信息
   * @param {string} code 状态码
   * @param {string} error 错误信息
   */
  error: (eventId, moduleName, status, info, code, error) => {
    const date = new Date();
    logger.error({ eventId, moduleName, status, info, code, error, date });
  },

  /**
   * 记录warn
   * @param {string} eventId 日志ID
   * @param {string} moduleName 函数模块名
   * @param {string} status 状态
   * @param {string} info 日志信息
   * @param {string} code 状态码
   * @param {string} warning 警告信息
   */
  warn: (eventId, moduleName, status, info, code, warning) => {
    const date = new Date();
    logger.error({ eventId, moduleName, status, info, code, warning, date });
  },

  /**
   * 记录debug
   * @param {string} eventId 日志ID
   * @param {string} moduleName 函数模块名
   * @param {string} status 状态
   * @param {string} info 日志信息
   */
  debug: (eventId, moduleName, status, info) => {
    const date = new Date();
    logger.debug({ eventId, moduleName, status, info, date });
  },

  // 可按需添加更多方法
};

module.exports = Log;
