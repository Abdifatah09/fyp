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

    //  Sprint 3 simple evaluation:
    // Compare trimmed strings (temporary grading method).
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
    const { challengeId } = req.query;

    const where = { userId };
    if (challengeId) where.challengeId = challengeId;

    const attempts = await ChallengeAttempt.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });

    return res.json(attempts);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
