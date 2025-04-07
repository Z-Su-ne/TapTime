const { AppError, ErrorMap } = require("../../../interfaces/error");
const Logger = require("../../../infrastructure/common/logger");
const Util = require("../../../infrastructure/common/util");

const ObjectivesEntity = require("../../../domain/entity/objectives_entity");
const ObjectivesRepo = require("../../../domain/repo/objectives_repo");
const KeyResultsEntity = require("../../../domain/entity/key_results_entity");
const KeyResultsRepo = require("../../../domain/repo/key_results_repo");

const moduleName = "okr_list.js";

class OkrListUseCase {
  static async do(logId, data) {
    try {
      Logger.info(logId, moduleName, Logger.status.START, { data });

      const { userId } = data;
      const listRes = {
        success: true,
        return: undefined,
      };

      if (Util.isEmpty(logId, userId)) {
        listRes.success = false;
        listRes.return = "请填写完全";
      } else {
        const list = {
          pendingList: [],
          inProgressList: [],
          completedList: [],
        };

        const pendingList = await new ObjectivesRepo().select(logId, new ObjectivesEntity({ userId: userId, status: "pending" }));
        list.pendingList = await Promise.all(
          pendingList.map(async (okr) => {
            return { value: okr.uuid, title: okr.title };
          })
        );
        const inProgressList = await new ObjectivesRepo().select(logId, new ObjectivesEntity({ userId: userId, status: "in_progress" }));
        list.inProgressList = await Promise.all(
          inProgressList.map(async (okr) => {
            return { value: okr.uuid, title: okr.title };
          })
        );
        const completedList = await new ObjectivesRepo().select(logId, new ObjectivesEntity({ userId: userId, status: "completed" }));
        list.completedList = await Promise.all(
          completedList.map(async (okr) => {
            return { value: okr.uuid, title: okr.title };
          })
        );

        listRes.return = list;
      }

      Logger.info(logId, moduleName, Logger.status.END, { listRes });
      return listRes;
    } catch (error) {
      Logger.error(logId, moduleName, "okrCase failed", error);
      const listRes = {
        success: false,
        return: "未知错误",
      };
      return listRes;
    }
  }
}

module.exports = OkrListUseCase;
