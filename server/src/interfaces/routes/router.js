const Router = require("koa-router");
const router = new Router();

const webRouter = require("./web_router");
const mobileRouter = require("./moble_router");

router.use("/web", webRouter.routes(), webRouter.allowedMethods());
router.use("/mobile", mobileRouter.routes(), mobileRouter.allowedMethods());

module.exports = router;
