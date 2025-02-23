const Logger = require("../../infrastructure/common/logger");
const { AppError } = require("../error");

module.exports = () => async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    // 已知自定义错误
    if (err instanceof AppError) {
      ctx.status = err.code >= 5000 ? 500 : 400;
      ctx.body = {
        code: err.code,
        message: err.message,
        info: err.info,
      };
      return;
    }

    // 未知系统错误
    Logger.error(err.logId || undefined, err.moduleName || "GLOBAL_ERROR", Logger.status.ERROR, { path: ctx.path }, false, err);

    ctx.status = 500;
    ctx.body = {
      code: 9999,
      message: "内部服务器错误/Internal Server Error",
      info: "系统发生未预期错误，请联系管理员/Unexpected error occurred in the system, please contact the administrator",
    };
  }
};
