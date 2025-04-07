const { AppError, ErrorMap } = require("../../../interfaces/error");
const Logger = require("../../../infrastructure/common/logger");
const Util = require("../../../infrastructure/common/util");

const UsersEntity = require("../../../domain/entity/users_entity");
const UsersRepo = require("../../../domain/repo/users_repo");

const moduleName = "user_login.js";

class UserLoginUseCase {
  static async do(logId, data) {
    try {
      Logger.info(logId, moduleName, Logger.status.START, { data });

      const loginRes = {
        success: true,
        return: undefined,
      };
      // 用户登录
      loginRes.return = await new UsersRepo().select(logId, new UsersEntity(data));

      if (Util.isEmpty(logId, loginRes.return)) {
        loginRes.success = false;
        loginRes.return = "未找到用户";
      }

      Logger.info(logId, moduleName, Logger.status.END, { loginRes });
      return loginRes;
    } catch (error) {
      Logger.error(logId, moduleName, "UseCase failed", error);
      const loginRes = {
        success: false,
        return: "未知错误",
      };
      return loginRes;
    }
  }
}

module.exports = UserLoginUseCase;
