require('dotenv').config();

module.exports = {
  development: {
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    host: process.env.POSTGRES_ENDPOINT,
    dialect: 'postgres',
    port: process.env.POSTGRES_PORT,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Set to true in production for proper certificate validation
      },
    },
  },
  test: {
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: 'test_database',
    host: process.env.POSTGRES_ENDPOINT,
    dialect: 'postgres',
    port: process.env.POSTGRES_PORT,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
  production: {
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: 'production_database',
    host: process.env.POSTGRES_ENDPOINT,
    dialect: 'postgres',
    port: process.env.POSTGRES_PORT,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};
