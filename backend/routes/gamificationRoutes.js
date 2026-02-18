const router = require("express").Router();
const { requireAuth } = require("../middleware/authMiddleware");
const gamificationController = require("../controllers/gamificationController");

router.get("/me", requireAuth, gamificationController.me);

module.exports = router;
