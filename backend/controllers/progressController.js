const ChallengeAttempt = require("../models/challengeAttempt");

exports.getMyProgress = async (req, res) => {
  try {
    const userId = req.user.userId;

    const attempts = await ChallengeAttempt.findAll({ where: { userId } });

    const totalAttempts = attempts.length;
    const totalCorrect = attempts.filter((a) => a.isCorrect).length;

    const completedSet = new Set(
      attempts.filter((a) => a.isCorrect).map((a) => a.challengeId)
    );

    return res.json({
      totalAttempts,
      totalCorrect,
      completedChallenges: completedSet.size,
      completedChallengeIds: Array.from(completedSet),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
