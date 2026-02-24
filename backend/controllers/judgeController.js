// controllers/judgeController.js

const { Challenge, ChallengeAttempt, UserStats } = require("../models");
const { createSubmission } = require("../utils/judge0Service");
const { applyLevelUps, toISODateOnly, yesterdayISO } = require("../utils/gamification");
const { applyRank } = require("../utils/rank");

const { checkAndAwardAchievements } = require("../utils/achievementService");
const { checkAndAwardBadges } = require("../utils/badgeService");

function normalize(s) {
  return String(s ?? "").replace(/\r\n/g, "\n").trim();
}

function decodeEscapes(s) {
  return String(s ?? "")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");
}

function stripWrappingQuotes(s) {
  const t = String(s ?? "").trim();
  if (
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("'") && t.endsWith("'"))
  ) {
    return t.slice(1, -1);
  }
  return t;
}

exports.submit = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { challengeId, sourceCode, stdin = "" } = req.body;

    if (!challengeId || !sourceCode) {
      return res.status(400).json({ message: "challengeId and sourceCode are required" });
    }

    const challenge = await Challenge.findByPk(challengeId);
    if (!challenge) return res.status(404).json({ message: "Challenge not found" });

    if (!challenge.solution) {
      return res.status(400).json({
        message: "Challenge has no solution set yet (cannot auto-mark).",
      });
    }

    const languageId = Number(challenge.languageId);
    if (!languageId) {
      return res.status(400).json({
        message: "Challenge is missing languageId (cannot run Judge0).",
      });
    }

    const decodedStarter = decodeEscapes(challenge.starterCode || "");
    const decodedSolution = stripWrappingQuotes(decodeEscapes(challenge.solution || ""));
    const oracleSource = `${decodedStarter}\n${decodedSolution}`;

    // Run user code
    const userRun = await createSubmission({ languageId, sourceCode, stdin });
    const userOk = userRun?.status?.id === 3;

    // Run oracle solution
    const solRun = await createSubmission({ languageId, sourceCode: oracleSource, stdin });
    const solOk = solRun?.status?.id === 3;

    if (!solOk) {
      const feedback =
        "Grading unavailable: stored solution failed to run. Please contact admin.";

      const attempt = await ChallengeAttempt.create({
        userId,
        challengeId,
        languageId,
        submittedCode: sourceCode,
        isCorrect: false,
        feedback,
      });

      return res.status(201).json({
        gradable: false,
        isCorrect: false,
        feedback: attempt.feedback,
        attempt,
        expectedOutput: solRun.stdout || "",
        achievements: { newlyEarned: [], xpFromAchievements: 0 },
        badges: { newlyEarned: [], xpFromBadges: 0 },
        rank: { current: "Bronze", rankUp: false },
        run: {
          status: userRun.status,
          stdout: userRun.stdout,
          stderr: userRun.stderr,
          compile_output: userRun.compile_output,
          time: userRun.time,
          memory: userRun.memory,
        },
      });
    }

    const expectedOutput = normalize(solRun.stdout);
    const actualOutput = normalize(userRun.stdout);
    const isCorrect = userOk && actualOutput === expectedOutput;

    let feedback = isCorrect ? "Correct ✅" : "Incorrect ❌";

    if (!userOk) {
      const details =
        normalize(userRun.compile_output) ||
        normalize(userRun.stderr) ||
        normalize(userRun.message) ||
        "Your code did not run successfully.";
      feedback = `Incorrect ❌\n\n${details}`;
    } else if (!isCorrect) {
      feedback = `Incorrect ❌\n\nExpected Output:\n${solRun.stdout || ""}\n\nYour Output:\n${
        userRun.stdout || ""
      }`;
    }

    // ✅ FIX: check prevCorrect BEFORE saving this attempt
    let prevCorrect = null;
    if (isCorrect) {
      prevCorrect = await ChallengeAttempt.findOne({
        where: { userId, challengeId, isCorrect: true },
      });
    }

    // Save attempt
    const attempt = await ChallengeAttempt.create({
      userId,
      challengeId,
      languageId,
      submittedCode: sourceCode,
      isCorrect,
      feedback,
    });

    // Stats
    let stats = await UserStats.findOne({ where: { userId } });
    if (!stats) stats = await UserStats.create({ userId });

    const today = toISODateOnly(new Date());

    if (!stats.lastActiveDate) {
      stats.streakCount = 1;
      stats.lastActiveDate = today;
    } else if (stats.lastActiveDate === today) {
      // no change
    } else if (stats.lastActiveDate === yesterdayISO(today)) {
      stats.streakCount += 1;
      stats.lastActiveDate = today;
    } else {
      stats.streakCount = 1;
      stats.lastActiveDate = today;
    }

    let xpGained = 0;
    if (isCorrect) {
      xpGained = prevCorrect ? 10 : 20; // ✅ now first correct gives 20
      stats.xp += xpGained;
    }

    const leveled = applyLevelUps({ xp: stats.xp, level: stats.level });
    stats.level = leveled.level;
    await stats.save();

    // Awards
    const ach = await checkAndAwardAchievements(userId);
    const badgeResult = await checkAndAwardBadges(userId);

    // Level might change after rewards
    const leveled2 = applyLevelUps({ xp: stats.xp, level: stats.level });
    stats.level = leveled2.level;

    const prevRank = stats.rank || "Bronze";
    applyRank(stats);
    await stats.save();

    return res.status(201).json({
      gradable: true,
      isCorrect,
      feedback,
      attempt,
      xpGained,
      stats: {
        xp: stats.xp,
        level: stats.level,
        streakCount: stats.streakCount,
        lastActiveDate: stats.lastActiveDate,
        nextLevelXp: leveled2.nextLevelXp,
        rank: stats.rank,
      },
      expectedOutput: solRun.stdout || "",
      achievements: {
        newlyEarned: ach.newlyEarned,
        xpFromAchievements: ach.xpFromAchievements,
      },
      badges: {
        newlyEarned: badgeResult.newlyEarned,
        xpFromBadges: badgeResult.xpFromBadges,
      },
      rank: {
        current: stats.rank,
        rankUp: prevRank !== stats.rank,
      },
      run: {
        status: userRun.status,
        stdout: userRun.stdout,
        stderr: userRun.stderr,
        compile_output: userRun.compile_output,
        time: userRun.time,
        memory: userRun.memory,
      },
    });
  } catch (err) {
    console.error("judge submit error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};