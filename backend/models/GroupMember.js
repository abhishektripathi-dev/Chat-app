const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const groupMember = sequelize.define(
    "GroupMember",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }, // FK -> User.id
        groupId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }, // FK -> Group.id
        role: {
            type: DataTypes.ENUM("admin", "member"),
            allowNull: false,
            defaultValue: "member",
        },
    },
    { indexes: [{ unique: true, fields: ["userId", "groupId"] }] } // prevent duplicate membership
);

module.exports = groupMember;
