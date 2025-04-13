const Router = require("koa-router");
const esp32Router = new Router();

const { AppError, ErrorMap } = require("../../interfaces/error");
const Logger = require("../../infrastructure/common/logger");

const moduleName = "esp32_router.js";

esp32Router.post("/api", async (ctx) => {
  try {
    const header = ctx.request.header;
    const logId = ctx.request.body.logId;
    const data = ctx.request.body.data;
    Logger.info(logId, moduleName, Logger.status.START, { request: { header: header, data: data } });

    // await IndexController.event(ctx, logId, data);
    // 生成随机消息
    const messages = ["hello lian!", "hello navi"];
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];

    ctx.body = {
      msg: randomMsg,
      date: new Date(),
    };

    // Logger.info(logId, moduleName, Logger.status.END, undefined);
  } catch (error) {
    Logger.error(ctx.request.body.logId, moduleName, Logger.status.ERROR, { event: ctx.request.body.data.event }, false, error);
  }
});
esp32Router.get("/api", async (ctx) => {
  try {
    const header = ctx.request.header;
    const logId = ctx.request.body.logId;
    const data = ctx.request.body.data;
    Logger.info(logId, moduleName, Logger.status.START, { request: { header: header, data: data } });

    // await IndexController.event(ctx, logId, data);
    ctx.body = { msg: "hello lian", date: new Date() };

    Logger.info(logId, moduleName, Logger.status.END, undefined);
  } catch (error) {
    Logger.error(ctx.request.body.logId, moduleName, Logger.status.ERROR, { event: ctx.request.body.data.event }, false, error);
  }
});

module.exports = esp32Router;
