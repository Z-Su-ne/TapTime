const { AppError, ErrorMap } = require("../../../interfaces/error");
const Logger = require("../../../infrastructure/common/logger");
const Util = require("../../../infrastructure/common/util");

const UsersEntity = require("../../../domain/entity/users_entity");
const UsersRepo = require("../../../domain/repo/users_repo");
const FocusEntity = require("../../../domain/entity/focus_log_entity");
const FocusRepo = require("../../../domain/repo/focus_log_repo");

const moduleName = "esp32_do.js";

// 用户状态存储
const userStates = new Map();

class Esp32UseCase {
  static async do(logId, data) {
    try {
      Logger.info(logId, moduleName, Logger.status.START, undefined);

      if (!userStates.has(data.userId)) {
        userStates.set(data.userId, {
          timekeeper: "STOP",
          startTime: null,
          rotationStart: null, // 旋转开始时间
          currentState: "IDLE",
        });
      }

      const userState = userStates.get(data.userId);
      const features = this.extractFeatures(data.samples);
      const now = Date.now();

      // 旋转检测与状态转换逻辑
      if (features.rotationDetected) {
        switch (userState.currentState) {
          case "IDLE":
            userState.currentState = "ROTATING";
            userState.rotationStart = now;
            break;
          case "ROTATING":
            // 持续3秒旋转
            if (now - userState.rotationStart >= 3000) {
              // 切换状态并记录时间
              if (userState.timekeeper === "STOP") {
                userState.timekeeper = "START";
                userState.startTime = now;
                Logger.info(logId, moduleName, "TapTime Started", {
                  userId: data.userId,
                  startTime: new Date(now).toISOString(),
                });
              } else {
                // 转换为分钟
                const duration = (now - userState.startTime) / 1000 / 60;
                Logger.info(logId, moduleName, "TapTime Stopped", {
                  userId: data.userId,
                  startTime: new Date(userState.startTime).toISOString(),
                  endTime: new Date(now).toISOString(),
                  durationMinutes: duration.toFixed(2),
                });
                userState.timekeeper = "STOP";

                const okrFocus = (await new UsersRepo().select(logId, new UsersEntity({ uuid: data.userId })))[0].okrFocus;
                // UTC+8
                const convertToBeijingTime = (date) => {
                  const utcHours = date.getUTCHours();
                  const beijingHours = (utcHours + 8) % 24;
                  return {
                    hours: beijingHours.toString().padStart(2, "0"),
                    minutes: date.getUTCMinutes().toString().padStart(2, "0"),
                  };
                };
                // 格式化开始和结束时间
                const start = new Date(userState.startTime);
                const { hours: startH, minutes: startM } = convertToBeijingTime(start);
                const timeStart = `${startH}:${startM}`;
                const end = new Date(now);
                const { hours: endH, minutes: endM } = convertToBeijingTime(end);
                const timeEnd = `${endH}:${endM}`;
                const addData = {
                  uuid: Util.uuid(),
                  objectiveId: okrFocus,
                  timeStart: timeStart,
                  timeEnd: timeEnd,
                  times: Math.round(duration) + 1,
                  isdel: 0,
                };
                // 自动记录专注日志
                const addRes = await new FocusRepo().insert(logId, new FocusEntity(addData), "uuid");
                Logger.info(logId, moduleName, "Focus Add.", { addRes });
              }
              // 重置状态
              userState.currentState = "IDLE";
              userState.rotationStart = null;
            }
            break;
        }
      } else {
        userState.currentState = "IDLE";
        userState.rotationStart = null;
      }

      const res = {
        msg: userState.timekeeper === "STOP" ? "Hello TapTime" : "TapTime Keeping",
        timekeeper: userState.timekeeper,
        date: new Date(),
      };

      Logger.info(logId, moduleName, Logger.status.END, { res });
      return res;
    } catch (error) {
      Logger.error(logId, moduleName, "Esp32UseCase failed", error);
      return {
        msg: "error",
        timekeeper: "STOP",
        date: new Date(),
      };
    }
  }

  // 特征提取（专注旋转检测，绕Z轴旋转）
  static extractFeatures(samples) {
    const gyroZ = samples.map((s) => Math.abs(s.gyro.z));

    return {
      // 持续3秒（50样本中30次超过阈值）
      rotationDetected:
        gyroZ.some((v) => v > 2.5) && // 瞬时角速度阈值
        gyroZ.filter((v) => v > 1.8).length >= 30,
      maxRotation: Math.max(...gyroZ),
      meanRotation: gyroZ.reduce((a, b) => a + b) / gyroZ.length,
    };
  }
}

module.exports = Esp32UseCase;
