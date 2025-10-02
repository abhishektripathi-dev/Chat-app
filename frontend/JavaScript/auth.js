export function checkAuth() {
    if (!localStorage.getItem("token")) {
        window.location.href = "auth.html";
    }
}

export function logout() {
    localStorage.removeItem("token");
    window.location.href = "auth.html";
}