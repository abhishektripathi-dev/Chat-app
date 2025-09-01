const express = require("express");
const auth = require("../middleware/authMiddleware");
const { sendMessage, getMessages } = require("../controllers/messageController");

const router = express.Router();
router.use(auth);

router.post("/:id/messages", sendMessage); // POST /groups/:id/messages
router.get("/:id/messages", getMessages); //GET /groups/:id/messages?limit=50&offset=0

module.exports = router;