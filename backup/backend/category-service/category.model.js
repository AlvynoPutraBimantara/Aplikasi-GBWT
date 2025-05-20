const { DataTypes } = require("sequelize");
const sequelize = require("./db");

const AppImage = sequelize.define("AppImage", {
  id: {
    type: DataTypes.STRING(255),
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  filename: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  data: {
    type: DataTypes.BLOB("long"),
    allowNull: false,
  },
  mimetype: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  upload_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: "appimages",
  timestamps: false,
});

const Category = sequelize.define("Category", {
  id: {
    type: DataTypes.STRING(255),
    primaryKey: true,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  imageurl: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  tableName: "categories",
  timestamps: false,
});

module.exports = { AppImage, Category };
