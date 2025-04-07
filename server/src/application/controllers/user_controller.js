const { AppError, ErrorMap } = require("../../interfaces/error");
const Logger = require("../../infrastructure/common/logger");

const UserRegisterUseCase = require("../usecase/user_case/user_register");
const UserLoginUseCase = require("../usecase/user_case/user_login");
const UserUpdateUseCase = require("../usecase/user_case/user_update");
const UserOkrFocusUseCase = require("../usecase/user_case/user_okr_focus");

const moduleName = "user_controller.js";

// 用户相关
class UserController {
  static async userEvent(ctx, logId, data) {
    try {
      const event = data.event;

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

        // 用户更新专注目标
        case "setUserOkrFocus":
          Logger.info(logId, moduleName, Logger.status.START, data);
          const setRes = await UserOkrFocusUseCase.do(logId, data);
          ctx.status = 200;
          ctx.body = setRes;
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

module.exports = UserController;
