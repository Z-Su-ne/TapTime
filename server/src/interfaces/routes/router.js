const Router = require("koa-router");
const router = new Router();

const mobileRouter = require("./mobile_router");
const esp32Router = require("./esp32_router");

router.use("/mobile", mobileRouter.routes(), mobileRouter.allowedMethods());
router.use("/esp32", esp32Router.routes(), esp32Router.allowedMethods());
module.exports = router;
