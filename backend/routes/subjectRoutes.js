const router = require("express").Router();
const subjectController = require("../controllers/subjectController");
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

router.post("/", requireAuth, requireAdmin, subjectController.createSubject);
router.put("/:id", requireAuth, requireAdmin, subjectController.updateSubject);
router.delete("/:id", requireAuth, requireAdmin, subjectController.deleteSubject);

router.get("/", requireAuth, subjectController.getSubjects);
router.get("/:id", requireAuth, subjectController.getSubjectById);


module.exports = router;
