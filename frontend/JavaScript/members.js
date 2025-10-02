import { API_BASE, authHeader } from './api.js';
import { getCurrentUserId } from './messages.js';

export async function loadMembers(currentGroupId) {
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
        const me = members.find(m => m.userId === userId);
        const myRole = me?.role || "member";

        members.forEach(m => {
            let name = m.User?.name || m.name || m.email || "Unknown";
            name = name.charAt(0).toUpperCase() + name.slice(1);
            const role = m.role || "member";
            const div = document.createElement("div");
            div.className = "member-item";
            div.innerHTML = `${name} (${role})`;

            if (m.userId !== userId) {
                // Change role button
                const btnRole = document.createElement("button");
                btnRole.innerText = role === "admin" ? "Make Member" : "Make Admin";
                btnRole.onclick = async () => {
                    try {
                        await axios.patch(
                            `${API_BASE}/groups/${currentGroupId}/members/${m.userId}/role`,
                            { role: role === "admin" ? "member" : "admin" },
                            { headers: authHeader() }
                        );
                        await loadMembers(currentGroupId);
                    } catch (e) {
                        alert(e.response?.data?.message || "Failed to change role");
                    }
                };
                div.appendChild(btnRole);

                // Remove button (only if current user is admin)
                if (myRole === "admin") {
                    const btnRemove = document.createElement("button");
                    btnRemove.innerText = "Remove";
                    btnRemove.style.marginLeft = "8px";
                    btnRemove.onclick = async () => {
                        if (!confirm(`Remove ${name} from group?`)) return;
                        try {
                            await axios.delete(
                                `${API_BASE}/groups/${currentGroupId}/members/${m.userId}`,
                                { headers: authHeader() }
                            );
                            await loadMembers(currentGroupId);
                        } catch (e) {
                            alert(e.response?.data?.message || "Failed to remove member");
                        }
                    };
                    div.appendChild(btnRemove);
                }
            }
            list.appendChild(div);
        });
    } catch (err) { }
}

export async function addMember(currentGroupId) {
    const input = document.getElementById("add-member-input");
    const roleSelect = document.getElementById("add-member-role");
    const userIdOrEmail = input.value.trim();
    const role = roleSelect.value;
    const errorDiv = document.getElementById("add-member-error");
    if (errorDiv) errorDiv.innerText = "";

    if (!userIdOrEmail || !currentGroupId) return;
    try {
        await axios.post(
            `${API_BASE}/groups/${currentGroupId}/members`,
            { email: userIdOrEmail, role },
            { headers: authHeader() }
        );
        input.value = "";
        if (errorDiv) errorDiv.innerText = "";
        await loadMembers(currentGroupId);
    } catch (err) {
        let msg = err.response?.data?.message || "Failed to add member";
        if (errorDiv) {
            errorDiv.innerText = msg;
            errorDiv.style.color = "red";
        } else {
            alert(msg);
        }
    }
}