// centralizes model + associations (wire up associations in one place)

const sequelize = require("../config/db");
const User = require("./User");
const Group = require("./Group");
const GroupMember = require("./GroupMember");
const PasswordResetToken = require("./PasswordResetToken");
const Message = require("./Message");
const ArchivedMessage = require("./ArchivedMessage"); // <-- Add this line

// Associations
User.hasMany(Group, { foreignKey: "createdBy", as: "createdGroups" });
Group.belongsTo(User, { foreignKey: "createdBy", as: "creator" });

User.belongsToMany(Group, {
    through: GroupMember, foreignKey: "userId", as: "memberGroups",
});
Group.belongsToMany(User, {
    through: GroupMember, foreignKey: "groupId", as: "members",
});

GroupMember.belongsTo(User, { foreignKey: "userId" });
GroupMember.belongsTo(Group, { foreignKey: "groupId" });
User.hasMany(GroupMember, { foreignKey: "userId" });
Group.hasMany(GroupMember, { foreignKey: "groupId" });

Message.belongsTo(User, { foreignKey: "userId", as: "sender" });
Message.belongsTo(Group, { foreignKey: "groupId" });
Group.hasMany(Message, { foreignKey: "groupId" });
User.hasMany(Message, { foreignKey: "userId" });

// No associations needed for ArchivedMessage

module.exports = { sequelize, User, Group, GroupMember, PasswordResetToken, Message, ArchivedMessage };