const Logger = require("../common/logger");
const knex = require("./db_connection");
const dbConfig = require("./db_config");

const moduleName = "db_initialized.js";

async function databaseInitialized() {
  // 校验数据库存在
  async function checkDatabaseExists() {
    try {
      const result = await knex.raw("SHOW DATABASES LIKE ?", [dbConfig.name]);
      const databases = result[0].map((row) => row.Database || row[`Database (${dbConfig.name})`]);
      return databases.includes(dbConfig.name);
    } catch (error) {
      Logger.error(undefined, moduleName, Logger.status.ERROR, undefined, undefined, error);
      return false;
    }
  }

  // 创建新数据库
  async function createDatabase() {
    try {
      await knex.raw("CREATE DATABASE ?? CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci", [dbConfig.name]);
      Logger.info(undefined, moduleName, Logger.status.SUCCESS, { message: `Database ${dbConfig.name} created` });
      return true;
    } catch (error) {
      Logger.error(undefined, moduleName, Logger.status.ERROR, undefined, undefined, error);
      return false;
    }
  }

  // 主流程
  async function main() {
    // 数据库校验
    const dbExists = await checkDatabaseExists();
    if (!dbExists) {
      Logger.info(undefined, moduleName, Logger.status.START, { message: `Creating database ${dbConfig.name}` });
      const success = await createDatabase();
      if (!success) {
        throw new Error("Database creation failed");
      }
      knex.destroy(); // 关闭旧连接
    }
  }

  await main();
}

databaseInitialized().catch((error) => {
  Logger.error(undefined, moduleName, Logger.status.ERROR, undefined, undefined, error);
  // 终止进程
  process.exit(1);
});
