const router = require("express").Router();
const difficultyController = require("../controllers/difficultyController");
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

router.post("/", requireAuth, requireAdmin, difficultyController.createDifficulty);
router.get("/", requireAuth,  difficultyController.getDifficulties);
router.get("/:id", requireAuth,  difficultyController.getDifficultyById);
router.delete("/:id", requireAuth, requireAdmin, difficultyController.deleteDifficulty);

module.exports = router;
