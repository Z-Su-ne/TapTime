import { v4 as uuidv4 } from "uuid";

export default class Utils {
  // UUID
  generateUUID() {
    const uuid = uuidv4();
    return uuid;
  }

  // 空判断
  isEmpty(param) {
    try {
      if (param == null) {
        return true;
      }
      if (typeof param === "number" && isNaN(param)) {
        return true;
      }
      if (typeof param === "string" && param.trim() === "") {
        return true;
      }
      if (Array.isArray(param)) {
        const isEmptyArray = param.length === 0;
        return isEmptyArray;
      }
      if (typeof param === "object") {
        const isEmptyObject = Object.keys(param).length === 0;
        return isEmptyObject;
      }
      return false;
    } catch (error) {
      console.log("util error:", error);
      return false;
    }
  }

  // 转空,preservedFields为保留字段，格式为['uuid','uuid']
  toEmpty = (param, preservedFields = []) => {
    try {
      const result = { ...param };

      if (!Array.isArray(preservedFields)) {
        console.warn("preservedFields应为数组，已自动转为空数组");
        preservedFields = [];
      }

      Object.keys(result).forEach((key) => {
        if (!preservedFields.includes(key)) {
          result[key] = undefined;
        }
      });

      return result;
    } catch (error) {
      console.error("Util error:", error);
      return param;
    }
  };
}
