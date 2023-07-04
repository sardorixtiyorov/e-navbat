const { Router } = require("express");
const {
  addClient,
  getClient,
  updateClient,
  deleteClient,
} = require("../controllers/client.controller");

const router = Router();

router.post("/add", addClient);
router.get("/", getClient);
router.get("/:id", getClient);
router.put("/:id", updateClient);
router.delete("/:id", deleteClient);

module.exports = router;
