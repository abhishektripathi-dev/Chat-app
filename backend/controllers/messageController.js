const { Message, GroupMember } = require("../models")

// Send message in a group (user must be member)
exports.sendMessage = async (req, res) => {
    try {
        const userId = req.user.id;
        const groupId = parseInt(req.params.id, 10);
        const { content } = req.body;

        if (!content?.trim()) return res.status(400).json({ message: "Message content required" });

        // check membership
        const membership = await GroupMember.findOne({ where: { groupId, userId } });
        if (!membership) return res.status(403).json({ message: "You are not member of this group" });

        const message = await Message.create({ content: content.trim(), userId, groupId });
        return res.status(201).json({ message: "Message sent", data: message });

    } catch (error) {
        console.log("Error in sendMessage controller", error);
        res.status(500).json({ message: "Send message failed", error: error.message });
    }
};

// Get messages of a group (pagination supported)
exports.getMessages = async (req, res) => {

    try {
        const userId = req.user.id;
        const groupId = parseInt(req.params.id, 10);
        const limit = parseInt(req.query.limit, 10) || 50;
        const offset = parseInt(req.query.offset, 10) || 0;

        // membership check
        const membership = await GroupMember.findOne({ where: { groupId, userId } });
        if (!membership) return res.status(403).json({ message: "You are not member of this group" });

        const messages = await Message.findAll({
            where: { groupId },
            order: [["id", "ASC"]],
            limit,
            offset,
            include: [{ association: "sender", attributes: ["id", "name", "email", "createdAt"] }]
        })

        return res.json({ count: messages.length, messages });

    } catch (error) {
        console.log("Error in getMessages controller", error);
        return res.status(500).json({ message: "Get messages failed", error: error.message });
    }

};