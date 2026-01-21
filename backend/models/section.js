const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const Section = sequelize.define(
  "Section",
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
      allowNull: true,
    },

    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    difficultyId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    tableName: "sections",
    timestamps: true,
  }
);

module.exports = Section;
