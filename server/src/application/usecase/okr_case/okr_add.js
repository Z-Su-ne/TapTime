const { AppError, ErrorMap } = require("../../../interfaces/error");
const Logger = require("../../../infrastructure/common/logger");
const Util = require("../../../infrastructure/common/util");

const ObjectivesEntity = require("../../../domain/entity/objectives_entity");
const ObjectivesRepo = require("../../../domain/repo/objectives_repo");
const KeyResultsEntity = require("../../../domain/entity/key_results_entity");
const KeyResultsRepo = require("../../../domain/repo/key_results_repo");

const moduleName = "okr_add.js";

class OkrAddUseCase {
  static async do(logId, data) {
    try {
      Logger.info(logId, moduleName, Logger.status.START, { data });

      const { objectives, keyResults } = data;
      const addRes = {
        success: true,
        return: undefined,
      };

      if (Util.isEmpty(logId, objectives.userId) || Util.isEmpty(logId, objectives.startDate)) {
        addRes.success = false;
        addRes.return = "请填写完全";
      } else {
        // keyResults Add
        const krRes = await Promise.all(
          keyResults.map(async (kr) => {
            return await new KeyResultsRepo().insert(logId, new KeyResultsEntity(kr), "uuid");
          })
        );
        Logger.debug(logId, moduleName, krRes);

        // objectives Add
        objectives.startDate = Util.toMySqlDatetime(objectives.startDate);
        objectives.endDate = Util.toMySqlDatetime(objectives.endDate);
        const oRes = await new ObjectivesRepo().insert(logId, new ObjectivesEntity(objectives), "uuid");
        Logger.debug(logId, moduleName, oRes);

        addRes.return = { oRes, krRes };
      }

      Logger.info(logId, moduleName, Logger.status.END, { addRes });
      return addRes;
    } catch (error) {
      Logger.error(logId, moduleName, "okrCase failed", error);
      const addRes = {
        success: false,
        return: "未知错误",
      };
      return addRes;
    }
  }
}

module.exports = OkrAddUseCase;
