const router = require("express").Router();
const { requireAuth } = require("../middleware/authMiddleware");
const judgeController = require("../controllers/judgeController");

router.post("/submit", requireAuth, judgeController.submit);

module.exports = router;
