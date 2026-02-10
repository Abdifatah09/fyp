const router = require("express").Router();
const sectionController = require("../controllers/sectionController");
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

router.post("/",  requireAuth,requireAdmin, sectionController.createSection);
router.put("/:id", requireAuth, requireAdmin, sectionController.updateSection);
router.delete("/:id", requireAuth, requireAdmin,  sectionController.deleteSection);

router.get("/", sectionController.getSections);
router.get("/:id",  sectionController.getSectionById);
router.get("/difficulty/:difficultyId",  sectionController.getSectionsByDifficultyId);

module.exports = router;
