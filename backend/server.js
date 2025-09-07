const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const cron = require('node-cron');
const { sequelize, Message, ArchivedMessage } = require('./models');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PATCH", "DELETE"]
    }
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Make io accessible in controllers
app.set('io', io);

// Routes
app.use('/auth', require('./routes/authRoutes'));
app.use('/groups', require('./routes/groupRoutes'));
app.use('/groups', require('./routes/messageRoutes'));

// Socket.IO logic
io.on('connection', (socket) => {
    socket.on('joinGroup', (groupId) => {
        socket.join(`group_${groupId}`);
    });
    socket.on('leaveGroup', (groupId) => {
        socket.leave(`group_${groupId}`);
    });
});

// Archive messages older than 1 day every night at 2:00 AM
cron.schedule('0 2 * * *', async () => {
    try {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const oldMessages = await Message.findAll({
            where: { createdAt: { [require('sequelize').Op.lt]: oneDayAgo } },
            raw: true
        });
        if (oldMessages.length === 0) return;
        await ArchivedMessage.bulkCreate(oldMessages);
        const ids = oldMessages.map(m => m.id);
        await Message.destroy({ where: { id: ids } });
        console.log(`Archived and deleted ${oldMessages.length} messages`);
    } catch (err) {
        console.error("Error archiving messages:", err);
    }
});

sequelize.sync()

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});