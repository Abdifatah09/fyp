const router = require("express").Router();
const { Achievement, UserAchievement } = require("../models");
const { requireAuth } = require('../middleware/authMiddleware');

router.get("/me", requireAuth, async (req, res) => {
  const userId = req.user.userId;

  const earned = await UserAchievement.findAll({
    where: { userId },
    include: [
      {
        model: Achievement,
        as: "achievement",
        required: true, // ✅ only return rows where achievement exists
      },
    ],
    order: [["earnedAt", "DESC"]],
  });

  res.json(
    earned.map((e) => ({
      earnedAt: e.earnedAt,
      ...e.achievement.toJSON(),
    }))
  );
});

module.exports = router;