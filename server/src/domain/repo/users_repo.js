const { AppError, ErrorMap } = require("../../interfaces/error");
const Logger = require("../../infrastructure/common/logger");

const BaseRepo = require("./base_repo");
const UsersEntity = require("../entity/users_entity");

moduleName = "users_repo.js";

class UsersRepo extends BaseRepo {
  constructor() {
    try {
      super( "users", UsersEntity); 
    } catch (error) {
      throw new AppError(Logger.SYSTEM, moduleName, ErrorMap.SYSTEM.DB_QUERY_FAILED, "constructor", true, error);
    }
  }

  // 自定义方法
}

module.exports = UsersRepo;