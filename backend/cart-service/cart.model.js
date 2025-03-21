const { DataTypes } = require("sequelize");
const sequelize = require("./db");

// Define the Cart model
const Cart = sequelize.define(
  "Cart",
  {
    id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
    },
    user: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "cart",
    timestamps: false,
  }
);

// Define the CartItems model
const CartItems = sequelize.define(
  "CartItems",
  {
    id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
    },
    cart_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    itemid: {
      type: DataTypes.STRING(255),
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
  },
  {
    tableName: "cart_items",
    timestamps: false,
  }
);

// Define the relationship between Cart and CartItems
Cart.hasMany(CartItems, {
  foreignKey: "cart_id",
  sourceKey: "id",
  as: "cart_items",
});

CartItems.belongsTo(Cart, {
  foreignKey: "cart_id",
  targetKey: "id",
});

module.exports = { Cart, CartItems };