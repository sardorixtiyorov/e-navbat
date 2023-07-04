const { Router } = require("express");

const router = Router();
const clientRouter = require("./client.routes");
const adminRouter = require("./admin.routes");
const otpRouter = require("./otp.routes");
const serviceRouter = require("./service.routes");
const socialRouter = require("./social.routes");

router.use("/client", clientRouter);
router.use("/admin", adminRouter);
router.use("/otp", otpRouter);
router.use("/service", serviceRouter);
router.use("/social", socialRouter);

module.exports = router;
