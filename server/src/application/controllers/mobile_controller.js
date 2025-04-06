const { AppError, ErrorMap } = require("../../interfaces/error");
const Logger = require("../../infrastructure/common/logger");

const UserRegisterUseCase = require("../usecase/user_register");
const UserLoginUseCase = require("../usecase/user_login");
const UserUpdateUseCase = require("../usecase/user_update");

const moduleName = "mobile_controller.js";

class MobileController {
  static async userEvent(ctx, logId, data) {
    try {
      const type = data.type;
      const event = data.event;

      // 用户相关
      if (type == "user") {
        switch (event) {
          // 用户注册
          case "register":
            Logger.info(logId, moduleName, Logger.status.START, data);
            const registerRes = await UserRegisterUseCase.do(logId, data);
            ctx.status = 200;
            ctx.body = registerRes;
            break;

          // 用户登录
          case "login":
            Logger.info(logId, moduleName, Logger.status.START, data);
            const loginRes = await UserLoginUseCase.do(logId, data);
            ctx.status = 200;
            ctx.body = loginRes;
            break;

          // 用户更新
          case "update":
            Logger.info(logId, moduleName, Logger.status.START, data);
            const updateRes = await UserUpdateUseCase.do(logId, data);
            ctx.status = 200;
            ctx.body = updateRes;
            break;

          default:
            ctx.status = 400;
            break;
        }
      }

      Logger.info(logId, moduleName, Logger.status.END, data);
    } catch (error) {
      Logger.error(logId, moduleName, Logger.status.ERROR, error);
      ctx.status = 201;
    }
  }
}

module.exports = MobileController;
