
const router = require("express").Router();
const { requireAuth } = require("../middleware/authMiddleware");
const subscriptionsController = require("../controllers/subscriptionsController");

router.post("/difficulty/:difficultyId", requireAuth, subscriptionsController.subscribe);
router.delete("/difficulty/:difficultyId", requireAuth, subscriptionsController.unsubscribe);
router.get("/mine", requireAuth, subscriptionsController.mine);

module.exports = router;
