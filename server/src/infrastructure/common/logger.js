const pino = require("pino");
const fs = require("fs");
const path = require("path");
const { SYSTEM } = require("../../interfaces/error/constant");

const logDirectory = "src/logs";
const logFilePath = path.join(logDirectory, "TapTime.log");

if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

// 创建 logger 实例，配置多路传输
const logger = pino({
  // 序列化 Error
  serializers: {
    error: pino.stdSerializers.err,
  },
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
   * info
   * @param {string} logId 日志ID
   * @param {string} moduleName 函数模块名
   * @param {string} status 状态
   * @param {object} info 自定义描述
   */
  info: (logId, moduleName, status, info) => {
    logger.info({ logId, moduleName, status, info });
  },

  /**
   * debug
   * @param {string} logId 日志ID
   * @param {string} moduleName 函数模块名
   * @param {object} info 自定义描述
   */
  debug: (logId, moduleName, info) => {
    logger.debug({ logId, moduleName, info });
  },

  /**
   * 记录warn
   * @param {string} logId 日志ID
   * @param {string} moduleName 函数模块名
   * @param {string} status 状态
   * @param {object} info 自定义描述
   * @param {string} warning 原始警告信息
   */
  warn: (logId, moduleName, status, info, warning) => {
    logger.warn({ logId, moduleName, status, info, warning });
  },

  /**
   * 记录error
   * @param {string} logId 日志ID
   * @param {string} moduleName 函数模块名
   * @param {string} status 状态
   * @param {object} info 自定义描述
   * @param {boolean} [isExpected=false] 是否预期
   * @param {string} error 原生错误信息
   */
  error: (logId, moduleName, status, info, isExpected, error) => {
    logger.error({ logId, moduleName, status, info, isExpected, error });
  },

  /**
   * 展示内容
   * @param {object} info 自定义展示内容
   */
  log: (info) => {
    console.log(info);
  },

  // 日志状态常量
  status: {
    SYSTEM: "SYSTEM",

    START: "START.",
    END: "END.",

    SUCCESS: "SUCCESS.",
    FAIL: "FAIL.",
    ERROR: "ERROR.",
  },
};

module.exports = Log;
