const { UserStats, User } = require("../models");
const { applyLevelUps } = require("../utils/gamification");

exports.me = async (req, res) => {
  const userId = req.user.userId;

  let stats = await UserStats.findOne({ where: { userId } });
  if (!stats) stats = await UserStats.create({ userId });

  const leveled = applyLevelUps({ xp: stats.xp, level: stats.level });

  return res.json({
    xp: stats.xp,
    level: stats.level,
    streakCount: stats.streakCount,
    rank: stats.rank,
    lastActiveDate: stats.lastActiveDate,
    nextLevelXp: leveled.nextLevelXp,
  });
};
