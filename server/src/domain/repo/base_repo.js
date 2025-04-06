const { AppError, ErrorMap } = require("../../interfaces/error");
const Logger = require("../../infrastructure/common/logger");
const Util = require("../../infrastructure/common/util");

const dbConfig = require("../../infrastructure/database/db_config");
const createKnex = require("../../infrastructure/database/db_conn");

let moduleName = "base_repo.js";

class BaseRepo {
  constructor(tableName, EntityClass) {
    try {
      this.tableName = tableName;
      this.knex = createKnex(dbConfig.database_name);
      this.EntityClass = EntityClass;
      moduleName = tableName + "_repo.js";
      Logger.debug(Logger.status.ERROR, moduleName, { tableName, EntityClass });
    } catch (error) {
      throw new AppError(Logger.status.ERROR, moduleName, ErrorMap.SYSTEM.DB_CONN_FAILED, { tableName }, true, error);
    }
  }

  async insert(logId, entity, columnName) {
    try {
      Logger.info(logId, moduleName, Logger.status.START, { type: "insert", entity: entity, column: columnName });

      entity.createdAt = new Date();
      entity.updatedAt = new Date();
      const sqlEntity = Util.toSqlEntity(logId, entity);

      const insertData = await this.knex(this.tableName)
        .insert(sqlEntity)
        .then(() => this.knex(this.tableName).where({ [columnName]: sqlEntity[columnName] }));
      const result = insertData ? insertData : null;

      Logger.info(logId, moduleName, Logger.status.END, { result });
      return result;
    } catch (error) {
      throw new AppError(logId, moduleName, ErrorMap.SYSTEM.DB_QUERY_FAILED, { method: "create" }, true, error);
    }
  }

  async select(logId, entity) {
    try {
      Logger.info(logId, moduleName, Logger.status.START, { type: "select", entity: entity });

      const sqlEntity = Util.toSqlEntity(logId, entity);
      if (Object.keys(sqlEntity).length > 0) {
        const selectRes = await this.knex(this.tableName).where(sqlEntity);
        Logger.info(logId, moduleName, Logger.status.END, { selectRes });
        return selectRes.map((data) => new this.EntityClass(data));
      } else {
        Logger.info(logId, moduleName, Logger.status.END, "no selectEntity");
        return null;
      }
    } catch (error) {
      throw new AppError(logId, moduleName, ErrorMap.SYSTEM.DB_QUERY_FAILED, { method: "select" }, true, error);
    }
  }

  async update(logId, key, value, entity) {
    try {
      Logger.info(logId, moduleName, Logger.status.START, { type: "update", key: key, value: value, entity: entity });

      entity.updatedAt = new Date();
      const sqlEntity = Util.toSqlEntity(logId, entity);
      const updateRes = await this.knex(this.tableName).where(key, value).update(sqlEntity);

      Logger.info(logId, moduleName, Logger.status.END, { updateRes });
      return updateRes;
    } catch (error) {
      throw new AppError(logId, moduleName, ErrorMap.SYSTEM.DB_QUERY_FAILED, { method: "update" }, true, error);
    }
  }

  async delete(logId, key, value) {
    try {
      Logger.info(logId, moduleName, Logger.status.START, { type: "delete", key: key, value: value });

      const deleteRes = await this.knex(this.tableName).where(key, value).del();

      Logger.info(logId, moduleName, Logger.status.END, { deleteRes });
      return deleteRes;
    } catch (error) {
      throw new AppError(logId, moduleName, ErrorMap.SYSTEM.DB_QUERY_FAILED, { method: "delete" }, true, error);
    }
  }
}

module.exports = BaseRepo;
