const router = require("express").Router();
const { requireAuth } = require('../middleware/authMiddleware');
const progressController = require("../controllers/progressController");

router.get("/me", requireAuth, progressController.getMyProgress);

router.get("/me/by-challenge", requireAuth, progressController.getMyProgressByChallenge);

router.get("/me/sections", requireAuth, progressController.getProgressBySection);
router.get("/me/sections/:sectionId", requireAuth, progressController.getSectionDetail);

router.get("/me/difficulties", requireAuth, progressController.getProgressByDifficulty); 
router.get("/me/difficulties/:difficultyId", requireAuth, progressController.getDifficultyDetail);

router.get("/me/subjects", requireAuth, progressController.getProgressBySubject);
router.get("/me/subjects/:subjectId", requireAuth, progressController.getSubjectDetail);


module.exports = router;
