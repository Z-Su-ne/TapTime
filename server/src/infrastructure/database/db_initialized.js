const Logger = require("../common/logger");
const { AppError, ErrorMap } = require("../../interfaces/error");
const dbConfig = require("./db_config");
const knex = require("./db_connection");

const moduleName = "db_initialized.js";

class DatabaseInitializer {
  // 校验数据库存在
  async checkDatabaseExists() {
    try {
      const result = await knex.raw("SHOW DATABASES LIKE ?", [dbConfig.database_name]);
      return result[0].length > 0;
    } catch (error) {
      throw new AppError(Logger.status.SYSTEM, moduleName, ErrorMap.SYSTEM.DB_CONN_FAILED, "checkDatabaseExists error", true, error);
    }
  }

  // 创建新数据库
  async createDatabase() {
    try {
      await knex.raw("CREATE DATABASE ?? CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci", [dbConfig.database_name]);
      Logger.info(Logger.status.SYSTEM, moduleName, Logger.status.SUCCESS, {
        message: `Database ${dbConfig.database_name} created`,
      });
      return true;
    } catch (error) {
      throw new AppError(Logger.status.SYSTEM, moduleName, ErrorMap.SYSTEM.DB_CONN_FAILED, "createDatabase error", true, error);
    }
  }

  // 校验表是否存在
  async checkTableExists(tableName) {
    try {
      const exists = await knex.schema.hasTable(tableName);
      return exists;
    } catch (error) {
      throw new AppError(Logger.status.SYSTEM, moduleName, ErrorMap.SYSTEM.DB_CONN_FAILED, "checkTableExists error", true, error);
    }
  }

  // 创建表结构
  async createTables() {
    try {
      // 创建主表
      for (const [tableName, tableDef] of Object.entries(dbConfig.table)) {
        const exists = await this.checkTableExists(tableName);
        if (!exists) {
          await knex.schema.createTable(tableName, (table) => {
            // 处理列定义
            for (const [columnName, columnDef] of Object.entries(tableDef.columns)) {
              this.buildColumn(table, columnName, columnDef);
            }
          });
          Logger.info(Logger.status.SYSTEM, moduleName, Logger.status.SUCCESS, { message: `Table ${tableName} created` });
        }
      }

      // 添加索引
      await this.createIndexes();

      // 添加外键
      // await this.createForeignKeys();

      return true;
    } catch (error) {
      throw new AppError(Logger.status.SYSTEM, moduleName, ErrorMap.SYSTEM.DB_CONN_FAILED, "createTables error", true, error);
    }
  }

  // 构建列
  buildColumn(table, name, definition) {
    let column;
    const typeArgs = [];
    if (definition.precision) typeArgs.push(definition.precision, definition.scale);
    else if (definition.length) typeArgs.push(definition.length);

    // 处理特殊类型
    switch (definition.type) {
      case "decimal":
        column = table.decimal(name, ...typeArgs);
        break;
      case "datetime":
      case "timestamp":
        column = table[definition.type](name, { useTz: false, precision: 6 });
        break;
      default:
        column = table[definition.type](name, ...typeArgs);
    }

    // 处理约束
    if (definition.primary) column.primary();
    if (definition.unique) column.unique();
    if (definition.nullable) column.nullable();
    if (definition.defaultTo !== undefined) column.defaultTo(definition.defaultTo);
    if (definition.notNull) column.notNullable();
  }
  // 创建索引
  async createIndexes() {
    try {
      for (const [tableName, tableDef] of Object.entries(dbConfig.table)) {
        if (tableDef.indexes && tableDef.indexes.length > 0) {
          for (const indexDef of tableDef.indexes) {
            await knex.schema.alterTable(tableName, (table) => {
              if (indexDef.unique) {
                table.unique(indexDef.columns, indexDef.name);
              } else {
                table.index(indexDef.columns, indexDef.name, indexDef.indexType);
              }
            });
          }
        }
      }
      return true;
    } catch (error) {
      throw new AppError(Logger.status.SYSTEM, moduleName, ErrorMap.SYSTEM.DB_CONN_FAILED, "buildColumn error", true, error);
    }
  }

  // 创建外键
  async createForeignKeys() {
    try {
      for (const fk of dbConfig.foreignKeys) {
        await knex.schema.alterTable(fk.table, (table) => {
          table.foreign(fk.columns).references(fk.references.columns).inTable(fk.references.table).onDelete("CASCADE").onUpdate("CASCADE");
        });
      }
      return true;
    } catch (error) {
      throw new AppError(Logger.status.SYSTEM, moduleName, ErrorMap.SYSTEM.DB_CONN_FAILED, "createForeignKeys error", true, error);
    }
  }

  // 主流程
  async main() {
    try {
      // 数据库校验
      const dbExists = await this.checkDatabaseExists();
      if (!dbExists) {
        Logger.info(Logger.status.SYSTEM, moduleName, Logger.status.START, { message: `Creating database ${dbConfig.database_name}` });
        const success = await this.createDatabase();
        if (!success) {
          throw new AppError(Logger.status.SYSTEM, moduleName, { message: "createDatabase error" });
        }

        // 重新初始化连接
        await knex.destroy();
        knex = require("./db_connection");
      }

      // 创建表结构
      Logger.info(Logger.status.SYSTEM, moduleName, Logger.status.START, { message: "Initializing database tables" });
      const tablesCreated = await this.createTables();
      if (!tablesCreated) {
        throw new AppError(Logger.status.SYSTEM, moduleName, { message: "createTables error" });
      }

      Logger.info(Logger.status.SYSTEM, moduleName, Logger.status.SUCCESS, { message: "Database initialization completed" });
    } catch (error) {
      if (error.isExpected) {
        throw new AppError(Logger.status.SYSTEM, moduleName, { errcode: error.code, errmsg: error.message, info: error.info });
      } else {
        throw new AppError(Logger.status.SYSTEM, moduleName, ErrorMap.SYSTEM.DB_CONN_FAILED, undefined, false, error);
      }
    }
  }
}

module.exports = DatabaseInitializer;
