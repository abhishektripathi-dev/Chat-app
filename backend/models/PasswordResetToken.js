const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const PasswordResetToken = sequelize.define("PasswordResetToken", {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
});

module.exports = PasswordResetToken;