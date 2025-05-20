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
      validate: {
        notEmpty: true
      }
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
    underscored: true,
    indexes: [
      {
        fields: ['user']
      }
    ]
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
      references: {
        model: 'cart',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    itemid: {
      type: DataTypes.STRING(255),
      allowNull: false,
      references: {
        model: 'dataproduk',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1
      }
    },
    pedagang: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
  },
  {
    tableName: "cart_items",
    timestamps: false,
    underscored: true,
    indexes: [
      {
        fields: ['cart_id']
      },
      {
        fields: ['pedagang'],
        name: 'idx_pedagang_cart_items'
      },
      {
        fields: ['itemid'],
        name: 'fk_cart_items_product'
      }
    ]
  }
);

// Define the relationships between Cart and CartItems
Cart.hasMany(CartItems, {
  foreignKey: "cart_id",
  as: "cart_items",
  onDelete: 'CASCADE'
});

CartItems.belongsTo(Cart, {
  foreignKey: "cart_id",
  as: "cart",
  onDelete: 'CASCADE'
});

// Import Produk model after defining Cart and CartItems to avoid circular dependency
const Produk = require('./produk.model');

// Define the association with Produk using updated aliases
CartItems.belongsTo(Produk, {
  foreignKey: "itemid",
  as: "produk",  // Changed from "product" to "produk"
  onDelete: 'CASCADE'
});

Produk.hasMany(CartItems, {
  foreignKey: "itemid",
  as: "cartItems",  // Changed from "cart_items" to "cartItems"
  onDelete: 'CASCADE'
});

module.exports = { Cart, CartItems };