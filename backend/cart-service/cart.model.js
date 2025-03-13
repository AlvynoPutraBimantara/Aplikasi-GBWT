const { DataTypes } = require("sequelize");
const sequelize = require("./db");

const Cart = sequelize.define(
  "Cart",
  {
    id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    pedagang: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    user: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    itemid: {
      type: DataTypes.STRING(255),
      allowNull: true, // Matches your table definition (NULL allowed)
      defaultValue: null,
    },
  },
  {
    tableName: "cart",
    timestamps: false,
  }
);

module.exports = { Cart };
