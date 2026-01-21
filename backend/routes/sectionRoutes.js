const router = require("express").Router();
const sectionController = require("../controllers/sectionController");
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

router.post("/",  requireAuth,requireAdmin, sectionController.createSection);
router.put("/:id", requireAuth, requireAdmin, sectionController.updateSection);
router.delete("/:id", requireAuth, requireAdmin,  sectionController.deleteSection);

router.get("/", requireAuth, sectionController.getSections);
router.get("/:id", requireAuth, sectionController.getSectionById);
router.get("/difficulty/:difficultyId", requireAuth, sectionController.getSectionsByDifficultyId);

module.exports = router;
