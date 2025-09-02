const API_BASE = "http://localhost:5000";
let token = localStorage.getItem("token");
let currentGroupId = null;

function authHeader() {
    return { Authorization: `Bearer ${token}` };
}

function showMessage(msg, type = "system") {
    const log = document.getElementById("log");
    const div = document.createElement("div");
    div.className = `msg ${type}`;
    div.innerText = msg;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
}

function clearChat() {
    document.getElementById("log").innerHTML = "";
}

// Load groups
async function loadGroups() {
    try {
        const res = await axios.get(`${API_BASE}/groups`, {
            headers: authHeader(),
        });
        const list = document.getElementById("group-list");
        list.innerHTML = "";
        (res.data.groups || []).forEach((group) => {
            const item = document.createElement("div");
            item.className = "group-item";
            item.innerText = group.name;
            item.onclick = () => openGroup(group.id, group.name);
            list.appendChild(item);
        });
    } catch (err) { }
}

// Open group
async function openGroup(groupId, groupName) {
    currentGroupId = groupId;
    document.getElementById("chat-group-name").innerText = groupName;
    clearChat();
    await loadMessages();
    await loadMembers();
}

// Helper to get current user ID from token
function getCurrentUserId() {
    try {
        return JSON.parse(atob(token.split('.')[1])).id;
    } catch {
        return null;
    }
}

// In loadMessages()
async function loadMessages() {
    if (!currentGroupId) return;
    try {
        const res = await axios.get(
            `${API_BASE}/groups/${currentGroupId}/messages?limit=50&offset=0`,
            { headers: authHeader() }
        );
        clearChat();
        const messages = res.data.messages || res.data || [];
        const userId = getCurrentUserId();
        messages.forEach(msg => {
            let userName = msg.sender?.name || msg.user || "Unknown";
            userName = userName.charAt(0).toUpperCase() + userName.slice(1);
            const isMe = msg.userId === userId;
            const div = document.createElement("div");
            div.className = "bubble " + (isMe ? "me" : "other");
            div.innerHTML = `<div style="font-size:0.9em;color:#888;">${userName}</div>
                             <div>${msg.text || msg.content}</div>`;
            document.getElementById("log").appendChild(div);
        });
        document.getElementById("log").scrollTop = document.getElementById("log").scrollHeight;
    } catch (err) { }
}

// Send message
async function sendMessage() {
    const input = document.getElementById("msg");
    const text = input.value.trim();
    if (!text || !currentGroupId) return;
    try {
        await axios.post(
            `${API_BASE}/groups/${currentGroupId}/messages`,
            { content: text },
            { headers: authHeader() }
        );
        input.value = "";
        await loadMessages();
    } catch (err) { }
}

// Load members
async function loadMembers() {
    if (!currentGroupId) return;
    try {
        const res = await axios.get(`${API_BASE}/groups/${currentGroupId}/members`, {
            headers: authHeader(),
        });
        const list = document.getElementById("member-list");
        list.innerHTML = "";
        const members = res.data.members || res.data || [];
        document.getElementById("member-count").innerText = members.length;

        // Get current user ID from token
        const userId = JSON.parse(atob(token.split('.')[1])).id;

        members.forEach(m => {
            let name = m.User?.name || m.name || m.email || "Unknown";
            name = name.charAt(0).toUpperCase() + name.slice(1);
            const role = m.role || "member";
            const div = document.createElement("div");
            div.className = "member-item";
            div.innerHTML = `${name} (${role})`;

            // Show role toggle button if not self
            if (m.userId !== userId) {
                const btn = document.createElement("button");
                btn.innerText = role === "admin" ? "Make Member" : "Make Admin";
                btn.onclick = async () => {
                    try {
                        await axios.patch(
                            `${API_BASE}/groups/${currentGroupId}/members/${m.userId}/role`,
                            { role: role === "admin" ? "member" : "admin" },
                            { headers: authHeader() }
                        );
                        await loadMembers();
                    } catch (e) {
                        alert(e.response.data.message);
                        // alert("Failed to change role");
                    }
                };
                div.appendChild(btn);
            }
            list.appendChild(div);
        });
    } catch (err) { }
}

// Add member
async function addMember() {
    const input = document.getElementById("add-member-input");
    const roleSelect = document.getElementById("add-member-role");
    const userIdOrEmail = input.value.trim();
    const role = roleSelect.value;
    if (!userIdOrEmail || !currentGroupId) return;
    try {
        await axios.post(
            `${API_BASE}/groups/${currentGroupId}/members`,
            { email: userIdOrEmail, role },
            { headers: authHeader() }
        );
        input.value = "";
        await loadMembers();
    } catch (err) { }
}

// Create group
async function createGroup() {
    const name = prompt("Enter group name:");
    if (!name) return;
    try {
        await axios.post(
            `${API_BASE}/groups`,
            { name },
            { headers: authHeader() }
        );
        await loadGroups();
    } catch (err) { }
}

// Logout
function logout() {
    localStorage.removeItem("token");
    window.location.href = "auth.html";
}

// Event listeners
document.getElementById("send").addEventListener("click", sendMessage);
document.getElementById("btn-new-group").addEventListener("click", createGroup);
document.getElementById("btn-logout").addEventListener("click", logout);
document.getElementById("btn-members").addEventListener("click", () => {
    document.getElementById("modal-backdrop").style.display = "flex";
});
document.getElementById("btn-close-modal").addEventListener("click", () => {
    document.getElementById("modal-backdrop").style.display = "none";
});
document.getElementById("btn-add-member").addEventListener("click", addMember);
document.getElementById("msg").addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
});
setInterval(loadMessages, 5000);

// Init
if (!token) {
    window.location.href = "auth.html";
} else {
    loadGroups();
}
