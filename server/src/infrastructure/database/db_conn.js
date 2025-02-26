const Knex = require("knex");

const Logger = require("../common/logger");
const { AppError, ErrorMap } = require("../../interfaces/error");
const config = require("../config/config");
const dbConfig = require("./db_config");

const moduleName = "db_connection.js";

// 动态创建 Knex 连接实例
function createKnex(database = null) {
  try {
    return Knex({
      // 数据库信息，数据库名由入参选择
      client: config.database.main.client,
      connection: {
        ...config.database.main.connection,
        database,
      },
      // 连接池配置
      pool: {
        min: 2,
        max: 10,
        afterCreate: (conn, done) => {
          conn.query('SET time_zone="+00:00";', (err) => done(err, conn));
        },
      },
    });
  } catch (error) {
    if (error.isExpected) {
      throw new AppError(Logger.status.SYSTEM, moduleName, { errcode: error.code, errmsg: error.message, info: error.info });
    } else {
      throw new AppError(Logger.status.SYSTEM, moduleName, ErrorMap.SYSTEM.DB_CONN_FAILED, undefined, false, error);
    }
  }
}

module.exports = createKnex;
