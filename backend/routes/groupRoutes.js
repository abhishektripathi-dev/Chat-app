const express = require("express");
const auth = require("../middleware/authMiddleware");
const { createGroup, addMember, getMyGroups, getGroupMembers, removeMember, changeMemberRole } = require("../controllers/groupController");

const router = express.Router();

router.use(auth); // all routes below are protected

router.post("/", createGroup);                 
router.post("/:groupId/members", addMember);        
router.get("/", getMyGroups);                  
router.get("/:groupId/members", getGroupMembers);   
router.delete("/:groupId/members/:memberId", removeMember); 
router.patch("/:groupId/members/:memberId/role", changeMemberRole); 

module.exports = router;

// POST  /groups
// POST  /groups/:id/members
// GET   /groups
// Route to get all members of a specific group
// GET   /groups/:id/members
// Route to remove a specific member from a group (admin-only)
// DELETE /groups/:id/members/:memberId
// Route to change a specific member's role in a group (admin-only)
// PATCH /groups/:groupId/members/:memberUserId/role