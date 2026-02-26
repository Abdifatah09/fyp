const { execSync } = require("child_process");
const path = require("path");

function run(file) {
  const full = path.resolve(__dirname, file);
  console.log(`\n==> Running ${file}`);
  execSync(`node ${full}`, { stdio: "inherit" });
}

try {
  // run("seedAchievements.js");
  // run("seedBadges.js");
  run("seedBeginnerJSChallenges.js");
  console.log("\n✅ All seeders ran successfully");
  process.exit(0);
} catch (e) {
  console.error("\n❌ Seeding failed");
  process.exit(1);
}