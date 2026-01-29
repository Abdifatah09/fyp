const router = require("express").Router();
const { requireAuth } = require('../middleware/authMiddleware');
const challengeAttemptController = require("../controllers/challengeAttemptController");

router.post("/submit", requireAuth, challengeAttemptController.submitAttempt);
router.get("/me", requireAuth, challengeAttemptController.getMyAttempts);

module.exports = router;
