// Đăng ký
function register() {

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!name || !email || !password) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }

    if (localStorage.getItem(email)) {
        alert("Email đã tồn tại!");
        return;
    }

    const user = {
        id: "FMN" + Date.now().toString().slice(-6),
        name: name,
        email: email,
        password: password,
        streak: 0,
        createdAt: new Date().toLocaleDateString("vi-VN")
    };

    localStorage.setItem(email, JSON.stringify(user));

    alert("Đăng ký thành công!");
    window.location.href = "/html/login.html";
}

// Đăng nhập
function login() {

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const user = JSON.parse(localStorage.getItem(email));

    if (!user) {
        alert("Tài khoản không tồn tại!");
        return;
    }

    if (user.password !== password) {
        alert("Sai mật khẩu!");
        return;
    }

    localStorage.setItem("currentUser", JSON.stringify(user));

    alert("Đăng nhập thành công!");
    window.location.href = "index.html";
}

// Đăng xuất
function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
}

// Kiểm tra đăng nhập
function checkAuth() {
    const user = localStorage.getItem("currentUser");

    if (!user) {
        window.location.href = "login.html";
    }
}

// Lấy thông tin user hiện tại
function getCurrentUser() {
    return JSON.parse(localStorage.getItem("currentUser"));
}