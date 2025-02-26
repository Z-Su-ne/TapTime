const config = {
  // koa运行端口
  server_port: 3000,

  // 数据库配置
  database: {
    // 主数据库
    main: {
      client: "mysql2",
      connection: {
        host: "localhost",
        port: 3306,
        user: "test",
        password: "admin",
        charset: "utf8mb4",
        use_unicode: true,
      },
    },
  },
};

module.exports = config;
