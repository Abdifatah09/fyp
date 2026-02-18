const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

  const Achievement = sequelize.define(
    "Achievement",
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
      xpReward: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      conditionType: {
        type: DataTypes.ENUM(
          "TOTAL_CORRECT",
          "TOTAL_SUBMISSIONS",
          "STREAK_AT_LEAST",
          "LEVEL_AT_LEAST"
        ),
        allowNull: false,
      },
      conditionValue: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      isHidden: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      tableName: "achievements",
      timestamps: true,
    }
  );


  module.exports = Achievement;

