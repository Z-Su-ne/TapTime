const Logger = require("../common/logger");
const { AppError, ErrorMap } = require("../../interfaces/error");
const dbConfig = require("./db_config");
const createKnex = require("./db_conn");

const moduleName = "db_initialized.js";

class DatabaseInitializer {
  // 初始化 Knex 实例
  constructor() {
    this.knex = null;
  }

  // 检查数据库是否存在
  async checkDatabaseExists() {
    try {
      // 校验Knex连接
      const knexExists = createKnex();
      const checkDbExists = await knexExists.raw("SHOW DATABASES LIKE ?", [dbConfig.database_name]);
      if (checkDbExists[0].length === 0) {
        await knexExists.raw("CREATE DATABASE ?? CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci", [dbConfig.database_name]);

        Logger.info(Logger.status.SYSTEM, moduleName, Logger.status.SUCCESS, { message: `Database ${dbConfig.database_name} created` });
      }
      // 关闭测试连接并重连数据库
      await knexExists.destroy();
      this.knex = createKnex(dbConfig.database_name);
    } catch (error) {
      throw new AppError(Logger.status.SYSTEM, moduleName, ErrorMap.SYSTEM.DB_CONN_FAILED, "checkDatabaseExists error", true, error);
    }
  }

  // 检查表是否存在
  async checkTableExists(tableName) {
    try {
      return await this.knex.schema.hasTable(tableName);
    } catch (error) {
      throw new AppError(Logger.status.SYSTEM, moduleName, ErrorMap.SYSTEM.DB_CONN_FAILED, "checkTableExists error", true, error);
    }
  }

  // 创建表
  async createTable(tableName, tableConfig) {
    try {
      await this.knex.schema.createTable(tableName, (table) => {
        Object.entries(tableConfig.columns).forEach(([columnName, column]) => {
          const { type, length, primary, nullable, defaultTo, comment, unsigned } = column;
          let columnDef;

          // 处理字段类型
          switch (type.toLowerCase()) {
            case "varchar":
              columnDef = table[type](columnName, length);
              break;
            case "text":
              columnDef = table[type](columnName);
              break;
            case "smallint":
            case "integer":
              columnDef = table[type](columnName);
              if (unsigned) columnDef.unsigned();
              break;
            case "decimal":
              columnDef = table[type](columnName, column.precision, column.scale);
              break;
            case "boolean":
              columnDef = table.boolean(columnName);
              break;
            case "date":
            case "datetime":
              columnDef = table[type](columnName);
              break;
            default:
              columnDef = table.specificType(columnName, type);
          }

          // 处理约束
          if (primary) columnDef.primary();
          if (nullable) columnDef.nullable();
          if (defaultTo !== undefined) columnDef.defaultTo(defaultTo);
          if (comment) columnDef.comment(comment);
        });
      });
      Logger.info(Logger.status.SYSTEM, moduleName, Logger.status.SUCCESS, { message: `Table ${tableName} created` });
    } catch (error) {
      throw new AppError(Logger.status.SYSTEM, moduleName, ErrorMap.SYSTEM.DB_CONN_FAILED, `createTable ${tableName} error`, true, error);
    }
  }

  // 检查并同步字段
  async syncColumns(tableName, tableConfig) {
    try {
      const existingColumns = await this.knex(tableName).columnInfo();
      const configColumns = tableConfig.columns;

      // 检查新增字段
      for (const [columnName, column] of Object.entries(configColumns)) {
        if (!existingColumns[columnName]) {
          await this.addColumn(tableName, columnName, column);
        }
      }

      // 检查字段修改
      for (const [columnName, column] of Object.entries(configColumns)) {
        if (existingColumns[columnName]) {
          const { type, length, nullable, defaultTo, comment } = column;
          const existingType = existingColumns[columnName].type;
          const configType = this.convertTypeToSql(type, length);

          if (existingType !== configType) {
            await this.modifyColumn(tableName, columnName, column);
          }
        }
      }
    } catch (error) {
      throw new AppError(Logger.status.SYSTEM, moduleName, ErrorMap.SYSTEM.DB_CONN_FAILED, `syncColumns ${tableName} error`, true, error);
    }
  }

  // 添加字段
  async addColumn(tableName, columnName, column) {
    try {
      const { type, length, nullable, defaultTo, comment, unsigned } = column;
      await this.knex.schema.table(tableName, (table) => {
        let columnDef;
        switch (type.toLowerCase()) {
          case "varchar":
            columnDef = table[type](columnName, length);
            break;
          case "text":
            columnDef = table[type](columnName);
            break;
          case "smallint":
          case "integer":
            columnDef = table[type](columnName);
            if (unsigned) columnDef.unsigned();
            break;
          case "decimal":
            columnDef = table[type](columnName, column.precision, column.scale);
            break;
          case "boolean":
            columnDef = table.boolean(columnName);
            break;
          case "date":
          case "datetime":
            columnDef = table[type](columnName);
            break;
          default:
            columnDef = table.specificType(columnName, type);
        }
        if (nullable) columnDef.nullable();
        if (defaultTo !== undefined) columnDef.defaultTo(defaultTo);
        if (comment) columnDef.comment(comment);
      });
      Logger.info(Logger.status.SYSTEM, moduleName, Logger.status.SUCCESS, { message: `Column ${columnName} added to ${tableName}` });
    } catch (error) {
      throw new AppError(Logger.status.SYSTEM, moduleName, ErrorMap.SYSTEM.DB_CONN_FAILED, `addColumn ${columnName} error`, true, error);
    }
  }

  // 修改字段
  async modifyColumn(tableName, columnName, column) {
    try {
      const { type, length, nullable, defaultTo, comment, unsigned } = column;

      // 确保布尔类型的默认值为 0 或 1
      let resolvedDefaultTo = defaultTo;
      if (type.toLowerCase() === "boolean" && typeof defaultTo === "string") {
        resolvedDefaultTo = defaultTo.toLowerCase() === "false" ? 0 : 1;
      }

      await this.knex.schema.table(tableName, (table) => {
        let columnDef;

        switch (type.toLowerCase()) {
          case "varchar":
            columnDef = table[type](columnName, length);
            break;
          case "decimal":
            columnDef = table[type](columnName, column.precision, column.scale);
            break;
          case "boolean":
            columnDef = table.boolean(columnName);
            break;
          default:
            columnDef = table.specificType(columnName, type);
        }

        if (nullable) columnDef.nullable();
        if (resolvedDefaultTo !== undefined) columnDef.defaultTo(resolvedDefaultTo);
        if (comment) columnDef.comment(comment);
        columnDef.alter();
      });

      Logger.info(Logger.status.SYSTEM, moduleName, Logger.status.SUCCESS, { message: `Column ${columnName} modified in ${tableName}` });
    } catch (error) {
      throw new AppError(Logger.status.SYSTEM, moduleName, ErrorMap.SYSTEM.DB_CONN_FAILED, `modifyColumn ${columnName} error`, true, error);
    }
  }

  // 处理外键
  async syncForeignKeys() {
    try {
      for (const fk of dbConfig.foreignKeys) {
        const { table: fkTable, columns: fkColumns, references, onDelete, onUpdate } = fk;
        const existingFk = await this.knex.schema.hasColumn(fkTable, fkColumns);

        if (!existingFk) {
          await this.knex.schema.table(fkTable, (table) => {
            table.foreign(fkColumns).references(references.columns).inTable(references.table).onDelete(onDelete).onUpdate(onUpdate);
          });
          Logger.info(Logger.status.SYSTEM, moduleName, Logger.status.SUCCESS, { message: `Foreign key added to ${fkTable}.${fkColumns}` });
        }
      }
    } catch (error) {
      throw new AppError(Logger.status.SYSTEM, moduleName, ErrorMap.SYSTEM.DB_CONN_FAILED, "syncForeignKeys error", true, error);
    }
  }

  async main() {
    try {
      // 检查数据库
      await this.checkDatabaseExists();

      // 处理表
      for (const [tableName, tableConfig] of Object.entries(dbConfig.table)) {
        const tableExists = await this.checkTableExists(tableName);
        if (!tableExists) {
          await this.createTable(tableName, tableConfig);
        } else {
          await this.syncColumns(tableName, tableConfig);
        }
      }

      // 处理外键
      await this.syncForeignKeys();

      // 关闭连接
      await this.knex.destroy();
    } catch (error) {
      if (error.isExpected) {
        throw new AppError(Logger.status.SYSTEM, moduleName, { errcode: error.code, errmsg: error.message, info: error.info });
      } else {
        throw new AppError(Logger.status.SYSTEM, moduleName, error.code ? error : ErrorMap.SYSTEM.DB_CONN_FAILED, error.message, false, error);
      }
    }
  }

  // 辅助方法：转换字段类型到 SQL 类型
  convertTypeToSql(type, length) {
    switch (type.toLowerCase()) {
      case "varchar":
        return `varchar(${length})`;
      case "text":
        return "text";
      case "smallint":
        return "smallint";
      case "integer":
        return "int";
      case "decimal":
        return `decimal(${this.precision},${this.scale})`;
      case "boolean":
        return "tinyint(1)";
      case "date":
        return "date";
      case "datetime":
        return "datetime";
      default:
        return type;
    }
  }
}

module.exports = DatabaseInitializer;
