const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const Challenge = sequelize.define(
  "Challenge",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    instructions: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    starterCode: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    solution: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    sectionId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    tableName: "challenges",
    timestamps: true,
  }
);

module.exports = Challenge;
