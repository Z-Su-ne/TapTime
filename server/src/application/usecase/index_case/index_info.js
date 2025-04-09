const { AppError, ErrorMap } = require("../../../interfaces/error");
const Logger = require("../../../infrastructure/common/logger");
const Util = require("../../../infrastructure/common/util");

const FocusEntity = require("../../../domain/entity/focus_log_entity");
const FocusRepo = require("../../../domain/repo/focus_log_repo");
const ObjectivesEntity = require("../../../domain/entity/objectives_entity");
const ObjectivesRepo = require("../../../domain/repo/objectives_repo");
const KeyResultsEntity = require("../../../domain/entity/key_results_entity");
const KeyResultsRepo = require("../../../domain/repo/key_results_repo");

const moduleName = "index_info.js";

class IndexInfoUseCase {
  static async do(logId, data) {
    try {
      Logger.info(logId, moduleName, Logger.status.START, { data });

      const infoRes = {
        success: true,
        return: undefined,
      };

      // 今日专注看板
      const dashboard = {
        sum: 0,
        count: 0,
      };
      // 目标库数据
      const okr = {
        okrFocusName: "",
        countOkrInProgress: null,
      };
      // 专注日志折叠面板数据
      let focusList = {};

      okr.okrFocusName = (await new ObjectivesRepo().select(logId, new ObjectivesEntity({ uuid: data.okrFocus })))[0].title;
      okr.countOkrInProgress = (await new ObjectivesRepo().select(logId, new ObjectivesEntity({ userId: data.uuid }))).length.toString();

      const selectFocusList = await new FocusRepo().select(logId, new FocusEntity({ objectiveId: data.okrFocus }));

      const today = new Date();
      const year = today.getUTCFullYear();
      const month = String(today.getUTCMonth() + 1).padStart(2, "0"); // 使用UTC时间匹配数据库存储 [[6]]
      const day = String(today.getUTCDate()).padStart(2, "0");
      const todayFormatted = `${year}-${month}-${day}`;
      const temp = selectFocusList.filter((item) => {
        const updatedAt = new Date(item.createdAt);
        const itemYear = updatedAt.getUTCFullYear();
        const itemMonth = String(updatedAt.getUTCMonth() + 1).padStart(2, "0");
        const itemDay = String(updatedAt.getUTCDate()).padStart(2, "0");
        const itemFormatted = `${itemYear}-${itemMonth}-${itemDay}`;
        return itemFormatted === todayFormatted; // 改为与今日日期比较 [[2]][[3]]
      });
      dashboard.count = temp.length;
      dashboard.sum = temp.reduce((acc, item) => acc + item.times, 0);

      focusList = selectFocusList.filter((item) => {
        const updatedAt = new Date(item.createdAt);
        const year = updatedAt.getUTCFullYear();
        const month = String(updatedAt.getUTCMonth() + 1).padStart(2, "0");
        const day = String(updatedAt.getUTCDate()).padStart(2, "0");
        const formattedDate = `${year}-${month}-${day}`;
        return formattedDate === data.selectDate;
      });

      infoRes.return = {
        dashboard: dashboard,
        kr: okr,
        focusList: focusList,
      };

      Logger.info(logId, moduleName, Logger.status.END, { infoRes });
      return infoRes;
    } catch (error) {
      Logger.error(logId, moduleName, "IndexUseCase failed", error);
      const infoRes = {
        success: false,
        return: "未知错误",
      };
      return infoRes;
    }
  }
}

module.exports = IndexInfoUseCase;
