const request = require("supertest");

jest.mock("../middleware/authMiddleware", () => ({
  requireAuth: (req, res, next) => {
    req.user = { userId: 1 };
    next();
  },
  requireAdmin: (req,res,next) => next(),
}));

jest.mock("../models", () => ({
  Challenge: {
    findByPk: jest.fn(),
  },
  ChallengeAttempt: {
    create: jest.fn(),
    findOne: jest.fn(),
  },
  UserStats: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock("../utils/judge0Service", () => ({
  createSubmission: jest.fn(),
}));

jest.mock("../utils/gamification", () => ({
  applyLevelUps: jest.fn(() => ({ level: 1, nextLevelXp: 100 })),
  toISODateOnly: jest.fn(() => "2025-01-01"),
  yesterdayISO: jest.fn(() => "2024-12-31"),
}));

jest.mock("../utils/rank", () => ({
  applyRank: jest.fn(),
}));

jest.mock("../utils/achievementService", () => ({
  checkAndAwardAchievements: jest.fn(() => ({
    newlyEarned: [],
    xpFromAchievements: 0,
  })),
}));

jest.mock("../utils/badgeService", () => ({
  checkAndAwardBadges: jest.fn(() => ({
    newlyEarned: [],
    xpFromBadges: 0,
  })),
}));

const app = require("../app");

const { Challenge, ChallengeAttempt, UserStats } = require("../models");
const { createSubmission } = require("../utils/judge0Service");
const { requireAdmin } = require("../middleware/authMiddleware");

describe("Judge submission", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });


  it("should reject missing challengeId", async () => {

    const res = await request(app)
      .post("/judge/submit")
      .send({ sourceCode: "console.log(1)" });

    expect(res.statusCode).toBe(400);
  });


  it("should return 404 if challenge not found", async () => {

    Challenge.findByPk.mockResolvedValue(null);

    const res = await request(app)
      .post("/judge/submit")
      .send({
        challengeId: 1,
        sourceCode: "console.log(1)",
      });

    expect(res.statusCode).toBe(404);
  });


  it("should mark correct submission", async () => {

    Challenge.findByPk.mockResolvedValue({
      id: 1,
      solution: "return 2;",
      starterCode: "",
      languageId: 102,
    });

    createSubmission
      .mockResolvedValueOnce({
        status: { id: 3 },
        stdout: "2",
      })
      .mockResolvedValueOnce({
        status: { id: 3 },
        stdout: "2",
      });

    ChallengeAttempt.findOne.mockResolvedValue(null);

    ChallengeAttempt.create.mockResolvedValue({
      id: 1,
      isCorrect: true,
    });

    const stats = {
      xp: 0,
      level: 1,
      streakCount: 0,
      lastActiveDate: null,
      save: jest.fn(),
    };

    UserStats.findOne.mockResolvedValue(stats);

    const res = await request(app)
      .post("/judge/submit")
      .send({
        challengeId: 1,
        sourceCode: "return 2;",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.isCorrect).toBe(true);
  });


  it("should mark incorrect submission", async () => {

    Challenge.findByPk.mockResolvedValue({
      id: 1,
      solution: "return 2;",
      starterCode: "",
      languageId: 102,
    });

    createSubmission
      .mockResolvedValueOnce({
        status: { id: 3 },
        stdout: "1",
      })
      .mockResolvedValueOnce({
        status: { id: 3 },
        stdout: "2",
      });

    ChallengeAttempt.findOne.mockResolvedValue(null);

    ChallengeAttempt.create.mockResolvedValue({
      id: 1,
      isCorrect: false,
    });

    const stats = {
      xp: 0,
      level: 1,
      streakCount: 0,
      lastActiveDate: null,
      save: jest.fn(),
    };

    UserStats.findOne.mockResolvedValue(stats);

    const res = await request(app)
      .post("/judge/submit")
      .send({
        challengeId: 1,
        sourceCode: "return 1;",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.isCorrect).toBe(false);
  });

});