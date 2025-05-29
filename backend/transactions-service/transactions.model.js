const { DataTypes } = require("sequelize");
const sequelize = require("./db");

// Transactions Model
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
      allowNull: true,
      references: {
        model: 'user',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    total: {
      type: DataTypes.DECIMAL(50, 2),
      allowNull: false,
    },
    catatan: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    alamat: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    invoice_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
      references: {
        model: 'invoice',
        key: 'invoice_url'
      },
      onDelete: 'SET NULL'
    },
    pemesan: {
      type: DataTypes.STRING(255),
      allowNull: true,
    }
  },
  {
    tableName: "transactions",
    timestamps: false,
  }
);

// TransactionItems Model
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
      references: {
        model: 'transactions',
        key: 'id',
      },
      onDelete: 'CASCADE',
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
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "transactions_items",
    timestamps: false,
  }
);

// TransactionsHistory Model
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
      allowNull: true,
      references: {
        model: 'user',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    total: {
      type: DataTypes.DECIMAL(50, 2),
      allowNull: false,
    },
    catatan: {
      type: DataTypes.STRING(500),
      allowNull: true,
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
      type: DataTypes.DATE,
      allowNull: false,
    },
    invoice_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
      references: {
        model: 'invoice',
        key: 'invoice_url'
      },
      onDelete: 'SET NULL'
    },
    pemesan: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: "transactions_history",
    timestamps: false,
  }
);

// TransactionHistoryItems Model
const TransactionHistoryItems = sequelize.define(
  "TransactionHistoryItems",
  {
    id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
    },
    transaction_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      references: {
        model: 'transactions_history',
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
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "transactions_history_items",
    timestamps: false,
  }
);

// Define Relationships
Transactions.hasMany(TransactionItems, {
  foreignKey: "transactions_id",
  sourceKey: "id",
  as: "transaction_items",
  onDelete: "CASCADE",
  onUpdate: "CASCADE"
});

TransactionItems.belongsTo(Transactions, {
  foreignKey: "transactions_id",
  targetKey: "id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE"
});

TransactionsHistory.hasMany(TransactionHistoryItems, {
  foreignKey: "transaction_id",
  sourceKey: "id",
  as: "transaction_history_items",
  onDelete: "CASCADE",
  onUpdate: "CASCADE"
});

TransactionHistoryItems.belongsTo(TransactionsHistory, {
  foreignKey: "transaction_id",
  targetKey: "id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE"
});

// Export the models
module.exports = {
  Transactions,
  TransactionItems,
  TransactionsHistory,
  TransactionHistoryItems,
};
