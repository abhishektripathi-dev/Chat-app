// const express = require("express");
// const bodyParser = require("body-parser");
// const cors = require("cors");
// const { sequelize } = require("./models") // <- from models/index.js ->

// const authRoutes = require("./routes/authRoutes");
// const groupRoutes = require("./routes/groupRoutes");
// const messageRoutes = require("./routes/messageRoutes");
// require("dotenv").config();

// const PORT = process.env.PORT;

// const app = express();

// app.use(cors());
// app.use(bodyParser.json());

// // Routes
// app.use("/auth", authRoutes);
// app.use("/groups", groupRoutes);
// app.use("/groups", messageRoutes);

// // DB Sync + Server Start
// sequelize
//     .sync()  // .sync({alter:true}) during dev if you tweak models
//     .then(() => {
//         console.log("Database synced");
//         app.listen(PORT || 5000, () => {
//             console.log(`Server is running on PORT ${PORT}`);
//         });
//     })
//     .catch((err) => console.log("DB error:", err));

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
    socket.on('joinGroup', (groupId) => {
        socket.join(`group_${groupId}`);
    });
    socket.on('leaveGroup', (groupId) => {
        socket.leave(`group_${groupId}`);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});