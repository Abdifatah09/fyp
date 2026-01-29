const router = require("express").Router();
const { requireAuth } = require('../middleware/authMiddleware');
const progressController = require("../controllers/progressController");

router.get("/me", requireAuth, progressController.getMyProgress);

module.exports = router;
