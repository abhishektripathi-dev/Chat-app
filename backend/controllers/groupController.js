const { User, Group, GroupMember } = require("../models");

// Create a new group; creator becomes admin
exports.createGroup = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name?.trim()) {
            return res.status(400).json({ message: "Group name is required" });
        }

        const group = await Group.create({
            name: name.trim(),
            createdBy: req.user.id,
        });

        // creator is admin member
        await GroupMember.create({
            userId: req.user.id,
            groupId: group.id,
            role: "admin",
        });

        return res.status(201).json({ message: "Group created", group });
    } catch (error) {
        console.log("error in createGroup in groupController.js file");
        res.status(500).json({
            message: "Failed to create group",
            error: error.message,
        });
    }
};

// Add a member by email (admin-only)
exports.addMember = async (req, res) => {
    try {
        const groupId = parseInt(req.params.id, 10);
        const { email, role = "member" } = req.body;

        if (!email) return res.status(400).json({ message: "Email is required" });
        if (!["admin", "member"].includes(role)) return res.status(400).json({ message: "Invalid role" });

        const group = await Group.findByPk(groupId);
        if (!group) return res.status(404).json({ message: "Group not found" });

        // only admins of this group can add members
        const meInGroup = await GroupMember.findOne({ where: { groupId, userId: req.user.id } });
        if (!meInGroup || meInGroup.role !== "admin") {
            return res.status(403).json({ message: "Only group admins can add members" });
        }

        const userToAdd = await User.findOne({ where: { email } });
        if (!userToAdd) return res.status(404).json({ message: "User with this email not found" });

        const [membership, created] = await GroupMember.findOrCreate({
            where: { userId: userToAdd.id, groupId },
            defaults: { role },
        });

        if (!created) {
            // if already member, allow role upgrade by admin
            if (membership.role !== role) {
                membership.role = role;
                await membership.save();
            }
            return res.json({ message: "User already in group; role updated if changed", membership });
        }

        return res.status(201).json({ message: "Member added", membership });

    } catch (error) {
        console.log("Error in addMember in groupController.js file");
        return res.status(500).json({ message: "Failed to add member", error: error.message });
    }
};

// Get groups where current user is a member
exports.getMyGroups = async (req, res) => {
    try {
        const groups = await Group.findAll({
            include: [
                {
                    model: GroupMember,
                    required: true,
                    where: { userId: req.user.id },
                    attributes: ["role"],
                },
                {
                    association: "creator",
                    attributes: ["id", "name", "email"]
                },
            ],
            order: [["id", "DESC"]]
        })

        return res.json({ count: groups.length, groups });
    } catch (error) {
        console.log("Error in getmyGroups in groupController.js file");
        res.status(500).json({ message: "Failed to fetch groups", error: error.message });
    }
}


// Get all members of a specific group
exports.getGroupMembers = async (req, res) => {
    try {
        const groupId = parseInt(req.params.id, 10);

        // Check if group exists
        const group = await Group.findByPk(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        // Get all members with user info and role
        const members = await GroupMember.findAll({
            where: { groupId },
            attributes: ["userId", "role"],
            include: [
                {
                    model: User,
                    attributes: ["id", "name", "email"]
                }
            ]
        });

        return res.json({ count: members.length, members });
    } catch (error) {
        console.log("Error in getGroupMembers in groupController.js file");
        res.status(500).json({ message: "Failed to fetch group members", error: error.message });
    }
};

// ...existing code...

// Remove a specific member from a group (admin-only)
exports.removeMember = async (req, res) => {
    try {
        const groupId = parseInt(req.params.id, 10);
        const memberId = parseInt(req.params.memberId, 10);

        // Only group admins can remove members
        const admin = await GroupMember.findOne({ where: { groupId, userId: req.user.id } });
        if (!admin || admin.role !== "admin") {
            return res.status(403).json({ message: "Only group admins can remove members" });
        }

        // Can't remove self as admin
        if (req.user.id === memberId) {
            return res.status(400).json({ message: "Admins cannot remove themselves" });
        }

        const member = await GroupMember.findOne({ where: { groupId, userId: memberId } });
        if (!member) {
            return res.status(404).json({ message: "Member not found in this group" });
        }

        await member.destroy();
        return res.json({ message: "Member removed from group" });
    } catch (error) {
        console.log("Error in removeMember in groupController.js file");
        res.status(500).json({ message: "Failed to remove member", error: error.message });
    }
};

// Remove a specific member from a group (admin-only)
exports.removeMember = async (req, res) => {
    try {
        const groupId = parseInt(req.params.id, 10);
        const memberId = parseInt(req.params.memberId, 10);

        // Only group admins can remove members
        const admin = await GroupMember.findOne({ where: { groupId, userId: req.user.id } });
        if (!admin || admin.role !== "admin") {
            return res.status(403).json({ message: "Only group admins can remove members" });
        }

        // Can't remove self as admin
        if (req.user.id === memberId) {
            return res.status(400).json({ message: "Admins cannot remove themselves" });
        }

        const member = await GroupMember.findOne({ where: { groupId, userId: memberId } });
        if (!member) {
            return res.status(404).json({ message: "Member not found in this group" });
        }

        await member.destroy();
        return res.json({ message: "Member removed from group" });
    } catch (error) {
        console.log("Error in removeMember in groupController.js file");
        res.status(500).json({ message: "Failed to remove member", error: error.message });
    }
};


// Change a specific member's role in a group (admin-only)
exports.changeMemberRole = async (req, res) => {
    try {
        const groupId = parseInt(req.params.id, 10);
        const memberId = parseInt(req.params.memberId, 10);
        const { role } = req.body;

        if (!["admin", "member"].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        // Only group admins can change roles
        const admin = await GroupMember.findOne({ where: { groupId, userId: req.user.id } });
        if (!admin || admin.role !== "admin") {
            return res.status(403).json({ message: "Only group admins can change member roles" });
        }

        // Can't change own role
        if (req.user.id === memberId) {
            return res.status(400).json({ message: "Admins cannot change their own role" });
        }

        const member = await GroupMember.findOne({ where: { groupId, userId: memberId } });
        if (!member) {
            return res.status(404).json({ message: "Member not found in this group" });
        }

        member.role = role;
        await member.save();

        return res.json({ message: "Member role updated", member });
    } catch (error) {
        console.log("Error in changeMemberRole in groupController.js file");
        res.status(500).json({ message: "Failed to change member role", error: error.message });
    }
};