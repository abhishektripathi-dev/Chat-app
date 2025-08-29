const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("chat_app", "root", "password", {
    host: "localhost",
    dialect: "mysql",
    logging: false,
});

module.exports = sequelize;
