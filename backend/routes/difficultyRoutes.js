const router = require("express").Router();
const difficultyController = require("../controllers/difficultyController");
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

router.post("/", requireAuth, requireAdmin, difficultyController.createDifficulty);
router.get("/", requireAuth, requireAdmin, difficultyController.getDifficulties);
router.get("/:id", requireAuth, requireAdmin, difficultyController.getDifficultyById);
router.delete("/:id", requireAuth, requireAdmin, difficultyController.deleteDifficulty);

module.exports = router;
