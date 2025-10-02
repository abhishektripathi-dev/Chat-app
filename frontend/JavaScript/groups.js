import { API_BASE, authHeader } from './api.js';
import { openGroup } from './messages.js';

export async function loadGroups() {
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

export async function createGroup() {
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