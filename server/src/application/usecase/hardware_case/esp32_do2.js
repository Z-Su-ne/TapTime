const { AppError, ErrorMap } = require("../../../interfaces/error");
const Logger = require("../../../infrastructure/common/logger");

const moduleName = "esp32_do.js";

// 用户状态存储（内存存储，生产环境建议改用Redis）
const userStates = new Map();

class Esp32UseCase {
  static async do(logId, data) {
    try {
      Logger.info(logId, moduleName, Logger.status.START, undefined);

      // 数据校验
      if (!data.userId || !data.samples || !Array.isArray(data.samples)) {
        throw new AppError(ErrorMap.COMMON.BAD_REQUEST);
      }

      // 初始化用户状态（首次强制为STOP）
      if (!userStates.has(data.userId)) {
        userStates.set(data.userId, {
          timekeeper: "STOP",
          startTime: null,
          lastTriggerTime: null,
          currentState: "VERTICAL", // 新增状态机
          stage: 0, // 动作阶段计数器
        });
      }

      const userState = userStates.get(data.userId);
      const features = this.extractFeatures(data.samples);
      const now = Date.now();

      // 状态机处理（基于运动监控专利[[3]]）
      switch (userState.currentState) {
        case "VERTICAL":
          if (this.detectVerticalToHorizontal(features)) {
            userState.currentState = "HORIZONTAL";
            userState.stage++;
          }
          break;

        case "HORIZONTAL":
          if (this.detectHorizontalToChest(features)) {
            userState.currentState = "CHEST";
            userState.stage++;
          }
          break;

        case "CHEST":
          if (this.detectChestToVertical(features)) {
            // 完成完整动作周期
            if (userState.timekeeper === "STOP") {
              userState.timekeeper = "START";
              userState.startTime = now;
              Logger.info(logId, moduleName, "TapTime Started", { userId: data.userId });
            } else {
              const duration = now - userState.startTime;
              userState.timekeeper = "STOP";
              Logger.info(logId, moduleName, "TapTime Stopped", {
                userId: data.userId,
                duration,
                features: features,
              });
            }
            // 重置状态机
            userState.currentState = "VERTICAL";
            userState.stage = 0;
            userState.lastTriggerTime = now;
          }
          break;
      }

      // 防抖机制（5秒内禁止重复触发）[[2]]
      if (userState.lastTriggerTime && now - userState.lastTriggerTime < 5000) {
        userState.currentState = "VERTICAL"; // 强制重置
        userState.stage = 0;
      }

      // 构造响应
      const res = {
        msg: userState.timekeeper === "START" ? "Hello TapTime" : "TapTime Keeping",
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

  // 特征提取（多维度分析）[[3]][[6]]
  static extractFeatures(samples) {
    const accelX = samples.map((s) => s.accel.x);
    const accelY = samples.map((s) => s.accel.y);
    const accelZ = samples.map((s) => s.accel.z);
    const gyroX = samples.map((s) => s.gyro.x);
    const gyroY = samples.map((s) => s.gyro.y);
    const gyroZ = samples.map((s) => s.gyro.z);

    return {
      // 加速度特征
      accel: {
        maxZ: Math.max(...accelZ),
        meanZ: accelZ.reduce((a, b) => a + b) / accelZ.length,
        stdZ: this.standardDeviation(accelZ),
        energy: Math.sqrt(accelX.map((v) => v ** 2).reduce((a, b) => a + b)) / accelX.length,
      },
      // 陀螺仪特征
      gyro: {
        pitchEnergy: Math.sqrt(gyroY.map((v) => v ** 2).reduce((a, b) => a + b)) / gyroY.length,
        rollStd: this.standardDeviation(gyroX),
      },
    };
  }

  // 状态转换检测（基于专利方法[[3]]）
  static detectVerticalToHorizontal(features) {
    return (
      features.accel.meanZ > 0.9 && // 垂直方向重力分量
      features.accel.stdZ < 0.1 && // 稳定状态
      features.gyro.pitchEnergy < 0.3 // 无明显旋转
    );
  }

  static detectHorizontalToChest(features) {
    return (
      features.accel.meanZ < 0.6 && // 脱离垂直
      features.accel.energy > 0.7 && // 显著前向运动
      features.gyro.rollStd < 0.2 // 侧向稳定
    );
  }

  static detectChestToVertical(features) {
    return (
      features.accel.meanZ > 0.8 && // 重力方向恢复
      features.accel.stdZ > 0.25 && // 明显波动（回弹动作）
      features.gyro.pitchEnergy > 1.0 // 快速旋转
    );
  }

  static standardDeviation(values) {
    const mean = values.reduce((a, b) => a + b) / values.length;
    return Math.sqrt(values.map((v) => (v - mean) ** 2).reduce((a, b) => a + b) / values.length);
  }
}

module.exports = Esp32UseCase;
