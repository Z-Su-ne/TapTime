const Koa = require("koa");
const app = new Koa();

const config = require("./infrastructure/config/config");
const Logger = require("./infrastructure/common/logger");
const Banner = require("./infrastructure/common/banner");
const Route = require("./interfaces/routes/router");

const moduleName = "app.js";

app.use(Route.routes()).use(Route.allowedMethods());

app.listen(config.server_port, () => {
  Logger.log(Banner);
  Logger.info(undefined, moduleName, Logger.status.SUCCESS, `server is running in ${config.server_port}`);
});
