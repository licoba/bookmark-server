const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Website = sequelize.define(
  "Website",
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Categories",
        key: "id",
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Website;
