const { Badge, UserBadge } = require("../models");

exports.me = async (req, res) => {
  const userId = req.user.userId;

  const earned = await UserBadge.findAll({
    where: { userId },
    include: [
      {
        model: Badge,
        as: "badge",
        required: true,
      },
    ],
    order: [["earnedAt", "DESC"]],
  });

  return res.json(
    earned.map((row) => ({
      earnedAt: row.earnedAt,
      ...row.badge.toJSON(),
    }))
  );
};
  
exports.list = async (req, res) => {
  const badges = await Badge.findAll({
    where: { isActive: true },
    order: [["createdAt", "ASC"]],
  });

  return res.json(badges);
};