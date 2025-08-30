const pool = require('../db');

exports.getAuditLogs = async (req, res) => {
    // Lấy các tham số query cho việc lọc và phân trang
    const { page = 1, limit = 20, userId, action, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;

    try {
        let query = `
            SELECT 
                th.id,
                th.action,
                th.details,
                th.created_at,
                u.full_name as user_name,
                t.title as task_title
            FROM task_history th
            JOIN users u ON th.user_id = u.id
            LEFT JOIN tasks t ON th.task_id = t.id
            WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;

        if (userId) {
            query += ` AND th.user_id = $${paramIndex++}`;
            params.push(userId);
        }
        if (action) {
            query += ` AND th.action ILIKE $${paramIndex++}`;
            params.push(`%${action}%`);
        }
        if (startDate) {
            query += ` AND th.created_at >= $${paramIndex++}`;
            params.push(startDate);
        }
        if (endDate) {
            query += ` AND th.created_at <= $${paramIndex++}`;
            params.push(endDate);
        }

        // Query để đếm tổng số bản ghi (cho phân trang)
        const totalCountQuery = `SELECT COUNT(*) FROM (${query}) as audit_query`;
        const totalCountRes = await pool.query(totalCountQuery, params);
        const totalItems = parseInt(totalCountRes.rows[0].count, 10);

        // Thêm ORDER BY, LIMIT, OFFSET vào query chính
        query += ` ORDER BY th.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
        params.push(limit, offset);

        const { rows } = await pool.query(query, params);
        
        res.json({
            logs: rows,
            totalPages: Math.ceil(totalItems / limit),
            currentPage: parseInt(page, 10),
            totalItems
        });

    } catch (error) {
        console.error("Lỗi khi tải nhật ký hệ thống:", error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
};