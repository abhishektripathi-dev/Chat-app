const { Message, GroupMember, User } = require("../models")

// Send message in a group (user must be member)
// exports.sendMessage = async (req, res) => {
//     try {
//         const userId = req.user.id;
//         const groupId = parseInt(req.params.id, 10);
//         const { content } = req.body;

//         if (!content?.trim()) return res.status(400).json({ message: "Message content required" });

//         // check membership
//         const membership = await GroupMember.findOne({ where: { groupId, userId } });
//         if (!membership) return res.status(403).json({ message: "You are not member of this group" });

//         const message = await Message.create({ content: content.trim(), userId, groupId });
//         return res.status(201).json({ message: "Message sent", data: message });

//     } catch (error) {
//         console.log("Error in sendMessage controller", error);
//         res.status(500).json({ message: "Send message failed", error: error.message });
//     }
// };
// const { Message, User } = require("../models");

exports.sendMessage = async (req, res) => {
    try {
        const groupId = parseInt(req.params.id, 10);
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({ message: "Message content required" });
        }

        // Save message
        const message = await Message.create({
            groupId,
            userId: req.user.id,
            content: content.trim()
        });

        // Fetch user info for broadcasting
        const user = await User.findByPk(req.user.id, { attributes: ['id', 'name', 'email'] });
        const msgToSend = {
            id: message.id,
            groupId: message.groupId,
            userId: message.userId,
            content: message.content,
            createdAt: message.createdAt,
            sender: user ? { id: user.id, name: user.name, email: user.email } : null
        };

        // Emit to group via Socket.IO
        const io = req.app.get('io');
        io.to(`group_${groupId}`).emit('newMessage', msgToSend);

        res.status(201).json(msgToSend);
    } catch (error) {
        console.error("Error in sendMessage:", error);
        res.status(500).json({ message: "Failed to send message" });
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