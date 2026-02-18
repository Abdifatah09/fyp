const router = require("express").Router();
const { requireAuth } = require("../middleware/authMiddleware");
const leaderboardController = require("../controllers/leaderboardController");

router.get("/", requireAuth, leaderboardController.global);

module.exports = router;
