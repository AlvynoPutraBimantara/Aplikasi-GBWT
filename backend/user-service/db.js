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
    logging: console.log, // Enable logging for debugging
    retry: {
      match: [
        /ETIMEDOUT/,
        /EHOSTUNREACH/,
        /ECONNRESET/,
        /ECONNREFUSED/,
        /ESOCKETTIMEDOUT/,
        /EHOSTDOWN/,
        /EPIPE/,
        /EAI_AGAIN/,
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/
      ],
      max: 5 // Maximum retry attempts
    }
  }
);

// Test the connection
// In backend/user-service/db.js, add more detailed connection logging:
sequelize.authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
    // Test a sample query
    return sequelize.query('SELECT 1+1 AS result');
  })
  .then(([results]) => {
    console.log('Database test query successful:', results);
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
    process.exit(1); // Exit if DB connection fails
  });
module.exports = sequelize;