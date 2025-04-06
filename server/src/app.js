const Koa = require("koa");
const app = new Koa();
const bodyParser = require("koa-bodyparser");
const cors = require("koa2-cors");
const multer = require("koa-multer");

const config = require("./infrastructure/config/config");
const Logger = require("./infrastructure/common/logger");
const Banner = require("./infrastructure/common/banner");
const DB = require("./infrastructure/database/db_init");
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
    throw error;
  }
}

// 中间件配置
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "Accept"],
    exposeHeaders: ["WWW-Authenticate", "Server-Authorization"],
    maxAge: 60,
  })
);

// 文件上传配置（根据实际字段调整）
app.use(multer().fields([{ name: "file" }, { name: "avatar" }]));

// 请求体解析
app.use(
  bodyParser({
    enableTypes: ["json", "form", "text"],
    jsonLimit: "10mb",
    onerror: (err, ctx) => {
      ctx.throw("body parse error", 400);
    },
  })
);

// 路由配置
app.use(Route.routes()).use(Route.allowedMethods());

// 错误处理
app.use(ErrorHandler());

// 异常监听
process.on("uncaughtException", (error) => {
  Logger.error(
    Logger.status.SYSTEM,
    moduleName,
    Logger.status.ERROR,
    {
      event: "uncaught_exception",
      promise: "PROMISE_ERR",
    },
    false,
    error
  );
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  Logger.error(
    Logger.status.SYSTEM,
    moduleName,
    Logger.status.ERROR,
    {
      event: "unhandled_rejection",
      promise: "PROMISE_ERR",
    },
    false,
    new Error(`Unhandled rejection: ${reason}`)
  );
});

// 启动服务
async function startServer() {
  try {
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
  } catch (error) {
    Logger.error(Logger.status.SYSTEM, moduleName, Logger.status.ERROR, undefined, { message: "Startup failed" }, error);
    process.exit(1);
  }
}

startServer().catch((error) => {
  Logger.error(Logger.status.SYSTEM, moduleName, Logger.status.ERROR, undefined, undefined, error);
  process.exit(1);
});
