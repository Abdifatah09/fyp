const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const UserBadge = sequelize.define(
  "UserBadge",
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

    badgeId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    earnedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "user_badges",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["userId", "badgeId"],
      },
    ],
  }
);

module.exports = UserBadge;