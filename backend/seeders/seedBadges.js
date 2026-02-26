// require("dotenv").config({
//   path: require("path").resolve(__dirname, "../.env"),
// });

require("dotenv").config(); // uses process.env (Railway vars)

const { sequelize, Badge } = require("../models");

async function run() {
  await sequelize.authenticate();

 const badges = [

  {
    key: "first_win",
    name: "First Win",
    description: "Complete your first challenge.",
    icon: "trophy",
    xpReward: 10,
    conditionType: "CHALLENGES_COMPLETED",
    conditionValue: 1,
  },
  {
    key: "first_perfect",
    name: "Clean Run",
    description: "Solve a challenge perfectly on first attempt.",
    icon: "sparkles",
    xpReward: 10,
    conditionType: "PERFECT_SOLVES",
    conditionValue: 1,
  },

  {
    key: "five_completed",
    name: "Getting Started",
    description: "Complete 5 challenges.",
    icon: "badge-check",
    xpReward: 20,
    conditionType: "CHALLENGES_COMPLETED",
    conditionValue: 5,
  },

  {
    key: "five_perfect",
    name: "Sharp Shooter",
    description: "Get 5 perfect solves.",
    icon: "target",
    xpReward: 25,
    conditionType: "PERFECT_SOLVES",
    conditionValue: 5,
  },

  {
    key: "easy_done",
    name: "Easy Explorer",
    description: "Complete 10 easy challenges.",
    icon: "circle",
    xpReward: 25,
    conditionType: "EASY_COMPLETED",
    conditionValue: 10,
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