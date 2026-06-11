console.log("auth.js loaded");
const API_URL = "http://localhost:5000/api";

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    // ==========================================
    // 1. XỬ LÝ ĐĂNG NHẬP (LOGIN)
    // ==========================================
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            try {
                const response = await fetch(`${API_URL}/login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    // Lưu token và thông tin vào localStorage
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("userEmail", data.email || email);

                    alert("Đăng nhập thành công!");
                    
                    // SỬA TẠI ĐÂY: Vì index.html nằm chung thư mục html/ với login.html
                    window.location.href = "index.html"; 
                } else {
                    // Hiển thị lỗi cụ thể từ server trả về
                    alert(data.message || "Đăng nhập thất bại. Vui lòng thử lại!");
                }
            } catch (error) {
                console.error("Login Error:", error);
                alert("Không kết nối được server. Hãy chắc chắn Backend đang chạy ở port 5000!");
            }
        });
    }

    // ==========================================
    // 2. XỬ LÝ ĐĂNG KÝ (REGISTER)
    // ==========================================
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirmPassword").value;

            // Kiểm tra mật khẩu khớp nhau ở client trước
            if (password !== confirmPassword) {
                alert("Mật khẩu nhập lại không khớp!");
                return;
            }

            try {
                const response = await fetch(`${API_URL}/register`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    alert("Đăng ký tài khoản thành công!");
                    
                    // SỬA TẠI ĐÂY: Chuyển hướng trực tiếp sang trang login.html cùng cấp
                    window.location.href = "login.html";
                } else {
                    // Hiển thị lỗi cụ thể từ server (Ví dụ: Email đã tồn tại)
                    alert(data.message || "Đăng ký thất bại.");
                }
            } catch (error) {
                console.error("Register Error:", error);
                alert("Không kết nối được server. Hãy chắc chắn Backend đang chạy ở port 5000!");
            }
        });
    }
});