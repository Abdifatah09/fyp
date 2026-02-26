const { Op, fn, col, literal } = require("sequelize");
const { User, ChallengeAttempt, Challenge, Section, Difficulty, Subject } = require("../models");

function startDateFromDays(days) {
  const d = new Date();
  d.setDate(d.getDate() - (Number(days) || 30));
  d.setHours(0, 0, 0, 0);
  return d;
}

exports.getOverview = async (req, res) => {
  try {
    const days = Number(req.query.days || 30);
    const since = startDateFromDays(days);

    const newUsers = await User.count({
      where: { createdAt: { [Op.gte]: since } },
    });

    const attemptsTotal = await ChallengeAttempt.count({
      where: { createdAt: { [Op.gte]: since } },
    });

    const correctTotal = await ChallengeAttempt.count({
      where: { createdAt: { [Op.gte]: since }, isCorrect: true },
    });

    const activeUsers = await ChallengeAttempt.count({
      where: { createdAt: { [Op.gte]: since } },
      distinct: true,
      col: "userId",
    });

    const completedPairs = await ChallengeAttempt.findAll({
      where: { createdAt: { [Op.gte]: since }, isCorrect: true },
      attributes: [
        [literal(`COUNT(DISTINCT ("ChallengeAttempt"."userId","ChallengeAttempt"."challengeId"))`), "completedUnique"],
      ],
      raw: true,
    });

    const completedUnique = Number(completedPairs?.[0]?.completedUnique || 0);

    const accuracy = attemptsTotal === 0 ? 0 : Math.round((correctTotal / attemptsTotal) * 100);

    return res.json({
      range: { days, since },
      kpis: {
        newUsers,
        activeUsers,
        attemptsTotal,
        correctTotal,
        accuracy,
        completedUnique,
      },
    });
  } catch (err) {
    console.error("getOverview error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getDailyAttempts = async (req, res) => {
  try {
    const days = Number(req.query.days || 30);
    const since = startDateFromDays(days);

    const rows = await ChallengeAttempt.findAll({
      where: { createdAt: { [Op.gte]: since } },
      attributes: [
        [fn("date_trunc", "day", col("createdAt")), "day"],
        [fn("COUNT", col("id")), "attempts"],
        [fn("SUM", literal(`CASE WHEN "isCorrect" = true THEN 1 ELSE 0 END`)), "correct"],
        [fn("COUNT", literal(`DISTINCT "userId"`)), "activeUsers"],
      ],
      group: [literal(`date_trunc('day',"createdAt")`)],
      order: [[literal(`date_trunc('day',"createdAt")`), "ASC"]],
      raw: true,
    });

    const data = rows.map((r) => ({
      day: new Date(r.day).toISOString().slice(0, 10),
      attempts: Number(r.attempts || 0),
      correct: Number(r.correct || 0),
      activeUsers: Number(r.activeUsers || 0),
    }));

    return res.json({ range: { days, since }, data });
  } catch (err) {
    console.error("getDailyAttempts error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getCompletionsBySubjectDifficulty = async (req, res) => {
  try {
    const days = Number(req.query.days || 30);
    const since = startDateFromDays(days);

    const rows = await ChallengeAttempt.findAll({
      where: { createdAt: { [Op.gte]: since }, isCorrect: true },
      include: [
        {
          model: Challenge,
          as: "challenge",
          attributes: [],
          include: [
            {
              model: Section,
              as: "section",
              attributes: [],
              include: [
                {
                  model: Difficulty,
                  as: "difficulty",
                  attributes: [],
                  include: [{ model: Subject, as: "subject", attributes: [] }],
                },
              ],
            },
          ],
        },
      ],
      attributes: [
        [col(`challenge.section.difficulty.subject.id`), "subjectId"],
        [col(`challenge.section.difficulty.subject.name`), "subjectName"],
        [col(`challenge.section.difficulty.id`), "difficultyId"],
        [col(`challenge.section.difficulty.name`), "difficultyName"],
        [literal(`COUNT(DISTINCT ("ChallengeAttempt"."userId","ChallengeAttempt"."challengeId"))`), "completedUnique"],
      ],
      group: [
        col(`challenge.section.difficulty.subject.id`),
        col(`challenge.section.difficulty.subject.name`),
        col(`challenge.section.difficulty.id`),
        col(`challenge.section.difficulty.name`),
      ],
      order: [
        [col(`challenge.section.difficulty.subject.name`), "ASC"],
        [col(`challenge.section.difficulty.name`), "ASC"],
      ],
      raw: true,
    });

    return res.json({ range: { days, since }, data: rows });
  } catch (err) {
    console.error("getCompletionsBySubjectDifficulty error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getHardestChallenges = async (req, res) => {
  try {
    const days = Number(req.query.days || 30);
    const since = startDateFromDays(days);
    const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 50);

    const rows = await ChallengeAttempt.findAll({
      where: { createdAt: { [Op.gte]: since } },
      include: [{ model: Challenge, as: "challenge", attributes: ["id", "title"] }],
      attributes: [
        "challengeId",
        [fn("COUNT", col("ChallengeAttempt.id")), "attempts"],
        [fn("SUM", literal(`CASE WHEN "isCorrect" = true THEN 1 ELSE 0 END`)), "correct"],
      ],
      group: ["challengeId", "challenge.id", "challenge.title"],
      raw: true,
    });

    const computed = rows
      .map((r) => {
        const attempts = Number(r.attempts || 0);
        const correct = Number(r.correct || 0);
        const accuracy = attempts === 0 ? 0 : Math.round((correct / attempts) * 100);
        return {
          challengeId: r.challengeId,
          title: r["challenge.title"],
          attempts,
          correct,
          accuracy,
        };
      })
      .filter((x) => x.attempts >= 5) 
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, limit);

    return res.json({ range: { days, since }, data: computed });
  } catch (err) {
    console.error("getHardestChallenges error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getAvgAttemptsUntilSuccess = async (req, res) => {
  try {
    const days = Number(req.query.days || 30);
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { sequelize } = require("../models");

    const result = await sequelize.query(`
      WITH first_success AS (
        SELECT
          "userId",
          "challengeId",
          MIN("createdAt") AS first_correct_time
        FROM "challenge_attempts"
        WHERE "isCorrect" = true
          AND "createdAt" >= :since
        GROUP BY "userId", "challengeId"
      )
      SELECT AVG(attempt_count) AS "avgAttempts"
      FROM (
        SELECT
          fs."userId",
          fs."challengeId",
          COUNT(ca.id) AS attempt_count
        FROM first_success fs
        JOIN "challenge_attempts" ca
          ON ca."userId" = fs."userId"
          AND ca."challengeId" = fs."challengeId"
          AND ca."createdAt" <= fs.first_correct_time
        GROUP BY fs."userId", fs."challengeId"
      ) sub;
    `, {
      replacements: { since },
      type: sequelize.QueryTypes.SELECT,
    });

    return res.json({
      rangeDays: days,
      avgAttemptsUntilSuccess: Number(result[0]?.avgAttempts || 0)
    });

  } catch (err) {
    console.error("avg attempts error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getAvgTimeToComplete = async (req, res) => {
  try {
    const days = Number(req.query.days || 30);
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { sequelize } = require("../models");

    const result = await sequelize.query(`
      WITH first_attempt AS (
        SELECT
          "userId",
          "challengeId",
          MIN("createdAt") AS first_attempt_time
        FROM "challenge_attempts"
        WHERE "createdAt" >= :since
        GROUP BY "userId", "challengeId"
      ),
      first_success AS (
        SELECT
          "userId",
          "challengeId",
          MIN("createdAt") AS first_correct_time
        FROM "challenge_attempts"
        WHERE "isCorrect" = true
          AND "createdAt" >= :since
        GROUP BY "userId", "challengeId"
      )
      SELECT AVG(EXTRACT(EPOCH FROM (fs.first_correct_time - fa.first_attempt_time))) AS "avgSeconds"
      FROM first_attempt fa
      JOIN first_success fs
        ON fa."userId" = fs."userId"
        AND fa."challengeId" = fs."challengeId";
    `, {
      replacements: { since },
      type: sequelize.QueryTypes.SELECT,
    });

    const avgSeconds = Number(result[0]?.avgSeconds || 0);

    return res.json({
      rangeDays: days,
      avgSeconds,
      avgMinutes: avgSeconds / 60
    });

  } catch (err) {
    console.error("avg time error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};