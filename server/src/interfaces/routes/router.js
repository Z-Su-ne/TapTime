const Router = require("koa-router");
const router = new Router();

const mobileRouter = require("./mobile_router");

router.use("/mobile", mobileRouter.routes(), mobileRouter.allowedMethods());

module.exports = router;
