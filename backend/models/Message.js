const { DataTypes } = require("sequelize");
const sequelize = require("../config/db")

const Message = sequelize.define("Message", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    groupId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    timestamps: true, // createdAt used as timestamp
    updatedAt: false
});

module.exports = Message;