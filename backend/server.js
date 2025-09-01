const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { sequelize } = require("./models") // <- from models/index.js ->

const authRoutes = require("./routes/authRoutes");
const groupRoutes = require("./routes/groupRoutes");
const messageRoutes = require("./routes/messageRoutes");
require("dotenv").config();

const PORT = process.env.PORT;

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/auth", authRoutes);
app.use("/groups", groupRoutes);
app.use("/groups", messageRoutes);

// DB Sync + Server Start
sequelize
    .sync()  // .sync({alter:true}) during dev if you tweak models
    .then(() => {
        console.log("Database synced");
        app.listen(PORT || 5000, () => {
            console.log(`Server is running on PORT ${PORT}`);
        });
    })
    .catch((err) => console.log("DB error:", err));
