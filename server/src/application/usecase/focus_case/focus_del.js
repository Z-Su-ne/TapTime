const { AppError, ErrorMap } = require("../../../interfaces/error");
const Logger = require("../../../infrastructure/common/logger");
const Util = require("../../../infrastructure/common/util");

const FocusEntity = require("../../../domain/entity/focus_log_entity");
const FocusRepo = require("../../../domain/repo/focus_log_repo");

const moduleName = "focus_del.js";

class FocusDelUseCase {
  static async do(logId, data) {
    try {
      Logger.info(logId, moduleName, Logger.status.START, { data });

      const delRes = {
        success: true,
        return: undefined,
      };

      delRes.return = await new FocusRepo().update(logId, "uuid", data.uuid, new FocusEntity({ isDel: 1 }));

      Logger.info(logId, moduleName, Logger.status.END, { delRes });
      return delRes;
    } catch (error) {
      Logger.error(logId, moduleName, "focusCase failed", error);
      const delRes = {
        success: false,
        return: "未知错误",
      };
      return delRes;
    }
  }
}

module.exports = FocusDelUseCase;
