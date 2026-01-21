const sequelize  = require('../sequelize');
const User = require('./user');
const Profile = require('./profile');
const RefreshToken = require('./refreshToken');
const Section = require('./section');
const Difficulty = require('./difficulty');
const Subject = require('./subject');
const ChallengeAttempt = require('./challengeAttempt');
const Challenge = require('./challenge');


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
};
