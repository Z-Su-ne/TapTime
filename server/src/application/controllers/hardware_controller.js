const { AppError, ErrorMap } = require("../../interfaces/error");
const Logger = require("../../infrastructure/common/logger");

const Esp32UseCase = require("../usecase/hardware_case/esp32_do");

const moduleName = "hardware_controller.js";

// 主页和其他服务相关
class HardwareController {
  static async event(ctx, logId, data) {
    try {
      Logger.info(logId, moduleName, Logger.status.START, undefined);
      const res = await Esp32UseCase.do(logId, data);

      ctx.status = 200;
      ctx.body = res;

      Logger.info(logId, moduleName, Logger.status.END, { res: ctx.body });
    } catch (error) {
      Logger.error(logId, moduleName, Logger.status.ERROR, error);
      ctx.status = 200;
      ctx.body = {
        msg: "error",
        timekeeper: "STOP",
        date: new Date(),
      };
    }
  }
}

module.exports = HardwareController;
