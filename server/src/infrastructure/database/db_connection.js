const Knex = require("knex");

const Logger = require("../common/logger");
const { AppError, ErrorMap } = require("../../interfaces/error");
const config = require("../config/config");
const dbConfig = require("./db_config");

const moduleName = "db_connection.js";

// 创建数据库的基础连接
const knex = Knex({
  client: config.database.main.client,
  connection: {
    host: config.database.main.connection.host,
    port: config.database.main.connection.port,
    user: config.database.main.connection.username,
    password: config.database.main.connection.password,
    database: dbConfig.database_name,
  },
});

// 验证数据库连接有效性
knex
  .raw("SELECT 'Database connection test'")
  .then(() => {
    Logger.info(Logger.status.SYSTEM, moduleName, Logger.status.SUCCESS, { message: "Database connection verified." });
  })
  .catch((error) => {
    Logger.error(Logger.status.SYSTEM, module, Logger.status.ERROR, ErrorMap.SYSTEM.DB_CONN_FAILED, false, error);
    // 连接错误终止进程
    process.exit(1);
  });

module.exports = knex;
