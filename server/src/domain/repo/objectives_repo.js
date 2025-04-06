const { AppError, ErrorMap } = require("../../interfaces/error");
const Logger = require("../../infrastructure/common/logger");

const BaseRepo = require("./base_repo");
const ObjectivesEntity = require("../entity/objectives_entity");

moduleName = "objectives_repo.js";

class ObjectivesRepo extends BaseRepo {
  constructor() {
    try {
      super( "objectives", ObjectivesEntity); 
    } catch (error) {
      throw new AppError(Logger.SYSTEM, moduleName, ErrorMap.SYSTEM.DB_QUERY_FAILED, "constructor", true, error);
    }
  }

  // 自定义方法
}

module.exports = ObjectivesRepo;