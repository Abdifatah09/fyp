require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const { sequelize, Achievement } = require("../models");

async function run() {
  await sequelize.authenticate();

  const achievements = [

  {
    key: "ten_wins",
    name: "On a Roll",
    description: "Complete 10 challenges.",
    icon: "badge-check",
    xpReward: 75,
    conditionType: "TOTAL_CORRECT",
    conditionValue: 10,
  },
  {
    key: "fifty_wins",
    name: "Serious Coder",
    description: "Complete 50 challenges.",
    icon: "medal",
    xpReward: 200,
    conditionType: "TOTAL_CORRECT",
    conditionValue: 50,
  },

  {
    key: "streak_7",
    name: "Week Warrior",
    description: "Reach a 7 day streak.",
    icon: "flame",
    xpReward: 100,
    conditionType: "STREAK_AT_LEAST",
    conditionValue: 7,
  },
  {
    key: "streak_30",
    name: "Unstoppable",
    description: "Reach a 30 day streak.",
    icon: "fire",
    xpReward: 300,
    conditionType: "STREAK_AT_LEAST",
    conditionValue: 30,
  },

  {
    key: "level_10",
    name: "Level 10",
    description: "Reach level 10.",
    icon: "star",
    xpReward: 150,
    conditionType: "LEVEL_AT_LEAST",
    conditionValue: 10,
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
