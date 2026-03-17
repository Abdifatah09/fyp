const request = require("supertest");

jest.mock("../middleware/authMiddleware", () => ({
  requireAuth: (req, res, next) => {
    req.user = { userId: 1 };
    next();
  },
  requireAdmin: (req, res, next) => next(),
}));

jest.mock("../models", () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
  },
  Profile: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
  RefreshToken: {
    create: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock("../utils/emailService", () => ({
  sendOtpEmail: jest.fn(),
  sendWelcomeEmail: jest.fn(),
}));

jest.mock("../utils/tokenUtils", () => ({
  generateAccessToken: jest.fn(() => "fakeAccessToken"),
  generateRefreshToken: jest.fn(() => "fakeRefreshToken"),
  refreshTokenExpiryDate: jest.fn(() => new Date(Date.now() + 86400000)),
}));

jest.mock("bcrypt", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock("../models/challengeAttempt", () => ({
  findAll: jest.fn(),
}));

jest.mock("../models/challenge", () => ({
  findAll: jest.fn(),
}));

jest.mock("../models/section", () => ({
  findAll: jest.fn(),
  findByPk: jest.fn(),
}));

jest.mock("../models/difficulty", () => ({
  findAll: jest.fn(),
  findByPk: jest.fn(),
}));

jest.mock("../models/subject", () => ({
  findAll: jest.fn(),
  findByPk: jest.fn(),
}));

const app = require("../app");

const ChallengeAttempt = require("../models/challengeAttempt");
const Challenge = require("../models/challenge");
const Section = require("../models/section");
const Difficulty = require("../models/difficulty");
const Subject = require("../models/subject");

describe("Progress routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return overall progress stats", async () => {
    ChallengeAttempt.findAll.mockResolvedValue([
      { challengeId: 1, isCorrect: true, createdAt: new Date() },
      { challengeId: 2, isCorrect: false, createdAt: new Date() },
      { challengeId: 1, isCorrect: true, createdAt: new Date() },
    ]);

    const res = await request(app).get("/progress/me");

    expect(res.statusCode).toBe(200);
    expect(res.body.totalAttempts).toBe(3);
    expect(res.body.totalCorrect).toBe(2);
    expect(res.body.completedChallenges).toBe(1);
  });

  it("should return progress grouped by challenge", async () => {
    ChallengeAttempt.findAll.mockResolvedValue([
      { challengeId: 1, isCorrect: true, createdAt: new Date() },
      { challengeId: 1, isCorrect: false, createdAt: new Date() },
      { challengeId: 2, isCorrect: true, createdAt: new Date() },
    ]);

    const res = await request(app).get("/progress/me/by-challenge");

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("should return completed challenge ids", async () => {
    ChallengeAttempt.findAll.mockResolvedValue([
      { challengeId: 1, isCorrect: true },
      { challengeId: 2, isCorrect: false },
      { challengeId: 3, isCorrect: true },
    ]);

    const res = await request(app).get("/progress/me/completed-challenges");

    expect(res.statusCode).toBe(200);
    expect(res.body.completedChallenges).toBe(2);
    expect(res.body.completedChallengeIds).toEqual(expect.arrayContaining(["1", "3"]));
  });

  it("should return section detail progress", async () => {
    Section.findByPk.mockResolvedValue({
      id: 1,
      difficultyId: 1,
      name: "Basics",
    });

    Challenge.findAll.mockResolvedValue([
      { id: 1, sectionId: 1 },
      { id: 2, sectionId: 1 },
    ]);

    ChallengeAttempt.findAll.mockResolvedValue([
      { challengeId: 1, isCorrect: true },
    ]);

    const res = await request(app).get("/progress/me/sections/1");

    expect(res.statusCode).toBe(200);
    expect(res.body.section.id).toBe(1);
    expect(res.body.totals.totalChallenges).toBe(2);
    expect(res.body.totals.completedChallenges).toBe(1);
  });
});