const { AppError, ErrorMap } = require("../../../interfaces/error");
const Logger = require("../../../infrastructure/common/logger");
const Util = require("../../../infrastructure/common/util");

const ObjectivesEntity = require("../../../domain/entity/objectives_entity");
const ObjectivesRepo = require("../../../domain/repo/objectives_repo");
const KeyResultsEntity = require("../../../domain/entity/key_results_entity");
const KeyResultsRepo = require("../../../domain/repo/key_results_repo");

const moduleName = "okr_info.js";

class OkrInfoUseCase {
  static async do(logId, data) {
    try {
      Logger.info(logId, moduleName, Logger.status.START, { data });

      const { objectivesId } = data;
      const infoRes = {
        success: true,
        return: undefined,
      };

      if (Util.isEmpty(logId, objectivesId)) {
        infoRes.success = false;
        infoRes.return = "请填写完全";
      } else {
        const info = {
          objectives: {},
          keyResults: [],
        };

        info.objectives = (await new ObjectivesRepo().select(logId, new ObjectivesEntity({ uuid: objectivesId })))[0];
        info.keyResults = await new KeyResultsRepo().select(logId, new KeyResultsEntity({ objectiveId: objectivesId }));

        infoRes.return = info;
      }

      Logger.info(logId, moduleName, Logger.status.END, { infoRes });
      return infoRes;
    } catch (error) {
      Logger.error(logId, moduleName, "okrCase failed", error);
      const infoRes = {
        success: false,
        return: "未知错误",
      };
      return infoRes;
    }
  }
}

module.exports = OkrInfoUseCase;
