const express = require("express");
const bodyParser = require("body-parser");
const { sequelize } = require("./models") // <- from models/index.js ->

const authRoutes = require("./routes/authRoutes");
const groupRoutes = require("./routes/groupRoutes");

const app = express();
app.use(bodyParser.json());

// Routes
app.use("/auth", authRoutes);
app.use("/groups", groupRoutes)

// DB Sync + Server Start
sequelize
    .sync()  // .sync({alter:true}) during dev if you tweak models
    .then(() => {
        console.log("Database synced");
        app.listen(5000, () => console.log("Server running on port 5000"));
    })
    .catch((err) => console.log("DB error:", err));
