const { AppError, ErrorMap } = require("../../interfaces/error");
const Logger = require("../../infrastructure/common/logger");

const OkrAddUseCase = require("../usecase/okr_case/okr_add");
const OkrListUseCase = require("../usecase/okr_case/okr_list");
const OkrInfoUseCase = require("../usecase/okr_case/okr_info");
const OkrUpdateUseCase = require("../usecase/okr_case/okr_update");
const OkrDelUseCase = require("../usecase/okr_case/okr_del");

const moduleName = "okr_controller.js";

// 目标与关键结果相关
class OkrController {
  static async okrEvent(ctx, logId, data) {
    try {
      const event = data.event;

      switch (event) {
        // 新增目标
        case "okrAdd":
          Logger.info(logId, moduleName, Logger.status.START, data);
          const addRes = await OkrAddUseCase.do(logId, data);
          ctx.status = 200;
          ctx.body = addRes;
          break;

        // 目标库
        case "okrList":
          Logger.info(logId, moduleName, Logger.status.START, data);
          const listRes = await OkrListUseCase.do(logId, data);
          ctx.status = 200;
          ctx.body = listRes;
          break;

        // 目标详情
        case "okrInfo":
          Logger.info(logId, moduleName, Logger.status.START, data);
          const infoRes = await OkrInfoUseCase.do(logId, data);
          ctx.status = 200;
          ctx.body = infoRes;
          break;

        // 目标更新
        case "okrUpdate":
          Logger.info(logId, moduleName, Logger.status.START, data);
          const updateRes = await OkrUpdateUseCase.do(logId, data);
          ctx.status = 200;
          ctx.body = updateRes;
          break;

        // 目标删除
        case "okrDel":
          Logger.info(logId, moduleName, Logger.status.START, data);
          const delRes = await OkrDelUseCase.do(logId, data);
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

module.exports = OkrController;
