require("dotenv").config();
const { Sequelize } = require("sequelize");

const POSTGRES_URL = process.env.POSTGRES_URL;

const sequelize = new Sequelize(POSTGRES_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // This should be true in production for proper certificate validation
    },
  },
  logging: false, // Disable logging; default: console.log
});

const connectToPostgresDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to Postgres Database");
  } catch (error) {
    console.error("Error connecting to Postgres Database");
    console.error(error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectToPostgresDB };
