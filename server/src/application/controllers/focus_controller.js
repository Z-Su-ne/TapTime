const { AppError, ErrorMap } = require("../../interfaces/error");
const Logger = require("../../infrastructure/common/logger");

const FocusAddUseCase = require("../usecase/focus_case/focus_add");
const FocusDelUseCase = require("../usecase/focus_case/focus_del");

const moduleName = "focus_controller.js";

// 专注时间相关
class FocusController {
  static async focusEvent(ctx, logId, data) {
    try {
      const event = data.event;

      switch (event) {
        // 新增目标
        case "focusAdd":
          Logger.info(logId, moduleName, Logger.status.START, data);
          const addRes = await FocusAddUseCase.do(logId, data);
          ctx.status = 200;
          ctx.body = addRes;
          break;

        // 删除目标
        case "delFocus":
          Logger.info(logId, moduleName, Logger.status.START, data);
          const delRes = await FocusDelUseCase.do(logId, data);
          ctx.status = 200;
          ctx.body = delRes;
          break;

        default:
          ctx.status = 400;
          break;
      }

      Logger.info(logId, moduleName, Logger.status.END, { res: ctx.body });
    } catch (error) {
      Logger.error(logId, moduleName, Logger.status.ERROR, error);
      ctx.status = 201;
    }
  }
}

module.exports = FocusController;
