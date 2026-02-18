const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

  const UserAchievement = sequelize.define(
    "UserAchievement",
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
      achievementId: {
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
      tableName: "user_achievements",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["userId", "achievementId"], 
        },
      ],
    }
  );

 module.exports = UserAchievement;

