const knex = require("knex");

const config = require("../config/config");
const dbConfig = require("./db_config");
const Logger = require("../common/logger");

const moduleName = "db_connection.js";

try {
  const knex = knex({
    client: config.database.main.client,
    connection: {
      host: config.database.main.connection.host,
      port: config.database.main.connection.port,
      user: config.database.main.connection.username,
      password: config.database.main.connection.password,
      database: dbConfig.name,
    },
  });
  Logger.info(undefined, moduleName, Logger.status.SUCCESS, { knex });
  module.exports = knex;
} catch (error) {
  Logger.error(undefined, moduleName, Logger.status.ERROR, { error });
}
