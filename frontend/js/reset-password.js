const API_BASE = "http://localhost:5000";

// Get token from URL
function getToken() {
    const match = window.location.pathname.match(/reset-password\/([a-zA-Z0-9]+)/) ||
        window.location.search.match(/[?&]token=([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
}
const token = getToken() || window.location.pathname.split('/').pop();

document.getElementById("btn-reset").onclick = async () => {
    const password = document.getElementById("reset-password").value.trim();
    if (!password) return;
    try {
        await axios.post(`${API_BASE}/auth/reset-password/${token}`, { password });
        document.getElementById("reset-msg").innerText = "Password reset successful! You can now login.";
    } catch (e) {
        document.getElementById("reset-msg").innerText = e.response?.data?.message || "Reset failed";
    }
};