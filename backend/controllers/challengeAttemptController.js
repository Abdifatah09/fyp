const ChallengeAttempt = require("../models/challengeAttempt");

exports.getMyAttempts = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { challengeId, page = 1, limit = 10 } = req.query;

    const where = { userId };
    if (challengeId) where.challengeId = challengeId;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const offset = (pageNum - 1) * limitNum;

    const { count, rows } = await ChallengeAttempt.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit: limitNum,
      offset,
    });

    return res.json({
      data: rows,
      meta: {
        total: count,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(count / limitNum),
      },
    });
  } catch (err) {
    console.error("getMyAttempts error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getAttemptById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const attempt = await ChallengeAttempt.findOne({ where: { id, userId } });
    if (!attempt) return res.status(404).json({ message: "Attempt not found" });

    return res.json(attempt);
  } catch (err) {
    console.error("getAttemptById error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
