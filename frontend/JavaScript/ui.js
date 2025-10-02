import { sendMessage, openGroup, loadMessages, currentGroupId, loadArchivedMessages } from './messages.js';
import { loadGroups, createGroup } from './groups.js';
import { loadMembers, addMember } from './members.js';
import { logout } from './auth.js';

export function initUI() {
    document.getElementById("send").addEventListener("click", sendMessage);
    document.getElementById("btn-new-group").addEventListener("click", createGroup);
    document.getElementById("btn-logout").addEventListener("click", logout);
    document.getElementById("btn-members").addEventListener("click", () => {
        document.getElementById("modal-backdrop").style.display = "flex";
        loadMembers(currentGroupId);
    });
    document.getElementById("btn-close-modal").addEventListener("click", () => {
        document.getElementById("add-member-error").innerText = ""
        document.getElementById("modal-backdrop").style.display = "none";
    });
    document.getElementById("btn-add-member").addEventListener("click", () => addMember(currentGroupId));
    document.getElementById("msg").addEventListener("keydown", (e) => {
        if (e.key === "Enter") sendMessage();
    });
    // Only show archived chat button when a group is selected
    document.getElementById("btn-archived-chat").addEventListener("click", async () => {
        await loadArchivedMessages();
    });
    loadGroups();
}