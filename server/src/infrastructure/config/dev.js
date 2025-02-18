const config = {
  // koa运行端口
  server_port: 3000,

  // 数据库配置
  database: {
    host: "localhost",
    port: 3306,
    database_name: "taptime",
    user: "root",
    password: "admin",
    charset: "utf8mb4",
    use_unicode: true,
  },
};

module.exports = config;
