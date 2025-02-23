const Logger = require("../common/logger");
const { AppError, ErrorMap } = require("../../interfaces/error");

const moduleName = "config.js";

try {
  const env = process.env.MODE_ENV || "dev";
  Logger.info("SYSTEM", moduleName, Logger.status.START, { env });

  let config;
  if (env === "dev") {
    config = require("./dev");
  } else if (env === "prod") {
    config = require("./prod");
  } else if (env === "test") {
    config = require("./test");
  } else {
    Logger.warn("SYSTEM", moduleName, Logger.status.FAIL, { message: "Invalid config, use default config." });
    config = require("./dev");
  }
  Logger.info("SYSTEM", moduleName, Logger.status.END, { config });

  module.exports = config;
} catch (error) {
  throw new AppError("SYSTEM", moduleName, ErrorMap.SYSTEM.CONFIG_ERROR, false, error);
}
