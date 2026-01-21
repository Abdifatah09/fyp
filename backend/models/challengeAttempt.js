const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const ChallengeAttempt = sequelize.define(
  "ChallengeAttempt",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    challengeId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    submittedCode: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    isCorrect: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    score: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "challenge_attempts",
    timestamps: true,
  }
);

module.exports = ChallengeAttempt;
