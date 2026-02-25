require('dotenv').config();
const { Sequelize } = require('sequelize');

const {
  DATABASE_URL,
  DB_HOST,
  DB_PORT,
  DB_NAME,
  DB_USER,
  DB_PASS,
  DB_LOGGING,
} = process.env;

const commonOptions = {
  dialect: 'postgres',
  logging: DB_LOGGING === 'true' ? console.log : false,
  define: {
    underscored: true,
    timestamps: false,
  },
};

const sequelize = DATABASE_URL
  ? new Sequelize(DATABASE_URL, commonOptions)
  : new Sequelize({
      host: DB_HOST,
      port: Number(DB_PORT),
      database: DB_NAME,
      username: DB_USER,
      password: DB_PASS,
      ...commonOptions,
    });

module.exports = { sequelize };