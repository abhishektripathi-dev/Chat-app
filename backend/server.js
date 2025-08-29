const express = require("express");
const bodyParser = require("body-parser");
const sequelize = require("./config/db");
const User = require("./models/User"); // import model to sync
const authRoutes = require("./routes/authRoutes");

const app = express();
app.use(bodyParser.json());

// Routes
app.use("/auth", authRoutes);

// DB Sync + Server Start
sequelize
    .sync()
    .then(() => {
        console.log("Database synced");
        app.listen(5000, () => console.log("Server running on port 5000"));
    })
    .catch((err) => console.log("DB error:", err));
