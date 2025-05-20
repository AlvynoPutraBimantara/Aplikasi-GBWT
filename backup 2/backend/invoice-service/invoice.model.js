const { DataTypes } = require("sequelize");
const sequelize = require("./db"); // Import the sequelize instance

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
  },
  {
    tableName: "invoice",
    timestamps: false,
  }
);

// Export the model
module.exports = { Invoice };