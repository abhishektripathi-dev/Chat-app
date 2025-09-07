const { Message, User, ArchivedMessage } = require("../models");
const path = require('path');

exports.sendMessage = async (req, res) => {
    try {
        const groupId = parseInt(req.params.groupId, 10);
        const { content } = req.body;
        if (!content || !content.trim()) {
            return res.status(400).json({ message: "Message content required" });
        }
        const message = await Message.create({
            groupId,
            userId: req.user.id,
            content: content.trim()
        });
        const user = await User.findByPk(req.user.id, { attributes: ['id', 'name', 'email'] });
        const msgToSend = {
            id: message.id,
            groupId: message.groupId,
            userId: message.userId,
            content: message.content,
            fileUrl: message.fileUrl,
            createdAt: message.createdAt,
            user: user ? { id: user.id, name: user.name, email: user.email } : null
        };
        const io = req.app.get('io');
        io.to(`group_${groupId}`).emit('newMessage', msgToSend);
        res.status(201).json(msgToSend);
    } catch (error) {
        console.error("Error in sendMessage:", error);
        res.status(500).json({ message: "Failed to send message" });
    }
};

exports.sendMediaMessage = async (req, res) => {
    try {
        const groupId = parseInt(req.params.groupId, 10);
        const userId = req.user.id;
        const file = req.file;
        const content = req.body.content || '';
        if (!file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const fileUrl = `/uploads/${file.filename}`;
        const message = await Message.create({
            groupId,
            userId,
            content,
            fileUrl,
        });
        const user = await User.findByPk(userId, { attributes: ['id', 'name', 'email'] });
        const msgToSend = {
            id: message.id,
            groupId: message.groupId,
            userId: message.userId,
            content: message.content,
            fileUrl: message.fileUrl,
            createdAt: message.createdAt,
            user: user ? { id: user.id, name: user.name, email: user.email } : null
        };
        const io = req.app.get('io');
        io.to(`group_${groupId}`).emit('newMessage', msgToSend);
        res.status(201).json(msgToSend);
    } catch (error) {
        console.error("Error in sendMediaMessage:", error);
        res.status(500).json({ message: "Failed to send media message" });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const groupId = parseInt(req.params.groupId, 10);
        const messages = await Message.findAll({
            where: { groupId },
            include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'email'] }],
            order: [['createdAt', 'ASC']]
        });
        res.json({ messages });
    } catch (error) {
        console.error("Error in getMessages controller", error);
        res.status(500).json({ message: "Failed to fetch messages" });
    }
};

exports.getArchivedMessages = async (req, res) => {
    try {
        const groupId = parseInt(req.params.groupId, 10);
        // Fetch all archived messages for the group, newest first
        const messages = await ArchivedMessage.findAll({
            where: { groupId },
            order: [['createdAt', 'ASC']]
        });
        res.json({ messages });
    } catch (error) {
        console.error("Error in getArchivedMessages controller", error);
        res.status(500).json({ message: "Failed to fetch archived messages" });
    }
};