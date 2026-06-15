// Tạo ID người dùng ngẫu nhiên
function generateUserId() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let id = "FMN-";

    for (let i = 0; i < 6; i++) {
        id += chars.charAt(
            Math.floor(Math.random() * chars.length)
        );
    }

    return id;
}

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
        id: generateUserId(), // <-- ID ngẫu nhiên
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










const user = JSON.parse(localStorage.getItem("currentUser"));

if(user){

    if(!user.id){
        user.id = "FMN-" +
            Math.random().toString(36)
            .substring(2,8)
            .toUpperCase();

        localStorage.setItem(
            user.email,
            JSON.stringify(user)
        );

        localStorage.setItem(
            "currentUser",
            JSON.stringify(user)
        );
    }

    document.getElementById("sidebarUserName").textContent =
        user.name;

    document.getElementById("sidebarUserId").textContent =
        user.id;
}