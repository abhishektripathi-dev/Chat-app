const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { User, PasswordResetToken } = require("../models");
const crypto = require("crypto");
const brevo = require("@getbrevo/brevo");
require("dotenv").config();


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

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
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


// Send password reset link
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });

        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Generate token and expiry (1 hour)
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 3600000);

        // Remove old tokens for this user
        await PasswordResetToken.destroy({ where: { userId: user.id } });

        // Save new token
        await PasswordResetToken.create({
            userId: user.id,
            token,
            expiresAt,
        });

        // Send email via Brevo
        const apiInstance = new brevo.TransactionalEmailsApi();
        apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
        const sendSmtpEmail = {
            to: [{ email: user.email, name: user.name }],
            sender: { email: process.env.BREVO_SENDER_EMAIL, name: "Chat App" },
            subject: "Password Reset Request",
            htmlContent: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link is valid for 1 hour.</p>`
        };

        await apiInstance.sendTransacEmail(sendSmtpEmail);

        res.json({ message: "Password reset link sent to your email" });
    } catch (error) {
        console.log("Error in forgotPassword:", error);
        res.status(500).json({ message: "Failed to send reset link", error: error.message });
    }
};

// Reset password using token
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password) return res.status(400).json({ message: "Password is required" });

        const resetToken = await PasswordResetToken.findOne({
            where: {
                token,
                expiresAt: { [Op.gt]: new Date() }
            }
        });

        if (!resetToken) return res.status(400).json({ message: "Invalid or expired token" });

        const user = await User.findByPk(resetToken.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const hasedPassword = await bcrypt.hash(password, 10)
        user.password = hasedPassword; // Make sure password is hashed in User model
        await user.save();

        // Remove token after use
        await resetToken.destroy();

        res.json({ message: "Password has been reset successfully" });
    } catch (error) {
        console.log("Error in resetPassword:", error);
        res.status(500).json({ message: "Failed to reset password", error: error.message });
    }
};