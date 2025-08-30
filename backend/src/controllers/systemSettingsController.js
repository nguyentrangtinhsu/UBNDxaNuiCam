const pool = require('../db');

// Lấy tất cả cài đặt hệ thống
exports.getSystemSettings = async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT key, value, description FROM system_settings');
        // Chuyển đổi mảng thành một đối tượng để dễ sử dụng ở frontend
        const settings = rows.reduce((acc, row) => {
            acc[row.key] = row.value;
            return acc;
        }, {});
        res.json(settings);
    } catch (error) {
        console.error("Lỗi khi lấy cài đặt hệ thống:", error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
};

// Cập nhật chế độ bảo trì
exports.updateMaintenanceMode = async (req, res) => {
    const { enabled, title, message } = req.body;

    // Validate dữ liệu đầu vào
    if (typeof enabled !== 'boolean' || !title || !message) {
        return res.status(400).json({ message: 'Dữ liệu không hợp lệ.' });
    }

    try {
        const value = { enabled, title, message };
        const query = `
            UPDATE system_settings 
            SET value = $1, updated_at = NOW() 
            WHERE key = 'maintenance_mode'
            RETURNING value;
        `;
        const { rows } = await pool.query(query, [JSON.stringify(value)]);
        res.json(rows[0]);
    } catch (error) {
        console.error("Lỗi khi cập nhật chế độ bảo trì:", error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
};