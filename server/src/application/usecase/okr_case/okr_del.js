const { AppError, ErrorMap } = require("../../../interfaces/error");
const Logger = require("../../../infrastructure/common/logger");
const Util = require("../../../infrastructure/common/util");

const ObjectivesEntity = require("../../../domain/entity/objectives_entity");
const ObjectivesRepo = require("../../../domain/repo/objectives_repo");
const KeyResultsEntity = require("../../../domain/entity/key_results_entity");
const KeyResultsRepo = require("../../../domain/repo/key_results_repo");

const moduleName = "okr_del.js";

class OkrDelUseCase {
  static async do(logId, data) {
    try {
      Logger.info(logId, moduleName, Logger.status.START, { data });

      const delRes = {
        success: true,
        return: undefined,
      };

      delRes.return = await new ObjectivesRepo().update(logId, "uuid", data.uuid, new ObjectivesEntity({ isDel: 1 }));

      Logger.info(logId, moduleName, Logger.status.END, { delRes });
      return delRes;
    } catch (error) {
      Logger.error(logId, moduleName, "okrCase failed", error);
      const delRes = {
        success: false,
        return: "未知错误",
      };
      return delRes;
    }
  }
}

module.exports = OkrDelUseCase;
