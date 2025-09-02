const API_BASE = "http://localhost:5000";
let token = localStorage.getItem("token");
let currentGroupId = null;

// Pagination state
let limit = 50;
let offset = 0;
let allLoaded = false;
let messagesCache = [];

// Helper: Authorization header
function authHeader() {
    return { Authorization: `Bearer ${token}` };
}

// Helper: Get current user ID from JWT token
function getCurrentUserId() {
    try {
        return JSON.parse(atob(token.split('.')[1])).id;
    } catch {
        return null;
    }
}

// Clear chat log
function clearChat() {
    document.getElementById("log").innerHTML = "";
}

// ========== GROUPS ==========

// Load all groups for the current user
async function loadGroups() {
    try {
        const res = await axios.get(`${API_BASE}/groups`, { headers: authHeader() });
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

// Open a group: reset pagination, load messages and members
async function openGroup(groupId, groupName) {
    currentGroupId = groupId;
    document.getElementById("chat-group-name").innerText = groupName;
    clearChat();
    limit = 50;
    offset = 0;
    allLoaded = false;
    messagesCache = [];
    await loadMessages();
    await loadMembers();
}

// ========== MESSAGES & PAGINATION ==========

// Load messages with pagination
async function loadMessages({ append = false } = {}) {
    if (!currentGroupId) return;
    try {
        const res = await axios.get(
            `${API_BASE}/groups/${currentGroupId}/messages?limit=${limit}&offset=${offset}`,
            { headers: authHeader() }
        );
        const messages = res.data.messages || res.data || [];
        if (messages.length < limit) allLoaded = true;
        if (append) {
            messagesCache = [...messages, ...messagesCache];
        } else {
            messagesCache = messages;
        }
        renderMessages(messagesCache, append);
        document.getElementById("btn-load-prev").style.display = allLoaded ? "none" : "";
    } catch (err) { }
}

// Render messages in chat log
function renderMessages(list, append) {
    const log = document.getElementById("log");
    if (!append) log.innerHTML = "";
    const userId = getCurrentUserId();
    let prevHeight = log.scrollHeight;

    list.forEach((msg, idx) => {
        // Avoid duplicate DOM nodes when appending
        if (append && idx < limit) return;
        let userName = msg.sender?.name || msg.user?.name || msg.user || "Unknown";
        userName = userName.charAt(0).toUpperCase() + userName.slice(1);
        const isMe = msg.userId === userId;
        const div = document.createElement("div");
        div.className = "bubble " + (isMe ? "me" : "other");
        div.innerHTML = `<div style="font-size:0.9em;color:#888;">${userName}</div>
                         <div>${msg.text || msg.content}</div>`;
        log.appendChild(div);
    });

    // Scroll to bottom if not appending, else maintain scroll position
    if (!append) {
        log.scrollTop = log.scrollHeight;
    } else {
        log.scrollTop = log.scrollHeight - prevHeight;
    }
}

// Load previous messages (pagination)
document.getElementById("btn-load-prev").onclick = async () => {
    offset += limit;
    await loadMessages({ append: true });
};

// Send a new message
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
        // Reset pagination to show latest messages
        limit = 50;
        offset = 0;
        allLoaded = false;
        messagesCache = [];
        await loadMessages();
    } catch (err) { }
}

// ========== MEMBERS ==========

// Load members of the current group
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

        const userId = getCurrentUserId();

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
                        alert(e.response?.data?.message || "Failed to change role");
                    }
                };
                div.appendChild(btn);
            }
            list.appendChild(div);
        });
    } catch (err) { }
}

// Add a member with role selection
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

// ========== GROUP CREATION ==========

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

// ========== AUTH ==========

function logout() {
    localStorage.removeItem("token");
    window.location.href = "auth.html";
}

// ========== EVENT LISTENERS ==========

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

// Poll for new messages every 5 seconds (only latest page)
setInterval(() => {
    if (offset === 0) loadMessages();
}, 5000);

// ========== INIT ==========

if (!token) {
    window.location.href = "auth.html";
} else {
    loadGroups();
}