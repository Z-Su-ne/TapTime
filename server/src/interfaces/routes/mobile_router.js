const Router = require("koa-router");
const mobileRouter = new Router();

const UserController = require("../../application/controllers/user_controller");
const OkrController = require("../../application/controllers/okr_controller");

const { AppError, ErrorMap } = require("../../interfaces/error");
const Logger = require("../../infrastructure/common/logger");

const moduleName = "mobile_router.js";

mobileRouter.post("/user", async (ctx) => {
  try {
    const header = ctx.request.header;
    const logId = ctx.request.body.logId;
    const data = ctx.request.body.data;
    Logger.info(logId, moduleName, Logger.status.START, { request: { header: header, data: data } });

    await UserController.userEvent(ctx, logId, data);

    Logger.info(logId, moduleName, Logger.status.END, undefined);
  } catch (error) {
    Logger.error(ctx.request.body.logId, moduleName, Logger.status.ERROR, { event: ctx.request.body.data.event }, false, error);
  }
});

mobileRouter.post("/okr", async (ctx) => {
  try {
    const header = ctx.request.header;
    const logId = ctx.request.body.logId;
    const data = ctx.request.body.data;
    Logger.info(logId, moduleName, Logger.status.START, { request: { header: header, data: data } });

    await OkrController.okrEvent(ctx, logId, data);

    Logger.info(logId, moduleName, Logger.status.END, undefined);
  } catch (error) {
    Logger.error(ctx.request.body.logId, moduleName, Logger.status.ERROR, { event: ctx.request.body.data.event }, false, error);
  }
});

module.exports = mobileRouter;
