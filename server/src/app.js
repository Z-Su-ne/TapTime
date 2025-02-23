const Koa = require("koa");
const app = new Koa();
const bodyParser = require("koa-bodyparser");

const config = require("./infrastructure/config/config");
const Logger = require("./infrastructure/common/logger");
const Banner = require("./infrastructure/common/banner");
const Route = require("./interfaces/routes/router");
const ErrorHandler = require("./interfaces/error/handler");

const moduleName = "app.js";

// 错误处理
app.use(ErrorHandler());

// 求体解析
app.use(
  bodyParser({
    enableTypes: ["json", "form"],
    jsonLimit: "10mb",
  })
);

// 路由
app.use(Route.routes()).use(Route.allowedMethods());

// 处理未捕获异常
process.on("uncaughtException", (error) => {
  Logger.error("SYSTEM", moduleName, Logger.status.ERROR, { event: "uncaught_exception", promise: "PROMISE_ERR" }, false, error);
  process.exit(1);
});

// 处理 Promise Rejection
process.on("unhandledRejection", (reason) => {
  Logger.error("SYSTEM", moduleName, Logger.status.ERROR, { event: "unhandled_rejection", promise: "PROMISE_ERR" }, false, new Error(`Unhandled rejection: ${reason}`));
});

// 启动服务
app.listen(config.server_port, () => {
  Logger.info(undefined, moduleName, Logger.status.SUCCESS, {
    message: `Server operational`,
    port: config.server_port,
    env: process.env.MODE_ENV,
    pid: process.pid,
  });
  Logger.log(Banner);
});
