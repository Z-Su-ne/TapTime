const config = {
  // koa运行端口
  server_port: 3000,

  // 数据库配置
  database: {
    main: {
      client: "mysql",
      connection: {
        host: "localhost",
        port: 3306,
        username: "root",
        password: "admin",
        charset: "utf8mb4",
        use_unicode: true,
      },
    },
  },
};

module.exports = config;
