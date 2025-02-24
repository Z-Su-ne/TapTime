const Koa = require("koa");
const app = new Koa();
const bodyParser = require("koa-bodyparser");

const config = require("./infrastructure/config/config");
const Logger = require("./infrastructure/common/logger");
const Banner = require("./infrastructure/common/banner");
const DB = require("./infrastructure/database/db_initialized");
const Route = require("./interfaces/routes/router");
const ErrorHandler = require("./interfaces/error/handler");

const moduleName = "app.js";

// 异步初始化数据库
async function initializeDB() {
  try {
    const initializer = new DB();
    await initializer.main();
    Logger.info(Logger.status.SYSTEM, moduleName, Logger.status.SUCCESS, { message: "Database initialization successful" });
  } catch (error) {
    Logger.error(Logger.status.SYSTEM, moduleName, Logger.status.ERROR, undefined, { message: "Database initialization failed" }, false, error);
    process.exit(1);
  }
}

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
  Logger.error(Logger.status.SYSTEM, moduleName, Logger.status.ERROR, { event: "uncaught_exception", promise: "PROMISE_ERR" }, false, error);
  process.exit(1);
});

// 处理 Promise Rejection
process.on("unhandledRejection", (reason) => {
  Logger.error(Logger.status.SYSTEM, moduleName, Logger.status.ERROR, { event: "unhandled_rejection", promise: "PROMISE_ERR" }, false, new Error(`Unhandled rejection: ${reason}`));
});

// 异步启动
async function startServer() {
  await initializeDB();

  app.listen(config.server_port, () => {
    Logger.info(undefined, moduleName, Logger.status.SUCCESS, {
      message: `Server operational`,
      port: config.server_port,
      env: process.env.MODE_ENV,
      pid: process.pid,
    });
    Logger.log(Banner);
  });
}

// 启动应用
startServer().catch((error) => {
  Logger.error(undefined, moduleName, Logger.status.ERROR, undefined, undefined, error);
  process.exit(1);
});
