/**
 * 1xxx：通用错误
 * 2xxx：用户相关错误
 * 3xxx：业务相关错误
 * 4xxx：文件相关错误
 * 5xxx：系统错误
 * 6xxx：第三方服务错误
 */

module.exports = {
  // 通用错误
  COMMON: {
    INVALID_PARAMS: {
      code: 1001,
      message: "Invalid parameters", // 参数校验失败
    },
    PERMISSION_DENIED: {
      code: 1002,
      message: "Permission denied", // 权限不足
    },
    REQUEST_TIMEOUT: {
      code: 1003,
      message: "Request timeout", // 请求超时
    },
    INTERNAL_SERVER_ERROR: {
      code: 1004,
      message: "Internal server error", // 内部服务器错误
    },
    NOT_IMPLEMENTED: {
      code: 1005,
      message: "Not implemented", // 功能未实现
    },
    BAD_REQUEST: {
      code: 1006,
      message: "Bad request", // 错误的请求
    },
    SERVICE_UNAVAILABLE: {
      code: 1007,
      message: "Service unavailable", // 服务不可用
    },
  },

  // 用户相关错误
  USER: {
    NOT_FOUND: {
      code: 2001,
      message: "User not found", // 用户不存在
    },
    AUTH_FAILED: {
      code: 2002,
      message: "Authentication failed", // 认证失败
    },
    USER_EXISTS: {
      code: 2003,
      message: "User already exists", // 用户已存在
    },
    PASSWORD_WEAK: {
      code: 2004,
      message: "Password too weak", // 密码太弱
    },
    ACCOUNT_DISABLED: {
      code: 2005,
      message: "Account disabled", // 账户被禁用
    },
    EMAIL_NOT_VERIFIED: {
      code: 2006,
      message: "Email not verified", // 邮箱未验证
    },
  },

  // 业务相关错误
  BUSINESS: {},

  // 文件相关错误
  FILE: {
    UPLOAD_FAILED: {
      code: 4001,
      message: "File upload failed", // 文件上传失败
    },
    FILE_TOO_LARGE: {
      code: 4002,
      message: "File too large", // 文件太大
    },
    INVALID_FILE_TYPE: {
      code: 4003,
      message: "Invalid file type", // 文件类型无效
    },
    FILE_NOT_FOUND: {
      code: 4004,
      message: "File not found", // 文件未找到
    },
  },

  // 系统错误
  SYSTEM: {
    DB_CONN_FAILED: {
      code: 5001,
      message: "Database connection failed", // 数据库连接失败
    },
    CACHE_ERROR: {
      code: 5002,
      message: "Cache error", // 缓存错误
    },
    CONFIG_ERROR: {
      code: 5003,
      message: "Configuration error", // 配置错误
    },
    NETWORK_ERROR: {
      code: 5004,
      message: "Network error", // 网络错误
    },
    DISK_FULL: {
      code: 5005,
      message: "Disk full", // 磁盘已满
    },
    UNKNOWN_ERROR: {
      code: 5006,
      message: "Unknown error", // 未知错误
    },
  },

  // 第三方服务错误
  THIRD_PARTY: {
    SERVICE_DOWN: {
      code: 6001,
      message: "Third-party service down", // 第三方服务宕机
    },
    API_LIMIT_REACHED: {
      code: 6002,
      message: "API limit reached", // API限制达到
    },
    INVALID_RESPONSE: {
      code: 6003,
      message: "Invalid response", // 无效的响应
    },
  },
};
