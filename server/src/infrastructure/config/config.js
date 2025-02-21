const Logger = require("../common/logger");

const moduleName = "config.js";

try {
  const env = process.env.MODE_ENV || "dev";
  Logger.info(undefined, moduleName, Logger.status.START, { env });

  let config;
  if (env === "dev") {
    config = require("./dev");
  } else if (env === "prod") {
    config = require("./prod");
  } else if (env === "test") {
    config = require("./test");
  } else {
    Logger.warn(undefined, moduleName, Logger.status.FAIL + " Not find env.", { env });
    config = require("./dev");
  }
  Logger.info(undefined, moduleName, Logger.status.END, { config });

  module.exports = config;
} catch (error) {
  Logger.error(undefined, moduleName, Logger.status.ERROR, { env: process.env.MODE_ENV, error });
}
