// eslint-disable-next-line no-unused-vars
const { DataTypes, Model } = require("sequelize");
const sequelize = require("./db");

// Define the Orders model
const Orders = sequelize.define(
  "Orders",
  {
    id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
      field: 'id' // Explicitly set field name
    },
    user: {
    type: DataTypes.STRING(255),
    allowNull: true, 
      references: {
        model: 'user',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    total: {
      type: DataTypes.DECIMAL(50, 2),
      allowNull: false,
    },
    catatan: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    pemesan: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    alamat: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'pending',
    },
    invoice_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: "orders",
    timestamps: false,
    indexes: [
      {
        fields: ['user'],
        name: 'fk_orders_user'
      }
    ]
  }
);

// Define the OrderItems model
const OrderItems = sequelize.define(
  "OrderItems",
  {
    id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
    },
    order_id: {
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
    pedagang: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(50, 2),
      allowNull: false,
    },
    quantity: {
  type: DataTypes.INTEGER, // Changed from STRING
  allowNull: false,
},
  },
  {
    tableName: "order_items",
    timestamps: false,
    indexes: [
      {
        fields: ['order_id'],
        name: 'order_id'
      },
      {
        fields: ['pedagang'],
        name: 'idx_pedagang_order_items'
      },
      {
        fields: ['itemid'],
        name: 'fk_order_items_product'
      }
    ]
  }
);

// Define the Invoice model with updated order_id reference
// Define the Invoice model with proper unique constraint
const Invoice = sequelize.define(
  "Invoice",
  {
    id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
    },
    order_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      references: {
        model: 'orders',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    },
    filename: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    file: {
      type: DataTypes.BLOB('long'),
      allowNull: true,
    },
    invoice_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: 'idx_invoiceurl_unique' // Explicitly name the unique constraint
    },
  },
  {
    tableName: "invoice",
    timestamps: false,
    indexes: [
      {
        fields: ['order_id'],
        name: 'order_id'
      },
      // The unique constraint is automatically created by the field definition above
    ]
  }
);

// Define the relationships
Orders.hasMany(OrderItems, {
  foreignKey: "order_id",
  as: "order_items",
  onDelete: 'CASCADE'
});

OrderItems.belongsTo(Orders, {
  foreignKey: "order_id",
  as: "order",
  onDelete: 'CASCADE'
});

// Simplified Invoice associations using only order_id
Invoice.belongsTo(Orders, {
  foreignKey: "order_id",
  as: "order",
  onDelete: 'CASCADE'
});

Orders.hasOne(Invoice, {
  foreignKey: "order_id",
  as: "invoice",
  onDelete: 'CASCADE'
});

module.exports = { Orders, OrderItems, Invoice };