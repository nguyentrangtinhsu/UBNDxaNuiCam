const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Nạp các tệp định tuyến
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const taskRoutes = require('./src/routes/taskRoutes');
const roleRoutes = require('./src/routes/roleRoutes');
const departmentRoutes = require('./src/routes/departmentRoutes');
const reportRoutes = require('./src/routes/reportRoutes');
const auditLogRoutes = require('./src/routes/auditLogRoutes');
// --- CÁC TỆP MỚI ---
const systemSettingsRoutes = require('./src/routes/systemSettingsRoutes'); // Route quản lý cài đặt
const { verifyTokenOptional } = require('./src/middlewares/authMiddleware'); // Middleware xác thực không bắt buộc
const maintenanceMiddleware = require('./src/middlewares/maintenanceMiddleware'); // Middleware kiểm tra bảo trì

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares cơ bản
app.use(cors());
app.use(express.json());

// --- MIDDLEWARES ĐẠI TU ---
// 1. Xác thực token (không bắt buộc): Middleware này sẽ giải mã token và gắn `req.user` nếu có.
//    Điều này cần thiết để middleware bảo trì biết người dùng có phải là Admin hay không.
app.use(verifyTokenOptional);

// 2. Kiểm tra bảo trì: Middleware này sẽ chặn tất cả yêu cầu (trừ Admin) nếu hệ thống đang bảo trì.
// app.use(maintenanceMiddleware);
// --- KẾT THÚC MIDDLEWARES ĐẠI TU ---


// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/system', systemSettingsRoutes); // Đăng ký route quản lý cài đặt hệ thống

// Cấu hình cho Production (nếu cần)
// app.use(express.static(path.join(__dirname, '../frontend/build')));
// app.get('*', (req, res) => {
//     res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
// });

app.listen(PORT, () => {
    console.log(`Máy chủ đang chạy tại http://localhost:${PORT}`);
});