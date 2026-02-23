// controllers/judgeController.js

const { Challenge, ChallengeAttempt, UserStats } = require("../models");
const { createSubmission } = require("../utils/judge0Service");
const {
  applyLevelUps,
  toISODateOnly,
  yesterdayISO,
} = require("../utils/gamification");
const { applyRank } = require("../utils/rank");

const { checkAndAwardAchievements } = require("../utils/achievementService");

function normalize(s) {
  return String(s ?? "").replace(/\r\n/g, "\n").trim();
}

// Fixes double-escaped strings coming from DB/admin UI (e.g. "\\n", '\\"')
function decodeEscapes(s) {
  return String(s ?? "")
    .replace(/\\n/g, "\n") // literal \n -> newline
    .replace(/\\r/g, "\r") // literal \r -> carriage return
    .replace(/\\"/g, '"') // \" -> "
    .replace(/\\\\/g, "\\"); // \\ -> \
}

// If solution accidentally stored as a quoted string: "console.log(...)"
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

    // frontend sends: challengeId, sourceCode, stdin(optional)
    const { challengeId, sourceCode, stdin = "" } = req.body;

    if (!challengeId || !sourceCode) {
      return res.status(400).json({
        message: "challengeId and sourceCode are required",
      });
    }

    const challenge = await Challenge.findByPk(challengeId);
    if (!challenge)
      return res.status(404).json({ message: "Challenge not found" });

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

    // Decode any accidental escaping in stored fields
    const decodedStarter = decodeEscapes(challenge.starterCode || "");
    const decodedSolution = stripWrappingQuotes(
      decodeEscapes(challenge.solution || "")
    );

    // IMPORTANT: run starter + solution so oracle has the scaffold variables etc.
    const oracleSource = `${decodedStarter}\n${decodedSolution}`;

    // 1) Run user's code
    const userRun = await createSubmission({
      languageId,
      sourceCode,
      stdin,
    });

    const userStatusId = userRun?.status?.id;
    const userOk = userStatusId === 3; // Accepted

    // 2) Run stored solution as oracle
    const solRun = await createSubmission({
      languageId,
      sourceCode: oracleSource,
      stdin,
    });

    const solStatusId = solRun?.status?.id;
    const solOk = solStatusId === 3;

    // If the solution fails, we can't grade reliably.
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
        run: {
          status: userRun.status,
          stdout: userRun.stdout,
          stderr: userRun.stderr,
          compile_output: userRun.compile_output,
          time: userRun.time,
          memory: userRun.memory,
        },
        // keep this for debugging in frontend; remove later if you want
        solutionRun: {
          status: solRun.status,
          stdout: solRun.stdout,
          stderr: solRun.stderr,
          compile_output: solRun.compile_output,
        },
      });
    }

    // Compare outputs (stdout)
    const expectedOutput = normalize(solRun.stdout);
    const actualOutput = normalize(userRun.stdout);

    const isCorrect = userOk && actualOutput === expectedOutput;

    // feedback
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

    // 3) Save attempt
    const attempt = await ChallengeAttempt.create({
      userId,
      challengeId,
      languageId,
      submittedCode: sourceCode,
      isCorrect,
      feedback,
    });

    // 4) Core gamification: XP + Level + Streak
    let stats = await UserStats.findOne({ where: { userId } });
    if (!stats) stats = await UserStats.create({ userId });

    const today = toISODateOnly(new Date());

    // streak logic
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

    // XP only if correct
    let xpGained = 0;

    if (isCorrect) {
      // first-correct bonus: if they haven't already passed this challenge before
      const prevCorrect = await ChallengeAttempt.findOne({
        where: { userId, challengeId, isCorrect: true },
      });

      xpGained = prevCorrect ? 10 : 20;
      stats.xp += xpGained;
    }

    const leveled = applyLevelUps({ xp: stats.xp, level: stats.level });
    stats.level = leveled.level;

    await stats.save();

    const ach = await checkAndAwardAchievements(userId);

    // If achievements added XP, your level might change again:
     const leveled2 = applyLevelUps({ xp: stats.xp, level: stats.level });
     stats.level = leveled2.level;
     await stats.save();
    
    // ✅ Apply Rank after XP changes (including achievements XP)
    const prevRank = stats.rank || "Bronze";
    const rankResult = applyRank(stats);
    await stats.save();

    // 5) Return everything the frontend needs
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
        nextLevelXp: leveled.nextLevelXp,
        rank: stats.rank,
      },
      expectedOutput: solRun.stdout || "",
      achievements: {
        newlyEarned: ach.newlyEarned,
        xpFromAchievements: ach.xpFromAchievements,
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
