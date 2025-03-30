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
    filename: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    file: {
      type: DataTypes.BLOB('long'), // Using BLOB('long') for longblob type
      allowNull: true,
    },
    fileUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
    }
  },
  {
    tableName: "invoice", // Explicitly set the table name to match your schema
    timestamps: false, // Disable Sequelize's automatic timestamps
  }
);

// Export the model
module.exports = Invoice;