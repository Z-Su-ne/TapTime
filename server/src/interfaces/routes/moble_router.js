const Router = require("koa-router");
const mobileRouter = new Router();

// 定义/mobile下的路由
mobileRouter.post("/", (ctx) => {
  ctx.body = "Welcome to the Mobile version!";
});

mobileRouter.get("/about", (ctx) => {
  ctx.body = "About the Mobile version";
});

module.exports = mobileRouter;
