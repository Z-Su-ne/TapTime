const { AppError, ErrorMap } = require("../../../interfaces/error");
const Logger = require("../../../infrastructure/common/logger");
const Util = require("../../../infrastructure/common/util");

const UsersEntity = require("../../../domain/entity/users_entity");
const UsersRepo = require("../../../domain/repo/users_repo");

const moduleName = "user_okr_focus.js";

class UserOkrFocusUseCase {
  static async do(logId, data) {
    try {
      Logger.info(logId, moduleName, Logger.status.START, { data });

      const { uuid, isOkrFocus, okrFocusNew, okrFocusOld } = data;
      const updateRes = {
        success: true,
        return: undefined,
      };

      if (okrFocusNew == okrFocusOld) {
        if (!isOkrFocus) {
          await new UsersRepo().update(logId, "uuid", uuid, new UsersEntity({ okrFocus: "" }));
          updateRes.return = await new UsersRepo().select(logId, new UsersEntity({ uuid: uuid }));
        }
      } else {
        await new UsersRepo().update(logId, "uuid", uuid, new UsersEntity({ okrFocus: okrFocusNew }));
        updateRes.return = await new UsersRepo().select(logId, new UsersEntity({ uuid: uuid }));
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

module.exports = UserOkrFocusUseCase;
