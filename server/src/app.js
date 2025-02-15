const Koa = require("koa");
const app = new Koa();

const Config = require("./infrastructure/config/config");
const Util = require("./infrastructure/common/util");
const Logger = require("./infrastructure/common/logger");
const Banner = require("./interfaces/resources/banner");
const Route = require("./interfaces/routes/router");

const moduleName = "app.js";

app.use(Route.routes()).use(Route.allowedMethods());

app.listen(3000, () => {
  console.log(Banner);
  Logger.info(undefined, moduleName, Logger.status.SUCCESS, "server is running in http://localhost:3000");
});
