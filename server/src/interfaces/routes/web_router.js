const Router = require("koa-router");
const webRouter = new Router();

// 定义/web下的路由
webRouter.get("/", (ctx) => {
  ctx.body = "Welcome to the Web version!";
});

webRouter.get("/about", (ctx) => {
  ctx.body = "About the Web version";
});

module.exports = webRouter;
