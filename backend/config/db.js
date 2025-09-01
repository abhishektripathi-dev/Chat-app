const { Sequelize } = require("sequelize");
require("dotenv").config();

const database = process.env.DB_NAME;
const username = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const database_host_name = process.env.DB_HOST;
const database_type = process.env.DB_DIALECT;

const sequelize = new Sequelize(database, username, password, {
    host: database_host_name,
    dialect: database_type,
    logging: false,
});

module.exports = sequelize;
