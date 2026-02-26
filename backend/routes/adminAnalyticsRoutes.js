const router = require("express").Router();
const adminAnalyticsController = require("../controllers/adminAnalyticsController");
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

router.get("/overview", requireAuth, requireAdmin, adminAnalyticsController.getOverview);
router.get("/daily-attempts", requireAuth, requireAdmin, adminAnalyticsController.getDailyAttempts);
router.get("/completions-by-subject-difficulty", requireAuth, requireAdmin, adminAnalyticsController.getCompletionsBySubjectDifficulty);
router.get("/hardest-challenges", requireAuth, requireAdmin, adminAnalyticsController.getHardestChallenges);
router.get("/avg-attempts-until-success", requireAuth, requireAdmin, adminAnalyticsController.getAvgAttemptsUntilSuccess);
router.get("/avg-time-to-complete", requireAuth, requireAdmin, adminAnalyticsController.getAvgTimeToComplete);

module.exports = router;