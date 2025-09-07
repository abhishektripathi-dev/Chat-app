const express = require("express");

const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/multer");

const {
    sendMessage,
    getMessages,
    sendMediaMessage,
} = require("../controllers/messageController");
const { getArchivedMessages } = require("../controllers/messageController");

const router = express.Router();
router.use(auth);

router.post("/:groupId/messages", sendMessage);
router.get("/:groupId/messages", getMessages);
router.post("/:groupId/messages/media", upload.single("file"), sendMediaMessage);
router.get("/:groupId/archived-messages", getArchivedMessages);


module.exports = router;

// POST /groups/:id/messages\
// GET /groups/:id/messages?limit=50&offset=0
// route for media messages`1
