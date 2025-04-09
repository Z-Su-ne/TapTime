const { AppError, ErrorMap } = require("../../../interfaces/error");
const Logger = require("../../../infrastructure/common/logger");
const Util = require("../../../infrastructure/common/util");

const FocusEntity = require("../../../domain/entity/focus_log_entity");
const FocusRepo = require("../../../domain/repo/focus_log_repo");

const moduleName = "focus_add.js";

class FocusAddUseCase {
  static async do(logId, data) {
    try {
      Logger.info(logId, moduleName, Logger.status.START, { data });

      const addData = data;
      addData.event = null;
      addData.uuid = Util.uuid();

      const addRes = {
        success: true,
        return: undefined,
      };

      addRes.return = await new FocusRepo().insert(logId, new FocusEntity(addData), "uuid");

      Logger.info(logId, moduleName, Logger.status.END, { addRes });
      return addRes;
    } catch (error) {
      Logger.error(logId, moduleName, "focusCase failed", error);
      const addRes = {
        success: false,
        return: "未知错误",
      };
      return addRes;
    }
  }
}

module.exports = FocusAddUseCase;
