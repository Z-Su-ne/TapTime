const knex = require("knex");

const config = require("../config/config");
const Logger = require("../common/logger");

const moduleName = "db_connection.js";

const connection = undefined;
try {
  connection = knex({
    client: "mysql",
    connection: {
      host: config.database.host,
      user: config.database.user,
      password: config.database.password,
      database: config.database.database_name,
    },
  });
  Logger.info(undefined, moduleName, Logger.status.SUCCESS, { connection });
} catch (error) {
  Logger.error(undefined, moduleName, Logger.status.ERROR, { error });
}

module.exports = connection;
