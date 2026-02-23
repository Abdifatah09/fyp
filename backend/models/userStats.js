const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const UserStats = sequelize.define(
  "UserStats",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    xp: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    streakCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    rank: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Bronze",
    },
    lastActiveDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  { tableName: "user_stats", timestamps: true }
);

module.exports = UserStats;
