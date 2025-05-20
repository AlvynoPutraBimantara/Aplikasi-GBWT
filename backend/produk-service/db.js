// db.js
const { Sequelize } = require('sequelize');
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME || "gbwt",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "1234",
  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    pool: {
      max: 100,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: false,
      freezeTableName: true,
      underscored: false,
      paranoid: false
    },
    dialectOptions: {
      typeCast: true,
      multipleStatements: true
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false
  }
);

// Test the connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection to MySQL has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the MySQL database:', error);
  }
})();

module.exports = sequelize;
