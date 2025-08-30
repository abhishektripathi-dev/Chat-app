// protect routes

const jwt = require("jsonwebtoken");
const JWT_SECRET = "your_secret_key"; // move to .env in production

module.exports = function auth(req, res, next) {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res
                .status(401)
                .json({ message: "Access token missing or invalid" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = { id: decoded.id };
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid/Expired token" });
    }
};
