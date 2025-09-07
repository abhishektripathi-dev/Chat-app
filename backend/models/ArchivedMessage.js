const { DataTypes } = require("sequelize");
const sequelize = require("../config/db")

const ArchivedMessage = sequelize.define("ArchivedMessage", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    fileUrl: {
        type: DataTypes.STRING,
        allowNull: true,
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
    timestamps: true, 
    updatedAt: false
});

module.exports = ArchivedMessage;