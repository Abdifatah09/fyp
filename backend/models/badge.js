const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const Badge = sequelize.define(
  "Badge",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    key: {
      type: DataTypes.STRING(80),
      allowNull: false,
      unique: true,
    },

    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },

    description: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    icon: {
      type: DataTypes.STRING(80),
      allowNull: true,
    },

    conditionType: {
      type: DataTypes.ENUM(
        "CHALLENGES_COMPLETED",
        "PERFECT_SOLVES",
        "STREAK_DAYS",
        "EASY_COMPLETED",
        "MEDIUM_COMPLETED",
        "HARD_COMPLETED",
        "COURSE_FINISHED"
      ),
      allowNull: false,
    },

    conditionValue: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    xpReward: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "badges",
    timestamps: true,
  }
);

module.exports = Badge;