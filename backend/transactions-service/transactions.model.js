const { DataTypes } = require("sequelize");
const sequelize = require("./db");

// Define the Transactions model
const Transactions = sequelize.define(
  "Transactions",
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
      allowNull: false,
    },
    created_at: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    tableName: "transactions",
    timestamps: false,
  }
);

// Define the TransactionItems model
const TransactionItems = sequelize.define(
  "TransactionItems",
  {
    id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
    },
    transactions_id: {
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
    tableName: "transactions_items",
    timestamps: false,
  }
);

// Define the TransactionsHistory model
const TransactionsHistory = sequelize.define(
  "TransactionsHistory",
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
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE, // Changed from STRING to DATE
      allowNull: false,
    },
  },
  {
    tableName: "transactions_history",
    timestamps: false,
  }
);

// Define the TransactionHistoryItems model
const TransactionHistoryItems = sequelize.define(
  "TransactionHistoryItems",
  {
    id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
    },
    transaction_id: {
      // Renamed from transactions_id to transaction_id
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
      type: DataTypes.INTEGER, // Changed from STRING to INTEGER
      allowNull: false,
    },
  },
  {
    tableName: "transactions_history_items",
    timestamps: false,
  }
);

// Define the relationships
Transactions.hasMany(TransactionItems, {
  foreignKey: "transactions_id",
  sourceKey: "id",
  as: "transaction_items",
});

TransactionItems.belongsTo(Transactions, {
  foreignKey: "transactions_id",
  targetKey: "id",
});

TransactionsHistory.hasMany(TransactionHistoryItems, {
  foreignKey: "transaction_id", // Updated to match the new field name
  sourceKey: "id",
  as: "transaction_history_items",
});

TransactionHistoryItems.belongsTo(TransactionsHistory, {
  foreignKey: "transaction_id", // Updated to match the new field name
  targetKey: "id",
});

// Export the models
module.exports = { Transactions, TransactionItems, TransactionsHistory, TransactionHistoryItems };