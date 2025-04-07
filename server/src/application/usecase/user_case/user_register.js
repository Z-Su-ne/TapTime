const { AppError, ErrorMap } = require("../../../interfaces/error");
const Logger = require("../../../infrastructure/common/logger");
const Util = require("../../../infrastructure/common/util");

const UsersEntity = require("../../../domain/entity/users_entity");
const UsersRepo = require("../../../domain/repo/users_repo");

const moduleName = "user_register.js";

class UserRegisterUseCase {
  static async do(logId, data) {
    try {
      data.uuid = Util.uuid();
      Logger.info(logId, moduleName, Logger.status.START, { data });

      // 唯一性校验
      const registerRes = {
        success: true,
        return: undefined,
      };
      if (Util.isEmpty(logId, data.email)) {
        registerRes.success = false;
        registerRes.return = "Email is empty.";
        Logger.info(logId, moduleName, Logger.status.END, registerRes);
      } else if (!Util.isEmpty(logId, await new UsersRepo().select(logId, new UsersEntity({ email: data.email })))) {
        registerRes.success = false;
        registerRes.return = "Email is registered.";
        Logger.info(logId, moduleName, Logger.status.END, registerRes);
      } else {
        // 用户注册
        registerRes.return = await new UsersRepo().insert(logId, new UsersEntity(data), "uuid");
        Logger.info(logId, moduleName, Logger.status.END, { registerRes });
      }

      return registerRes;
    } catch (error) {
      Logger.error(logId, moduleName, "UseCase failed", error);
      const registerRes = {
        success: false,
        return: "未知错误",
      };
      return registerRes;
    }
  }
}

module.exports = UserRegisterUseCase;
