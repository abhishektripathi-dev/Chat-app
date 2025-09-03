const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const groupRoutes = require('./routes/groupRoutes');
const messageRoutes = require('./routes/messageRoutes');

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

// Make io accessible in controllers
app.set('io', io);

// Routes
app.use('/auth', authRoutes);
app.use('/groups', groupRoutes);
app.use('/groups', messageRoutes);

// Socket.IO logic
io.on('connection', (socket) => {
    // Join a group room
    socket.on('joinGroup', (groupId) => {
        socket.join(`group_${groupId}`);
    });

    // Leave a group room
    socket.on('leaveGroup', (groupId) => {
        socket.leave(`group_${groupId}`);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});