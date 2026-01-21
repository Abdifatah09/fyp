const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const Difficulty = sequelize.define(
  "Difficulty",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    name: {
      type: DataTypes.ENUM("Beginner", "Intermediate", "Advanced"),
      allowNull: false,
    },

    subjectId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    tableName: "difficulties",
    timestamps: true,
  }
);

module.exports = Difficulty;
