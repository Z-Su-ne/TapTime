const { AppError, ErrorMap } = require("../../../interfaces/error");
const Logger = require("../../../infrastructure/common/logger");
const Util = require("../../../infrastructure/common/util");

const FocusEntity = require("../../../domain/entity/focus_log_entity");
const FocusRepo = require("../../../domain/repo/focus_log_repo");
const ObjectivesEntity = require("../../../domain/entity/objectives_entity");
const ObjectivesRepo = require("../../../domain/repo/objectives_repo");
const KeyResultsEntity = require("../../../domain/entity/key_results_entity");
const KeyResultsRepo = require("../../../domain/repo/key_results_repo");

const moduleName = "index_focus.js";

class IndexFocusUseCase {
  static async do(logId, data) {
    try {
      Logger.info(logId, moduleName, Logger.status.START, { data });

      const selectRes = {
        success: true,
        return: undefined,
      };

      const oInfo = await new ObjectivesRepo().select(logId, new ObjectivesEntity({ uuid: data.objectiveId }));
      const krInfo = await new KeyResultsRepo().select(logId, new KeyResultsEntity({ uuid: data.keyResultsId }));

      selectRes.return = {
        o: oInfo,
        kr: krInfo,
      };

      Logger.info(logId, moduleName, Logger.status.END, { selectRes });
      return selectRes;
    } catch (error) {
      Logger.error(logId, moduleName, "IndexFocusUseCase failed", error);
      const selectRes = {
        success: false,
        return: "未知错误",
      };
      return selectRes;
    }
  }
}

module.exports = IndexFocusUseCase;
