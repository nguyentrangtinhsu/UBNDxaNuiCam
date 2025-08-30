const pool = require('../db');

const maintenanceMiddleware = async (req, res, next) => {
    try {
        const settingsRes = await pool.query("SELECT value FROM system_settings WHERE key = 'maintenance_mode'");
        const maintenanceConfig = settingsRes.rows[0]?.value || { enabled: false };
        
        // Nếu chế độ bảo trì không bật, hoặc người dùng có quyền admin, cho phép truy cập
        if (!maintenanceConfig.enabled || (req.user && req.user.permissions.includes('full_access'))) {
            return next();
        }

        // Nếu bảo trì đang bật, trả về lỗi 503
        return res.status(503).json({ 
            message: maintenanceConfig.message || "Hệ thống đang được bảo trì. Vui lòng quay lại sau.",
            title: maintenanceConfig.title || "Hệ thống bảo trì"
        });

    } catch (error) {
        // Nếu có lỗi khi kiểm tra CSDL, mặc định cho phép truy cập để tránh khóa toàn bộ hệ thống
        console.error("Lỗi middleware bảo trì:", error);
        next();
    }
};

module.exports = maintenanceMiddleware;