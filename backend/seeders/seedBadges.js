require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});

const { sequelize, Badge } = require("../models");

async function run() {
  await sequelize.authenticate();

  const badges = [
    {
      key: "first_win",
      name: "First Win",
      description: "Complete your first challenge.",
      icon: "trophy",
      xpReward: 25,
      conditionType: "CHALLENGES_COMPLETED",
      conditionValue: 1,
    },
    {
      key: "five_completed",
      name: "Getting Started",
      description: "Complete 5 challenges.",
      icon: "badge-check",
      xpReward: 50,
      conditionType: "CHALLENGES_COMPLETED",
      conditionValue: 5,
    },
    {
      key: "fifteen_completed",
      name: "Consistent Coder",
      description: "Complete 15 challenges.",
      icon: "medal",
      xpReward: 100,
      conditionType: "CHALLENGES_COMPLETED",
      conditionValue: 15,
    },

    {
      key: "first_perfect",
      name: "Clean Run",
      description: "Solve a challenge perfectly on first attempt.",
      icon: "sparkles",
      xpReward: 40,
      conditionType: "PERFECT_SOLVES",
      conditionValue: 1,
    },
    {
      key: "five_perfect",
      name: "Sharp Shooter",
      description: "Get 5 perfect solves.",
      icon: "target",
      xpReward: 100,
      conditionType: "PERFECT_SOLVES",
      conditionValue: 5,
    },

    {
      key: "streak_3",
      name: "Warming Up",
      description: "Reach a 3 day streak.",
      icon: "flame",
      xpReward: 30,
      conditionType: "STREAK_DAYS",
      conditionValue: 3,
    },
    {
      key: "streak_7",
      name: "Week Warrior",
      description: "Reach a 7 day streak.",
      icon: "flame",
      xpReward: 75,
      conditionType: "STREAK_DAYS",
      conditionValue: 7,
    },

    {
      key: "easy_done",
      name: "Easy Explorer",
      description: "Complete 10 easy challenges.",
      icon: "circle",
      xpReward: 50,
      conditionType: "EASY_COMPLETED",
      conditionValue: 10,
    },
    {
      key: "medium_done",
      name: "Medium Mind",
      description: "Complete 10 medium challenges.",
      icon: "triangle",
      xpReward: 100,
      conditionType: "MEDIUM_COMPLETED",
      conditionValue: 10,
    },
    {
      key: "hard_done",
      name: "Hard Hacker",
      description: "Complete 5 hard challenges.",
      icon: "diamond",
      xpReward: 200,
      conditionType: "HARD_COMPLETED",
      conditionValue: 5,
    },
  ];

  for (const b of badges) {
    await Badge.findOrCreate({
      where: { key: b.key },
      defaults: b,
    });
  }

  console.log("✅ Seeded badges");
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});