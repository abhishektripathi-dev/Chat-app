const express = require("express");
const auth = require("../middleware/authMiddleware");
const { createGroup, addMember, getMyGroups, getGroupMembers, removeMember, changeMemberRole } = require("../controllers/groupController");

const router = express.Router();

router.use(auth); // all routes below are protected

router.post("/", createGroup);                 // POST  /groups
router.post("/:id/members", addMember);        // POST  /groups/:id/members
router.get("/", getMyGroups);                  // GET   /groups
// Route to get all members of a specific group
router.get("/:id/members", getGroupMembers);   // GET   /groups/:id/members
// Route to remove a specific member from a group (admin-only)
router.delete("/:id/members/:memberId", removeMember); // DELETE /groups/:id/members/:memberId
// Route to change a specific member's role in a group (admin-only)
router.patch("/:id/members/:memberId/role", changeMemberRole); // PATCH /groups/:groupId/members/:memberUserId/role

module.exports = router;