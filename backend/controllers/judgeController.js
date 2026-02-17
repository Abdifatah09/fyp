const Challenge = require("../models/challenge");
const ChallengeAttempt = require("../models/challengeAttempt");
const { createSubmission } = require("../utils/judge0Service");

const normalize = (s) => String(s ?? "").replace(/\r\n/g, "\n").trim();
const ALLOWED_LANGS = new Set([102, 91]); // JS + Java

exports.submit = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { challengeId, languageId, sourceCode, stdin } = req.body;

    if (!challengeId || !languageId || !sourceCode) {
      return res
        .status(400)
        .json({ message: "challengeId, languageId, sourceCode are required" });
    }

    const lang = Number(languageId);
    if (!ALLOWED_LANGS.has(lang)) {
      return res.status(400).json({ message: "Unsupported language" });
    }

    const challenge = await Challenge.findByPk(challengeId);
    if (!challenge) return res.status(404).json({ message: "Challenge not found" });

    if (!challenge.solution) {
      return res.status(400).json({ message: "Challenge has no solution set yet" });
    }

    // 1) Run user code
    const userRun = await createSubmission({
      languageId: lang,
      sourceCode,
      stdin: stdin || "",
    });

    const userOk = userRun?.status?.id === 3;

    // 2) Run solution code (oracle)
    const solRun = await createSubmission({
      languageId: lang,
      sourceCode: challenge.solution,
      stdin: stdin || "",
    });

    const solOk = solRun?.status?.id === 3;

    // If solution fails, store attempt as incorrect but explain it
    if (!solOk) {
      const attempt = await ChallengeAttempt.create({
        userId,
        challengeId,
        languageId: lang,
        submittedCode: sourceCode,
        isCorrect: false,
        feedback:
          "Grading unavailable: the stored solution failed to run. Please contact admin.",
      });

      return res.status(201).json({
        isCorrect: false,
        feedback: attempt.feedback,
        attempt,
        gradable: false,
        userRun: {
          status: userRun.status,
          stdout: userRun.stdout,
          stderr: userRun.stderr,
          compile_output: userRun.compile_output,
        },
        solutionRun: {
          status: solRun.status,
          stdout: solRun.stdout,
          stderr: solRun.stderr,
          compile_output: solRun.compile_output,
        },
      });
    }

    const expectedOut = normalize(solRun.stdout);
    const actualOut = normalize(userRun.stdout);

    const isCorrect = userOk && actualOut === expectedOut;

    let feedback = isCorrect ? "Correct ✅" : "Incorrect ❌";

    if (!userOk) {
      const details =
        normalize(userRun.compile_output) ||
        normalize(userRun.stderr) ||
        normalize(userRun.message) ||
        "Your code did not run successfully.";
      feedback = `Incorrect ❌\n\n${details}`;
    } else if (!isCorrect) {
      feedback = `Incorrect ❌\n\nExpected Output:\n${solRun.stdout || ""}\n\nYour Output:\n${userRun.stdout || ""}`;
    }

    // 3) Save attempt
    const attempt = await ChallengeAttempt.create({
      userId,
      challengeId,
      languageId: lang,
      submittedCode: sourceCode,
      isCorrect,
      feedback,
    });

    // 4) Return result
    return res.status(201).json({
      isCorrect,
      feedback,
      gradable: true,
      attempt,
      expectedOutput: solRun.stdout,
      run: {
        stdout: userRun.stdout,
        stderr: userRun.stderr,
        compile_output: userRun.compile_output,
        status: userRun.status,
        time: userRun.time,
        memory: userRun.memory,
      },
    });
  } catch (err) {
    console.error("judge submit error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
