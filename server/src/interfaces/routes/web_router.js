const Router = require("koa-router");
const webRouter = new Router();

const Logger = require("../../infrastructure/common/logger");

const moduleName = "Router_Web";
// 定义/web下的路由
webRouter.get("/", (ctx) => {
  Logger.info("test", moduleName, Logger.status.START, { ctx });
  ctx.body = "Welcome to the Web version!";
});

webRouter.get("/about", (ctx) => {
  ctx.body = "About the Web version";
});

module.exports = webRouter;
