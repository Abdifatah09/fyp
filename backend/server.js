require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = rateLimit;
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const difficultyRoutes = require('./routes/difficultyRoutes');
const sectionRoutes = require('./routes/sectionRoutes');
const challengeRoutes = require('./routes/challengeRoutes');
const progressRoutes = require('./routes/progressRoutes');
const attemptRoutes = require('./routes/attemptRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const judgeRoutes = require('./routes/judgeRoutes');
const gamificationRoutes = require('./routes/gamificationRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const achievementRoutes = require('./routes/achievementRoutes');
const badgeRoutes = require('./routes/badgeRoutes');
const adminAnalyticsRoutes = require('./routes/adminAnalyticsRoutes');

const  {sequelize}  = require('./models');

const app = express();

app.set("trust proxy", 1);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://hackpath.co.uk",
  "https://www.hackpath.co.uk",
  "http://localhost:5173",
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
}));
app.options(/.*/, cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300, 
}));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
});

const judgeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.userId || ipKeyGenerator(req),
  message: { message: "Too many code submissions. Please slow down." },
});

app.use('/auth', authRoutes, authLimiter);
app.use('/profile', profileRoutes);
app.use('/subjects', subjectRoutes);
app.use('/difficulties', difficultyRoutes);
app.use('/sections', sectionRoutes);
app.use('/challenges', challengeRoutes);
app.use("/attempts", attemptRoutes);
app.use("/progress", progressRoutes);
app.use("/subscriptions", subscriptionRoutes);
app.use("/judge" , judgeRoutes, judgeLimiter);  
app.use("/gamification", gamificationRoutes);
app.use("/leaderboard", leaderboardRoutes);
app.use("/achievements", achievementRoutes);
app.use("/badges", badgeRoutes);
app.use("/admin/analytics", adminAnalyticsRoutes);

(async () => {
  try {
    await sequelize.authenticate();
    console.log('DB connection OK');

    await sequelize.sync({ alter: true });
    console.log('Models synced');

    if (String(process.env.RUN_SEEDERS).toLowerCase() === "true") {
       console.log("RUN_SEEDERS=true -> running seeders");
       const { execSync } = require("child_process");
      execSync("node seeders/runAll.js", { stdio: "inherit" });
      console.log("Seeders complete ✅");
    } 

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`Server is running on port ${PORT}`)
    );
  } catch (err) {
    console.error('Startup error:', err);
    process.exit(1);
  }
})();
