const { AppError, ErrorMap } = require("../../../interfaces/error");
const Logger = require("../../../infrastructure/common/logger");
const Util = require("../../../infrastructure/common/util");

const FocusEntity = require("../../../domain/entity/focus_log_entity");
const FocusRepo = require("../../../domain/repo/focus_log_repo");

const moduleName = "focus_info.js";

class FocusInfoUseCase {
  static async do(logId, data) {
    try {
      Logger.info(logId, moduleName, Logger.status.START, { data });

      const infoRes = {
        success: true,
        return: undefined,
      };

      infoRes.return = await new FocusRepo().select(logId, new FocusEntity(data));

      Logger.info(logId, moduleName, Logger.status.END, { infoRes });
      return infoRes;
    } catch (error) {
      Logger.error(logId, moduleName, "focusCase failed", error);
      const infoRes = {
        success: false,
        return: "未知错误",
      };
      return infoRes;
    }
  }
}

module.exports = FocusInfoUseCase;
