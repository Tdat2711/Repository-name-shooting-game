require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Kết nối Cơ sở dữ liệu
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error("Lỗi kết nối MySQL:", err);
        return;
    }
    console.log("MySQL Connected");
});

// ==========================================
// 1. ROUTE ĐĂNG KÝ (REGISTER)
// ==========================================
app.post("/api/register", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Vui lòng nhập đầy đủ thông tin"
            });
        }

        // Kiểm tra trùng email
        const [rows] = await db.promise().query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (rows.length > 0) {
            return res.status(400).json({
                message: "Email đã tồn tại"
            });
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Lưu vào DB
        await db.promise().query(
            "INSERT INTO users (email, password) VALUES (?, ?)",
            [email, hashedPassword]
        );

        return res.status(201).json({
            message: "Đăng ký thành công"
        });

    } catch (error) {
        console.error("Register Error:", error);
        return res.status(500).json({
            message: "Lỗi server"
        });
    }
});

// ==========================================
// 2. ROUTE ĐĂNG NHẬP (LOGIN)
// ==========================================
app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Vui lòng điền đầy đủ email và mật khẩu"
            });
        }

        // Kiểm tra tài khoản tồn tại
        const [rows] = await db.promise().query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                message: "Email không tồn tại"
            });
        }

        const user = rows[0];

        // So khớp mật khẩu đã mã hóa
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Sai mật khẩu"
            });
        }

        // Tạo Token JWT (Sử dụng JWT_SECRET phòng hờ nếu .env lỗi)
        const secretKey = process.env.JWT_SECRET || "MY_BACKUP_SECRET_KEY";
        const token = jwt.sign(
            {
                id: user.id, // Đảm bảo cột này trùng tên với cột ID trong DB của bạn
                email: user.email
            },
            secretKey,
            { expiresIn: "1d" }
        );

        return res.json({
            token,
            email: user.email
        });

    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({
            message: "Lỗi server"
        });
    }
});

// Chạy Server (Lấy port từ .env, nếu không có thì mặc định chạy port 5000)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});