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
}

module.exports = FocuslogRepo;
