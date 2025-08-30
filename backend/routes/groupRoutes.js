const express = require("express");
const auth = require("../middleware/authMiddleware");
const { createGroup, addMember, getMyGroups } = require("../controllers/groupController");

const router = express.Router();

router.use(auth); // all routes below are protected

router.post("/", createGroup);                 // POST  /groups
router.post("/:id/members", addMember);        // POST  /groups/:id/members
router.get("/", getMyGroups);                  // GET   /groups

module.exports = router;