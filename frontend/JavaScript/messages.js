import { API_BASE, authHeader } from './api.js';
import { socket } from './socket.js';
import { loadMembers } from './members.js';

export let currentGroupId = null;
export let messagesCache = [];

export function getCurrentUserId() {
    try {
        return JSON.parse(atob(localStorage.getItem("token").split('.')[1])).id;
    } catch {
        return null;
    }
}

export async function openGroup(groupId, groupName) {
    if (currentGroupId) socket.emit('leaveGroup', currentGroupId);
    currentGroupId = groupId;
    socket.emit('joinGroup', groupId);

    document.getElementById("chat-group-name").innerText = groupName;
    clearChat();
    messagesCache = [];
    await loadMessages();
    await loadMembers(currentGroupId);

    // Show the archived chat button
    document.getElementById("btn-archived-chat").style.display = "";
}

export async function loadMessages() {
    if (!currentGroupId) return;
    try {
        const res = await axios.get(
            `${API_BASE}/groups/${currentGroupId}/messages`,
            { headers: authHeader() }
        );
        const messages = res.data.messages || res.data || [];
        messagesCache = messages;
        renderMessages(messagesCache);
    } catch (err) { }
}

// Load all archived messages for the current group
export async function loadArchivedMessages() {
    if (!currentGroupId) return;
    try {
        const res = await axios.get(
            `${API_BASE}/groups/${currentGroupId}/archived-messages`,
            { headers: authHeader() }
        );
        const messages = res.data.messages || [];
        renderMessages(messages, false);
    } catch (err) {
        alert("Failed to load archived messages");
    }
}

export function renderMessages(list) {
    const log = document.getElementById("log");
    log.innerHTML = "";
    const userId = getCurrentUserId();

    list.forEach((msg) => {
        // System message
        if (msg.system) {
            const dt = new Date(msg.createdAt);
            const timeStr = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const div = document.createElement("div");
            div.className = "bubble system";
            div.style.textAlign = "center";
            div.style.background = "none";
            div.style.color = "#888";
            div.innerHTML = `<span>${msg.content} <span style="font-size:0.85em;">(${timeStr})</span></span>`;
            log.appendChild(div);
            return;
        }

        let userName = msg.user?.name || msg.User?.name || msg.user || "Unknown";
        userName = userName.charAt(0).toUpperCase() + userName.slice(1);
        const isMe = msg.userId === userId;
        const dt = new Date(msg.createdAt || msg.created_at);
        const dateStr = dt.toLocaleDateString();
        const timeStr = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const div = document.createElement("div");
        div.className = "bubble " + (isMe ? "me" : "other");
        div.innerHTML = `
            <div style="display:flex;justify-content:space-between;font-size:0.9em;color:#888;">
                <span>${userName}</span>
                <span>${dateStr} ${timeStr}</span>
            </div>
            <div>${msg.text || msg.content || ""}</div>
            ${msg.fileUrl ? renderMedia(msg.fileUrl) : ""}
        `;
        log.appendChild(div);
    });

    log.scrollTop = log.scrollHeight;
}

function renderMedia(fileUrl) {
    const ext = fileUrl.split('.').pop().toLowerCase();
    const fullUrl = API_BASE + fileUrl;
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) {
        return `<div style="margin-top:6px;"><img src="${fullUrl}" style="max-width:200px;max-height:200px;border-radius:8px;"></div>`;
    }
    if (['mp4', 'webm', 'ogg'].includes(ext)) {
        return `<div style="margin-top:6px;"><video controls style="max-width:200px;max-height:200px;border-radius:8px;"><source src="${fullUrl}"></video></div>`;
    }
    if (['mp3', 'wav', 'ogg'].includes(ext)) {
        return `<div style="margin-top:6px;"><audio controls style="width:200px;"><source src="${fullUrl}"></audio></div>`;
    }
    return `<div style="margin-top:6px;"><a class="chip" href="${fullUrl}" target="_blank">📎 Download File</a></div>`;
}

export async function sendMessage() {
    const input = document.getElementById("msg");
    const fileInput = document.getElementById("file-input");
    const text = input.value.trim();
    const file = fileInput.files[0];

    if (!currentGroupId) return;

    try {
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('content', text);

            await axios.post(
                `${API_BASE}/groups/${currentGroupId}/messages/media`,
                formData,
                {
                    headers: {
                        ...authHeader(),
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            fileInput.value = "";
        } else if (text) {
            await axios.post(
                `${API_BASE}/groups/${currentGroupId}/messages`,
                { content: text },
                { headers: authHeader() }
            );
        }
        input.value = "";
    } catch (err) { }
}

export function handleNewMessage(msg) {
    if (msg.groupId !== currentGroupId) return;
    messagesCache.push(msg);
    renderMessages(messagesCache);
}

export function handleSystemMessage(msg) {
    if (msg.groupId !== currentGroupId) return;
    messagesCache.push({
        content: msg.content,
        createdAt: msg.createdAt,
        system: true
    });
    renderMessages(messagesCache);
}

export function clearChat() {
    document.getElementById("log").innerHTML = "";
}