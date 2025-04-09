const { AppError, ErrorMap } = require("../../interfaces/error");
const Logger = require("../../infrastructure/common/logger");

const IndexInfoUseCase = require("../usecase/index_case/index_info");
const IndexFocusUseCase = require("../usecase/index_case/index_focus");

const moduleName = "index_controller.js";

// 主页和其他服务相关
class IndexController {
  static async event(ctx, logId, data) {
    try {
      const event = data.event;

      switch (event) {
        // 主页获取
        case "index":
          Logger.info(logId, moduleName, Logger.status.START, data);
          const addRes = await IndexInfoUseCase.do(logId, data);
          ctx.status = 200;
          ctx.body = addRes;
          break;

        // 日志简略
        case "selectFocus":
          Logger.info(logId, moduleName, Logger.status.START, data);
          const selectRes = await IndexFocusUseCase.do(logId, data);
          ctx.status = 200;
          ctx.body = selectRes;
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

module.exports = IndexController;
