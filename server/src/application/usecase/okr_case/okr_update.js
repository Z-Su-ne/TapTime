const { AppError, ErrorMap } = require("../../../interfaces/error");
const Logger = require("../../../infrastructure/common/logger");
const Util = require("../../../infrastructure/common/util");

const ObjectivesEntity = require("../../../domain/entity/objectives_entity");
const ObjectivesRepo = require("../../../domain/repo/objectives_repo");
const KeyResultsEntity = require("../../../domain/entity/key_results_entity");
const KeyResultsRepo = require("../../../domain/repo/key_results_repo");

const moduleName = "okr_update.js";

class OkrUpdateUseCase {
  static async do(logId, data) {
    try {
      Logger.info(logId, moduleName, Logger.status.START, { data });

      const { objectives, keyResults } = data;
      const updateRes = {
        success: true,
        return: undefined,
      };

      if (Util.isEmpty(logId, objectives.userId) || Util.isEmpty(logId, objectives.startDate)) {
        updateRes.success = false;
        updateRes.return = "请填写完全";
      } else {
        // keyResults 更新
        const krRes = await Promise.all(
          keyResults.map(async (kr) => {
            if (kr.isDel == null) {
              // 新增关键结果
              return await new KeyResultsRepo().insert(logId, new KeyResultsEntity(kr), "uuid");
            } else {
              // 原有关键结果
              const uuid = kr.uuid;
              kr.uuid = null;
              return await new KeyResultsRepo().update(logId, "uuid", uuid, new KeyResultsEntity(kr));
            }
          })
        );
        Logger.debug(logId, moduleName, krRes);

        // objectives 更新
        objectives.startDate = Util.toMySqlDatetime(objectives.startDate);
        objectives.endDate = Util.toMySqlDatetime(objectives.endDate);
        const oRes = await new ObjectivesRepo().update(logId, "uuid", objectives.uuid, new ObjectivesEntity(objectives));
        Logger.debug(logId, moduleName, oRes);

        updateRes.return = { oRes, krRes };
      }

      Logger.info(logId, moduleName, Logger.status.END, { updateRes });
      return updateRes;
    } catch (error) {
      Logger.error(logId, moduleName, "okrCase failed", error);
      const updateRes = {
        success: false,
        return: "未知错误",
      };
      return updateRes;
    }
  }
}

module.exports = OkrUpdateUseCase;
