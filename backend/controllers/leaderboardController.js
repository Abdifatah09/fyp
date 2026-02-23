const { User, UserStats } = require("../models");

exports.global = async (req, res) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit || "20", 10), 1), 100);

  const rows = await User.findAll({
    attributes: ["id", "name", "email"],
    include: [
      {
        model: UserStats,
        as: "stats",
        attributes: ["xp", "level", "streakCount", "rank"],
        required: true,
      },
    ],
    order: [
      [{ model: UserStats, as: "stats" }, "xp", "DESC"],
      [{ model: UserStats, as: "stats" }, "level", "DESC"],
      ["name", "ASC"],
    ],
    limit,
  });

  res.json(
    rows.map((u) => ({
      id: u.id,
      name: u.name,
      xp: u.stats.xp,
      level: u.stats.level,
      rank: u.stats.rank,
      streakCount: u.stats.streakCount,
    }))
  );
};
