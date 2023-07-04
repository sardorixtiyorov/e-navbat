const { Router } = require("express");
const {
  addOtp,
  getOtp,
  updateOtp,
  deleteOtp,
  verifyOtp,
} = require("../controllers/otp.controller");

const router = Router();

router.post("/newotp", addOtp);
router.post("/verify", verifyOtp);
router.get("/", getOtp);
router.get("/:id", getOtp);
router.put("/:id", updateOtp);
router.delete("/:id", deleteOtp);

module.exports = router;
