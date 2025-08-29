const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const User = require("../models/User");

const JWT_SECRET = "your_secret_key";

// Signup Controller
exports.signup = async (req, res) => {
    try {
        const { name, phone, email, password } = req.body;

        // check if user exists
        // const existingUser = await User.findOne({ where: { email } });

        const existingUser = await User.findOne({
            where: {
                [Op.or]: [{ email }, { phone }],
            },
        });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // hash password
        const hasedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            phone,
            email,
            password: hasedPassword,
        });

        res.status(201).json({ message: "User created", userId: user.id });
    } catch (error) {
        console.log("Error in Signup controller in authController.js file");
        res.status(500).json({
            message: "Signup failed",
            error: error.message,
        });
    }
};

// Login Controller
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user.id }, JWT_SECRET, {
            expiresIn: "1h",
        });

        res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email },
        });
    } catch (error) {
        console.log("error in signin controller in authController.js file");
        res.status(500).json({ message: "Login failed", error: error.message });
    }
};
