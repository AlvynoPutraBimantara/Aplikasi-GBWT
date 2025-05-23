const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Initialize Sequelize with MySQL
const sequelize = new Sequelize({
  dialect: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "1234",
  database: process.env.DB_NAME || "gbwt",
  logging: false, // Disable logging SQL queries (optional)
});

// Test the database connection
sequelize
  .authenticate()
  .then(() => {
    console.log("Connection to the database has been established successfully.");
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
  });

// Export the sequelize instance
module.exports = sequelize;