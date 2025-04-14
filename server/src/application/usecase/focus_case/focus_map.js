const { AppError, ErrorMap } = require("../../../interfaces/error");
const Logger = require("../../../infrastructure/common/logger");
const Util = require("../../../infrastructure/common/util");

const FocusEntity = require("../../../domain/entity/focus_log_entity");
const FocusRepo = require("../../../domain/repo/focus_log_repo");

const moduleName = "focus_map.js";

class FocusMapUseCase {
  static async do(logId, data) {
    try {
      Logger.info(logId, moduleName, Logger.status.START, { data });

      const mapRes = {
        success: true,
        return: undefined,
      };

      const focusList = await new FocusRepo().selectMap(logId, new FocusEntity(data));

      // 修正后的日期处理逻辑 [[9]][[7]]
      const dateMap = {};
      focusList.forEach((item) => {
        // 将UTC时间转换为本地时间并格式化为YYYY-MM-DD
        const dateObj = new Date(item.updatedAt);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, "0"); // 月份从0开始需+1
        const day = String(dateObj.getDate()).padStart(2, "0");
        const localDate = `${year}-${month}-${day}`;

        const times = Number(item.times) || 0;

        if (!dateMap[localDate]) {
          dateMap[localDate] = 0;
        }
        dateMap[localDate] += times;
      });

      // 转换为指定格式的数组 [[5]]
      mapRes.return = Object.keys(dateMap).map((date) => [date, dateMap[date]]);

      Logger.info(logId, moduleName, Logger.status.END, { mapRes });
      return mapRes;
    } catch (error) {
      Logger.error(logId, moduleName, "focusCase failed", error);
      return {
        success: false,
        return: "未知错误",
      };
    }
  }
}

module.exports = FocusMapUseCase;
