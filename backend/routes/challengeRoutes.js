const router = require("express").Router();
const challengeController = require("../controllers/challengeController");
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

router.post("/", requireAuth, requireAdmin, challengeController.createChallenge);
router.put("/:id", requireAuth, requireAdmin,challengeController.updateChallenge);
router.delete("/:id", requireAuth, requireAdmin,challengeController.deleteChallenge);

router.get("/", challengeController.getChallenges);
router.get("/:id", challengeController.getChallengeById);
router.get("/section/:sectionId", challengeController.getChallengesBySectionId);

module.exports = router;
