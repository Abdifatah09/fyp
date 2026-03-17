const request = require("supertest");

jest.mock("../middleware/authMiddleware", () => ({
  requireAuth: (req, res, next) => {
    req.user = { userId: 1, role: "admin" };
    next();
  },
  requireAdmin: (req, res, next) => next(),
}));

jest.mock("../models", () => ({
  User: {
    findAll: jest.fn(),
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
  UserStats: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
  Badge: {
    findAll: jest.fn(),
  },
  UserBadge: {
    findAll: jest.fn(),
  },
  Achievement: {},
  UserAchievement: {
    findAll: jest.fn(),
  },
  Challenge: {
    findByPk: jest.fn(),
  },
  ChallengeAttempt: {
    create: jest.fn(),
    findOne: jest.fn(),
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

jest.mock("../utils/gamification", () => ({
  applyLevelUps: jest.fn(() => ({ level: 3, nextLevelXp: 300 })),
  toISODateOnly: jest.fn(() => "2026-03-12"),
  yesterdayISO: jest.fn(() => "2026-03-11"),
}));

const app = require("../app");
const {
  UserStats,
  Badge,
  UserBadge,
  UserAchievement,
  User,
} = require("../models");

describe("Gamification routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return current user gamification stats", async () => {
    UserStats.findOne.mockResolvedValue({
      userId: 1,
      xp: 120,
      level: 2,
      streakCount: 5,
      rank: "Bronze",
      lastActiveDate: "2026-03-12",
    });

    const res = await request(app).get("/gamification/me");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      xp: 120,
      level: 2,
      streakCount: 5,
      rank: "Bronze",
      lastActiveDate: "2026-03-12",
      nextLevelXp: 300,
    });
  });

  it("should create stats if user has none", async () => {
    UserStats.findOne.mockResolvedValue(null);
    UserStats.create.mockResolvedValue({
      userId: 1,
      xp: 0,
      level: 1,
      streakCount: 0,
      rank: "Bronze",
      lastActiveDate: null,
    });

    const res = await request(app).get("/gamification/me");

    expect(res.statusCode).toBe(200);
    expect(UserStats.create).toHaveBeenCalledWith({ userId: 1 });
    expect(res.body.xp).toBe(0);
  });

  it("should return active badges list", async () => {
    Badge.findAll.mockResolvedValue([
      { id: 1, name: "First Steps", isActive: true },
      { id: 2, name: "Streak Starter", isActive: true },
    ]);

    const res = await request(app).get("/badges");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it("should return earned badges for current user", async () => {
    UserBadge.findAll.mockResolvedValue([
      {
        earnedAt: "2026-03-10T10:00:00.000Z",
        badge: {
          toJSON: () => ({
            id: 1,
            name: "First Correct",
            description: "Solved first challenge",
          }),
        },
      },
    ]);

    const res = await request(app).get("/badges/me");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([
      {
        earnedAt: "2026-03-10T10:00:00.000Z",
        id: 1,
        name: "First Correct",
        description: "Solved first challenge",
      },
    ]);
  });

  it("should return earned achievements for current user", async () => {
    UserAchievement.findAll.mockResolvedValue([
      {
        earnedAt: "2026-03-11T12:00:00.000Z",
        achievement: {
          toJSON: () => ({
            id: 10,
            name: "Getting Started",
            xpReward: 50,
          }),
        },
      },
    ]);

    const res = await request(app).get("/achievements/me");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([
      {
        earnedAt: "2026-03-11T12:00:00.000Z",
        id: 10,
        name: "Getting Started",
        xpReward: 50,
      },
    ]);
  });

  it("should return global leaderboard", async () => {
    User.findAll.mockResolvedValue([
      {
        id: 1,
        name: "Alice",
        stats: {
          xp: 300,
          level: 4,
          rank: "Silver",
          streakCount: 6,
        },
      },
      {
        id: 2,
        name: "Bob",
        stats: {
          xp: 180,
          level: 3,
          rank: "Bronze",
          streakCount: 2,
        },
      },
    ]);

    const res = await request(app).get("/leaderboard");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([
      {
        id: 1,
        name: "Alice",
        xp: 300,
        level: 4,
        rank: "Silver",
        streakCount: 6,
      },
      {
        id: 2,
        name: "Bob",
        xp: 180,
        level: 3,
        rank: "Bronze",
        streakCount: 2,
      },
    ]);
  });
});