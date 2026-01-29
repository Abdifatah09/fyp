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
      allowNull: false,
    },

    isCorrect: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    feedback: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "challenge_attempts",
    timestamps: true,
  }
);

module.exports = ChallengeAttempt;
