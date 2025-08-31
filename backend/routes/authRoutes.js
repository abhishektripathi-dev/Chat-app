const express = require("express");
const { signup, login, forgotPassword, resetPassword } = require("../controllers/authController");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword); // POST /auth/forgot-password
router.post("/reset-password/:token", resetPassword); // POST /auth/reset-password/:token

module.exports = router;
