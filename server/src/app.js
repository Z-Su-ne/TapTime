const Koa = require("koa");
const app = new Koa();

const Config = require("./infrastructure/config/config");
const Logger = require("./infrastructure/common/logger");
const Banner = require("./infrastructure/common/banner");
const Route = require("./interfaces/routes/router");

const moduleName = "app.js";

app.use(Route.routes()).use(Route.allowedMethods());

app.listen(3000, () => {
  Logger.log(Banner);
  Logger.info(undefined, moduleName, Logger.status.SUCCESS, "server is running in http://localhost:3000");
});
