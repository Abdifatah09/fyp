const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const UserSubscription = sequelize.define(
  "UserSubscription",
  {
    id: { 
      type: DataTypes.UUID, 
      defaultValue: DataTypes.UUIDV4, 
      primaryKey: true 
    },

    userId: { 
      type: DataTypes.UUID, 
      allowNull: false 
    },

    difficultyId: { 
      type: DataTypes.UUID, 
      allowNull: false 
    },
  },
  {
    tableName: "user_subscriptions",
    indexes: [{ 
      unique: true, 
      fields: ["userId", "difficultyId"] 
    }],
  }
);

module.exports = UserSubscription;
