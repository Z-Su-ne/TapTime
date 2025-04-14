const { AppError, ErrorMap } = require("../../interfaces/error");
const Logger = require("../../infrastructure/common/logger");
const Util = require("../../infrastructure/common/util");

const BaseRepo = require("./base_repo");
const FocuslogEntity = require("../entity/focus_log_entity");

moduleName = "focus_log_repo.js";

class FocuslogRepo extends BaseRepo {
  constructor() {
    try {
      super("focus_log", FocuslogEntity);
    } catch (error) {
      throw new AppError(Logger.SYSTEM, moduleName, ErrorMap.SYSTEM.DB_QUERY_FAILED, "constructor", true, error);
    }
  }

  // 自定义方法
  async selectMap(logId, entity) {
    try {
      Logger.info(logId, moduleName, Logger.status.START, { type: "select", entity: entity });

      entity.isDel = 0;
      const sqlEntity = Util.toSqlEntity(logId, entity);
      if (Object.keys(sqlEntity).length > 0) {
        const rawResult = await this.knex(this.tableName).where(sqlEntity).andWhereRaw('updated_at >= DATE_FORMAT(CURRENT_DATE, "%Y-%m-01 00:00:00") AND updated_at < DATE_FORMAT(DATE_ADD(CURRENT_DATE, INTERVAL 1 MONTH), "%Y-%m-01 00:00:00")');
        // 下划线转驼峰
        const selectRes = Util.toEntity(logId, rawResult);

        Logger.info(logId, moduleName, Logger.status.END, { selectRes });
        return selectRes.map((data) => new this.EntityClass(data));
      } else {
        Logger.info(logId, moduleName, Logger.status.END, "no selectEntity");
        return null;
      }
    } catch (error) {
      throw new AppError(logId, moduleName, ErrorMap.SYSTEM.DB_FAILED, { method: "select" }, true, error);
    }
  }
}

module.exports = FocuslogRepo;
