const sequelize  = require('../sequelize');
const User = require('./user');
const Profile = require('./profile');
const RefreshToken = require('./refreshToken');
const Section = require('./section');
const Difficulty = require('./difficulty');
const Subject = require('./subject');
const ChallengeAttempt = require('./challengeAttempt');
const Challenge = require('./challenge');
const UserSubscription = require("./UserSubscription");
const UserStats = require("./userStats");
const Achievement = require("./achievement");
const UserAchievement = require("./userAchievement");
const Badge = require("./badge");
const UserBadge = require("./userBadge");


User.hasOne(Profile, { 
  foreignKey: 'userId', 
  as: 'profile', 
  onDelete: 'CASCADE'
});

Profile.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user'
 });

User.hasMany(RefreshToken, { 
  foreignKey: 'userId',
  as: 'refreshTokens', 
  onDelete: 'CASCADE' 
});

RefreshToken.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user' 
});

Subject.hasMany(Difficulty, {
  foreignKey: "subjectId",
  as: "difficulties",
});

Difficulty.belongsTo(Subject, {
  foreignKey: "subjectId",
  as: "subject",
});

Difficulty.hasMany(Section, {
  foreignKey: "difficultyId",
  as: "sections",
});

Section.belongsTo(Difficulty, {
  foreignKey: "difficultyId",
  as: "difficulty",
});

Section.hasMany(Challenge, {
  foreignKey: "sectionId",
  as: "challenges",
});

Challenge.belongsTo(Section, {
  foreignKey: "sectionId",
  as: "section",
});

User.hasMany(ChallengeAttempt, {
  foreignKey: "userId",
  as: "attempts",
});

ChallengeAttempt.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Challenge.hasMany(ChallengeAttempt, {
  foreignKey: "challengeId",
  as: "attempts",
});

ChallengeAttempt.belongsTo(Challenge, {
  foreignKey: "challengeId",
  as: "challenge",
});

User.belongsToMany(Difficulty, {
  through: UserSubscription,
  foreignKey: "userId",
  otherKey: "difficultyId",
});

Difficulty.belongsToMany(User, {
  through: UserSubscription,
  foreignKey: "difficultyId",
  otherKey: "userId",
});

UserSubscription.belongsTo(User, { 
  foreignKey: "userId" 
});

UserSubscription.belongsTo(Difficulty, { 
  foreignKey: "difficultyId" 
});

User.hasMany(UserSubscription, { 
  foreignKey: "userId" 
});

Difficulty.hasMany(UserSubscription, { 
  foreignKey: "difficultyId" 
});

User.hasOne(UserStats, { 
  foreignKey: "userId",
  as: "stats", 
  onDelete: "CASCADE" 
});

UserStats.belongsTo(User, { 
  foreignKey: "userId", 
  as: "user" 
});

Achievement.hasMany(UserAchievement, {
  foreignKey: "achievementId",
  as: "userAchievements",
});

UserAchievement.belongsTo(Achievement, {
  foreignKey: "achievementId",
  as: "achievement",
});

User.hasMany(UserAchievement, {
  foreignKey: "userId",
  as: "achievements",
});

UserAchievement.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

User.belongsToMany(Badge, {
  through: UserBadge,
  foreignKey: "userId",
  otherKey: "badgeId",
});

Badge.belongsToMany(User, {
  through: UserBadge,
  foreignKey: "badgeId",
  otherKey: "userId",
});

UserBadge.belongsTo(User, { 
  foreignKey: "userId" 
});

UserBadge.belongsTo(Badge, { 
  foreignKey: "badgeId" ,
  as: "badge"
});

User.hasMany(UserBadge, { 
  foreignKey: "userId" 
});

Badge.hasMany(UserBadge, { 
  foreignKey: "badgeId" ,
  as: "badge"
});

module.exports = {
  sequelize,
  User,
  Profile,
  RefreshToken,
  Section,
  Difficulty,
  Subject,
  ChallengeAttempt,
  Challenge,
  UserSubscription,
  UserStats,
  Achievement,
  UserAchievement,
  Badge,
  UserBadge,
};
