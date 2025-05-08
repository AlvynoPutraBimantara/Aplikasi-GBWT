// backend/category-service/db.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'gbwt',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '1234',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    logging: false
  }
);

module.exports = sequelize;