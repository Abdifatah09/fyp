const router = require("express").Router();
const { requireAuth } = require("../middleware/authMiddleware");
const badgeController = require("../controllers/badgeController");

router.get("/me", requireAuth, badgeController.me);

router.get("/", badgeController.list);

module.exports = router;