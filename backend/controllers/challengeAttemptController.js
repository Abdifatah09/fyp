const Challenge = require("../models/challenge");
const ChallengeAttempt = require("../models/challengeAttempt");

exports.submitAttempt = async (req, res) => {
  try {

    const userId = req.user.userId;
    const { challengeId, submittedCode } = req.body;

    if (!challengeId || !submittedCode) {
      return res.status(400).json({ message: "challengeId and submittedCode are required" });
    }

    const challenge = await Challenge.findByPk(challengeId);
    if (!challenge) return res.status(404).json({ message: "Challenge not found" });

    const normalize = (s) => (s || "").trim().replace(/\r\n/g, "\n");
    const isCorrect = normalize(submittedCode) === normalize(challenge.solution);

    const attempt = await ChallengeAttempt.create({
      userId,
      challengeId,
      submittedCode,
      isCorrect,
      feedback: isCorrect ? "Correct ✅" : "Incorrect ❌ (grading is basic for now)",
    });

    return res.status(201).json({
      message: "Attempt submitted",
      attempt,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getMyAttempts = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { challengeId, page = 1, limit = 10 } = req.query;

    const where = { userId };
    if (challengeId) where.challengeId = challengeId;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100); 0
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
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};


exports.getAttemptById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const attempt = await ChallengeAttempt.findOne({
      where: { id, userId }, 
    });

    if (!attempt) return res.status(404).json({ message: "Attempt not found" });

    return res.json(attempt);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

