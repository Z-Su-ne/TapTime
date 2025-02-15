const pino = require("pino");
const fs = require("fs");
const path = require("path");

const logDirectory = "src/logs";
const logFilePath = path.join(logDirectory, "TapTime.log");

if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

// 创建 logger 实例，配置多路传输
const logger = pino({
  transport: {
    targets: [
      // 终端输出：使用 pino-pretty 并开启颜色
      {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:yyyy-mm-dd HH:MM:ss.l",
          ignore: "pid,hostname",
        },
      },
      // 文件输出：禁用颜色并指定路径
      {
        target: "pino-pretty",
        options: {
          colorize: false,
          destination: logFilePath,
          translateTime: "SYS:yyyy-mm-dd HH:MM:ss.l",
          ignore: "pid,hostname",
        },
      },
    ],
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
    logger.info({ logId, moduleName, status, info });
  },

  /**
   * 记录debug
   * @param {string} logId 日志ID
   * @param {string} moduleName 函数模块名
   * @param {string} status 状态
   * @param {string} info 日志信息
   */
  debug: (logId, moduleName, status, info) => {
    logger.debug({ logId, moduleName, status, info });
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
    logger.warn({ logId, moduleName, status, info, code, warning });
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
    logger.error({ logId, moduleName, status, info, code, error });
  },

  /**
   * 展示内容
   * @param {string} info 需要展示的内容
   */
  log: (info) => {
    console.log(info);
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
