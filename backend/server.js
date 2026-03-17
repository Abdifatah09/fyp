require("dotenv").config();

const app = require("./app");
const { sequelize } = require("./models");

(async () => {
  try {
    await sequelize.authenticate();
    console.log("DB connection OK");

    await sequelize.sync({ alter: true });
    console.log("Models synced");

    if (String(process.env.RUN_SEEDERS).toLowerCase() === "true") {
      console.log("RUN_SEEDERS=true -> running seeders");
      const { execSync } = require("child_process");
      execSync("node seeders/runAll.js", { stdio: "inherit" });
      console.log("Seeders complete ✅");
    }

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Startup error:", err);
    process.exit(1);
  }
})();