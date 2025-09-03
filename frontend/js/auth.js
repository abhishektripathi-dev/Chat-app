const API_BASE = "http://localhost:5000";

// Show/hide forms
function show(id) {
    document.querySelectorAll('.auth-container').forEach(div => div.style.display = 'none');
    document.getElementById(id).style.display = '';
}
document.getElementById("show-register").onclick = () => show("register-container");
document.getElementById("show-login").onclick = () => show("login-container");
document.getElementById("show-login2").onclick = () => show("login-container");
document.getElementById("show-forgot").onclick = () => show("forgot-container");

// Login
document.getElementById("btn-login").onclick = async () => {
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();
    try {
        const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
        localStorage.setItem("token", res.data.token);
        window.location.href = "chat.html";
    } catch (e) {
        document.getElementById("login-error").innerText = e.response?.data?.message || "Login failed";
    }
};

// Register
document.getElementById("btn-register").onclick = async () => {
    const name = document.getElementById("register-name").value.trim();
    const phone = document.getElementById("register-phone").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const password = document.getElementById("register-password").value.trim();
    try {
        await axios.post(`${API_BASE}/auth/signup`, { name, phone, email, password });

        show("login-container");
    } catch (e) {
        document.getElementById("register-error").innerText = e.response?.data?.message || "Register failed";
    }
};

// Forgot password
document.getElementById("btn-forgot").onclick = async () => {
    const email = document.getElementById("forgot-email").value.trim();
    try {
        await axios.post(`${API_BASE}/auth/forgot-password`, { email });
        document.getElementById("forgot-msg").innerText = "Reset link sent! Check your email.";
    } catch (e) {
        document.getElementById("forgot-msg").innerText = e.response?.data?.message || "Failed to send reset link";
    }
};