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