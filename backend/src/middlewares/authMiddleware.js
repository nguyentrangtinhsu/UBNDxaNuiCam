const jwt = require('jsonwebtoken');
const pool = require('../db');

// Middleware kiểm tra token (bắt buộc đăng nhập)
const verifyToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Không có token, truy cập bị từ chối' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Không có token, truy cập bị từ chối' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token không hợp lệ' });
    }
};

// Middleware kiểm tra quyền hạn (permissions)
const hasPermission = (requiredPermissions) => {
    return (req, res, next) => {
        // req.user phải được cung cấp bởi middleware verifyToken chạy trước đó
        if (!req.user || !req.user.permissions) {
            return res.status(403).json({ message: 'Bạn không có quyền thực hiện hành động này.' });
        }
        
        // Admin (full_access) có mọi quyền
        if (req.user.permissions.includes('full_access')) {
            return next();
        }

        const hasRequired = requiredPermissions.every(p => req.user.permissions.includes(p));
        
        if (!hasRequired) {
            return res.status(403).json({ message: 'Bạn không có quyền thực hiện hành động này.' });
        }
        next();
    };
};

// Middleware xác thực token (KHÔNG bắt buộc) (MỚI)
// Mục đích: Giải mã token và gắn req.user nếu có, nhưng không báo lỗi nếu không có token.
// Hữu ích cho các middleware chạy trước như maintenanceMiddleware.
const verifyTokenOptional = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(); // Không có token, bỏ qua
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return next(); // Token rỗng, bỏ qua
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user; // Gắn thông tin người dùng vào request nếu token hợp lệ
    } catch (err) {
        // Token không hợp lệ, không làm gì cả, chỉ đơn giản là không gắn req.user
    }
    next();
};


module.exports = {
    verifyToken,
    hasPermission,
    verifyTokenOptional
};