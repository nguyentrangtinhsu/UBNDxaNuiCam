const pool = require('../db');

// Lấy số liệu thống kê tổng quan (NÂNG CẤP VỚI BỘ LỌC ĐỘNG)
exports.getOverviewStats = async (req, res) => {
    // Lấy các tham số lọc từ query string
    const { userId, departmentId, startDate, endDate } = req.query;
    
    let baseQuery = 'FROM tasks t JOIN users u ON t.assignee_id = u.id';
    const params = [];
    let paramIndex = 1;
    let whereClause = 'WHERE 1=1';

    // Xây dựng câu lệnh WHERE động dựa trên các tham số được cung cấp
    if (userId) {
        whereClause += ` AND t.assignee_id = $${paramIndex++}`;
        params.push(userId);
    }
    if (departmentId) {
        whereClause += ` AND u.department_id = $${paramIndex++}`;
        params.push(departmentId);
    }
    if (startDate) {
        whereClause += ` AND t.created_at >= $${paramIndex++}`;
        params.push(startDate);
    }
    if (endDate) {
        whereClause += ` AND t.created_at <= $${paramIndex++}`;
        params.push(endDate);
    }

    try {
        // Xây dựng các câu truy vấn thống kê
        const totalQuery = `SELECT COUNT(t.id) ${baseQuery} ${whereClause}`;
        const completedQuery = `SELECT COUNT(t.id) ${baseQuery} ${whereClause} AND t.status = 'Hoàn thành'`;
        const overdueQuery = `SELECT COUNT(t.id) ${baseQuery} ${whereClause} AND t.due_date < NOW() AND t.status != 'Hoàn thành'`;
        const inProgressQuery = `SELECT COUNT(t.id) ${baseQuery} ${whereClause} AND t.status = 'Đang thực hiện'`;

        // Thực thi tất cả các truy vấn song song để tăng hiệu suất
        const [totalRes, completedRes, overdueRes, inProgressRes] = await Promise.all([
            pool.query(totalQuery, params),
            pool.query(completedQuery, params),
            pool.query(overdueQuery, params),
            pool.query(inProgressQuery, params),
        ]);

        // Trả về kết quả
        res.json({
            total: parseInt(totalRes.rows[0].count, 10),
            completed: parseInt(completedRes.rows[0].count, 10),
            overdue: parseInt(overdueRes.rows[0].count, 10),
            inProgress: parseInt(inProgressRes.rows[0].count, 10),
        });
    } catch (error) {
        console.error("Lỗi khi lấy thống kê tổng quan:", error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
};

// Thống kê công việc theo từng phòng ban
exports.getTasksByDepartment = async (req, res) => {
    try {
        const query = `
            SELECT 
                d.name as department_name,
                COUNT(t.id) as total_tasks,
                COUNT(CASE WHEN t.status = 'Hoàn thành' THEN 1 END) as completed_tasks,
                COUNT(CASE WHEN t.due_date < NOW() AND t.status != 'Hoàn thành' THEN 1 END) as overdue_tasks
            FROM departments d
            LEFT JOIN users u ON d.id = u.department_id
            LEFT JOIN tasks t ON u.id = t.assignee_id
            GROUP BY d.name
            ORDER BY total_tasks DESC
        `;
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error("Lỗi khi thống kê theo phòng ban:", error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
};


// Lấy danh sách người dùng và phòng ban để làm bộ lọc trên giao diện (MỚI)
exports.getReportFilters = async (req, res) => {
    try {
        // Lấy danh sách người dùng và phòng ban song song
        const [usersRes, departmentsRes] = await Promise.all([
            pool.query('SELECT id, full_name FROM users WHERE is_active = TRUE ORDER BY full_name'),
            pool.query('SELECT id, name FROM departments ORDER BY name')
        ]);
        
        // Trả về dữ liệu cho frontend
        res.json({
            users: usersRes.rows,
            departments: departmentsRes.rows
        });
    } catch (error) {
        console.error("Lỗi khi tải bộ lọc báo cáo:", error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
};