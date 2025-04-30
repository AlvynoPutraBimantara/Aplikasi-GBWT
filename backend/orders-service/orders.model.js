const { DataTypes } = require("sequelize");
const sequelize = require("./db"); // Import the sequelize instance

// Define the Orders model
const Orders = sequelize.define(
  "Orders",
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
    total: {
      type: DataTypes.DECIMAL(50, 2),
      allowNull: false,
    },
    catatan: {
      type: DataTypes.STRING(500),
      allowNull: true,
      defaultValue: null,
    },
    alamat: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    pemesan: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    invoice_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    tableName: "orders", // Explicitly set the table name
    timestamps: false, // Disable Sequelize's automatic timestamps
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
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    tableName: "order_items", // Explicitly set the table name
    timestamps: false, // Disable Sequelize's automatic timestamps
  }
);

// Define the Invoice model
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
      allowNull: false,
    },
    filename: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    file: {
      type: DataTypes.BLOB('long'),
      allowNull: true,
    },
    fileUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: "invoice",
    timestamps: false,
  }
);

// Define the relationship between Orders and OrderItems
Orders.hasMany(OrderItems, {
  foreignKey: "order_id",
  sourceKey: "id",
  as: "order_items",
});

OrderItems.belongsTo(Orders, {
  foreignKey: "order_id",
  targetKey: "id",
});

// Define the relationship between Orders and Invoice
Orders.hasMany(Invoice, {
  foreignKey: "order_id",
  sourceKey: "id",
  as: "invoices",
});

Invoice.belongsTo(Orders, {
  foreignKey: "order_id",
  targetKey: "id",
});

// Export the models
module.exports = { Orders, OrderItems, Invoice };
