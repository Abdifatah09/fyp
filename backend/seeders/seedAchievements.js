// const { sequelize, Achievement } = require("../models");
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });


const { sequelize, Achievement } = require("../models");


async function run() {
  await sequelize.authenticate();

  const achievements = [
    // TOTAL_CORRECT
    {
      key: "first_win",
      name: "First Win",
      description: "Complete your first challenge.",
      icon: "trophy",
      xpReward: 25,
      conditionType: "TOTAL_CORRECT",
      conditionValue: 1,
    },
    {
      key: "ten_wins",
      name: "On a Roll",
      description: "Complete 10 challenges.",
      icon: "badge-check",
      xpReward: 50,
      conditionType: "TOTAL_CORRECT",
      conditionValue: 10,
    },
    {
      key: "fifty_wins",
      name: "Serious Coder",
      description: "Complete 50 challenges.",
      icon: "medal",
      xpReward: 150,
      conditionType: "TOTAL_CORRECT",
      conditionValue: 50,
    },

    // STREAK
    {
      key: "streak_3",
      name: "Warming Up",
      description: "Reach a 3 day streak.",
      icon: "flame",
      xpReward: 30,
      conditionType: "STREAK_AT_LEAST",
      conditionValue: 3,
    },
    {
      key: "streak_7",
      name: "Week Warrior",
      description: "Reach a 7 day streak.",
      icon: "flame",
      xpReward: 75,
      conditionType: "STREAK_AT_LEAST",
      conditionValue: 7,
    },

    // SUBMISSIONS
    {
      key: "first_submit",
      name: "First Submit",
      description: "Make your first submission.",
      icon: "send",
      xpReward: 10,
      conditionType: "TOTAL_SUBMISSIONS",
      conditionValue: 1,
    },

    // LEVEL
    {
      key: "level_5",
      name: "Level 5",
      description: "Reach level 5.",
      icon: "star",
      xpReward: 100,
      conditionType: "LEVEL_AT_LEAST",
      conditionValue: 5,
    },
  ];

  for (const a of achievements) {
    await Achievement.findOrCreate({
      where: { key: a.key },
      defaults: a,
    });
  }

  console.log("✅ Seeded achievements");
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
