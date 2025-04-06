const { AppError, ErrorMap } = require("../../interfaces/error");
const Logger = require("../../infrastructure/common/logger");

const BaseRepo = require("./base_repo");
const KeyresultsEntity = require("../entity/key_results_entity");

moduleName = "key_results_repo.js";

class KeyresultsRepo extends BaseRepo {
  constructor() {
    try {
      super( "key_results", KeyresultsEntity); 
    } catch (error) {
      throw new AppError(Logger.SYSTEM, moduleName, ErrorMap.SYSTEM.DB_QUERY_FAILED, "constructor", true, error);
    }
  }

  // 自定义方法
}

module.exports = KeyresultsRepo;