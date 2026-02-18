const { Op } = require("sequelize");
const { Achievement, UserAchievement, ChallengeAttempt, UserStats } = require("../models");

async function getUserTotals(userId) {
  const totalSubmissions = await ChallengeAttempt.count({ where: { userId } });
  const totalCorrect = await ChallengeAttempt.count({ where: { userId, isCorrect: true } });

  const stats = await UserStats.findOne({ where: { userId } });
  const streakCount = stats?.streakCount || 0;
  const level = stats?.level || 1;

  return { totalSubmissions, totalCorrect, streakCount, level, stats };
}

function isAchievementMet(a, totals) {
  switch (a.conditionType) {
    case "TOTAL_CORRECT":
      return totals.totalCorrect >= a.conditionValue;
    case "TOTAL_SUBMISSIONS":
      return totals.totalSubmissions >= a.conditionValue;
    case "STREAK_AT_LEAST":
      return totals.streakCount >= a.conditionValue;
    case "LEVEL_AT_LEAST":
      return totals.level >= a.conditionValue;
    default:
      return false;
  }
}

async function checkAndAwardAchievements(userId) {
  const totals = await getUserTotals(userId);

  const all = await Achievement.findAll();
  if (!all.length) return { newlyEarned: [], xpFromAchievements: 0 };

  const owned = await UserAchievement.findAll({
    where: { userId },
    attributes: ["achievementId"],
  });

  const ownedSet = new Set(owned.map((x) => x.achievementId));

  const newlyEarned = [];
  let xpFromAchievements = 0;

  for (const a of all) {
    if (ownedSet.has(a.id)) continue;
    if (!isAchievementMet(a, totals)) continue;

    await UserAchievement.create({
      userId,
      achievementId: a.id,
      earnedAt: new Date(),
    });

    newlyEarned.push({
      id: a.id,
      key: a.key,
      name: a.name,
      description: a.description,
      icon: a.icon,
      xpReward: a.xpReward,
    });

    xpFromAchievements += a.xpReward;
  }

  if (xpFromAchievements > 0 && totals.stats) {
    totals.stats.xp += xpFromAchievements;
    await totals.stats.save();
  }

  return { newlyEarned, xpFromAchievements };
}

module.exports = { checkAndAwardAchievements };
