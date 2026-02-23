const { Op } = require("sequelize");
const { Badge, UserBadge, ChallengeAttempt, UserStats } = require("../models");

async function countCompletedChallenges(userId) {

  const rows = await ChallengeAttempt.findAll({
    where: { userId, isCorrect: true },
    attributes: ["challengeId"],
    group: ["challengeId"],
  });
  return rows.length;
}


async function countPerfectSolves(userId) {
 
  const attempts = await ChallengeAttempt.findAll({
    where: { userId },
    attributes: ["challengeId", "isCorrect", "createdAt"],
    order: [["createdAt", "ASC"]],
  });

  const firstAttemptByChallenge = new Map();
  for (const a of attempts) {
    if (!firstAttemptByChallenge.has(a.challengeId)) {
      firstAttemptByChallenge.set(a.challengeId, !!a.isCorrect);
    }
  }

  let perfect = 0;
  for (const isFirstCorrect of firstAttemptByChallenge.values()) {
    if (isFirstCorrect) perfect += 1;
  }
  return perfect;
}

async function getUserValueForCondition(userId, conditionType) {
  if (conditionType === "CHALLENGES_COMPLETED") {
    return await countCompletedChallenges(userId);
  }

  if (conditionType === "PERFECT_SOLVES") {
    return await countPerfectSolves(userId);
  }

  if (conditionType === "STREAK_DAYS") {
    const stats = await UserStats.findOne({ where: { userId } });
    return stats?.streakCount || 0;
  }

  return 0;
}

exports.checkAndAwardBadges = async (userId) => {
  const allBadges = await Badge.findAll({ where: { isActive: true } });

  const already = await UserBadge.findAll({
    where: { userId },
    attributes: ["badgeId"],
  });
  const owned = new Set(already.map((x) => x.badgeId));

  const newlyEarned = [];
  let xpFromBadges = 0;

  let stats = await UserStats.findOne({ where: { userId } });
  if (!stats) stats = await UserStats.create({ userId });

  for (const badge of allBadges) {
    if (owned.has(badge.id)) continue;

    const value = await getUserValueForCondition(userId, badge.conditionType);
    if (value >= badge.conditionValue) {
      await UserBadge.create({
        userId,
        badgeId: badge.id,
      });

      newlyEarned.push(badge);

      const reward = Number(badge.xpReward || 0);
      if (reward > 0) {
        stats.xp += reward;
        xpFromBadges += reward;
      }
    }
  }

  if (xpFromBadges > 0) {
    await stats.save();
  }

  return {
    newlyEarned,
    xpFromBadges,
  };
};