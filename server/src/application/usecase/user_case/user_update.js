const { AppError, ErrorMap } = require("../../../interfaces/error");
const Logger = require("../../../infrastructure/common/logger");
const Util = require("../../../infrastructure/common/util");

const UsersEntity = require("../../../domain/entity/users_entity");
const UsersRepo = require("../../../domain/repo/users_repo");

const moduleName = "user_update.js";

class UserUpdateUseCase {
  static async do(logId, data) {
    try {
      Logger.info(logId, moduleName, Logger.status.START, { data });

      const updateRes = {
        success: true,
        return: undefined,
      };

      // 用户信息更新
      const userInfo = await new UsersRepo().select(logId, new UsersEntity({ uuid: data.uuid }));

      if (Util.isEmpty(logId, userInfo)) {
        updateRes.success = false;
        updateRes.return = "未找到用户";
      } else {
        await new UsersRepo().update(logId, "uuid", data.uuid, new UsersEntity(data));
        updateRes.return = await new UsersRepo().select(logId, new UsersEntity({ uuid: data.uuid }));
      }

      Logger.info(logId, moduleName, Logger.status.END, { updateRes });
      return updateRes;
    } catch (error) {
      Logger.error(logId, moduleName, "UseCase failed", error);
      const updateRes = {
        success: false,
        return: "未知错误",
      };
      return updateRes;
    }
  }
}

module.exports = UserUpdateUseCase;
