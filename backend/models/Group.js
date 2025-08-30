const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Group = sequelize.define("Group", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }, // FK -> User.id
});

module.exports = Group;
