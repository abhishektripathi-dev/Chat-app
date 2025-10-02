export const API_BASE = "http://localhost:5000";

export function authHeader() {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
}