const pool = require('../db');

// Hàm helper để ghi lại lịch sử công việc
const logTaskHistory = async (taskId, userId, action, details) => {
    const query = `
        INSERT INTO task_history (task_id, user_id, action, details)
        VALUES ($1, $2, $3, $4)
    `;
    // Bỏ qua lỗi để không làm dừng luồng chính, nhưng vẫn log ra console
    try {
        await pool.query(query, [taskId, userId, action, details]);
    } catch (error) {
        console.error("Lỗi khi ghi log lịch sử công việc:", error);
    }
};

// Lấy danh sách công việc (với logic phân quyền)
exports.getTasks = async (req, res) => {
    const { id: userId, permissions } = req.user;
    try {
        let query;
        const params = [userId];

        // Người có quyền xem toàn bộ công việc (Admin, Lãnh đạo cấp cao)
        if (permissions.includes('full_access') || permissions.includes('system_settings')) {
            query = `
                SELECT t.*, creator.full_name as creator_name, assignee.full_name as assignee_name
                FROM tasks t
                JOIN users creator ON t.creator_id = creator.id
                LEFT JOIN users assignee ON t.assignee_id = assignee.id
                ORDER BY t.created_at DESC
            `;
            params.pop(); // Không cần userId trong trường hợp này
        }
        // Người dùng thông thường chỉ thấy việc được giao hoặc được thêm vào hỗ trợ
        else {
             query = `
                SELECT DISTINCT t.*, creator.full_name as creator_name, assignee.full_name as assignee_name
                FROM tasks t
                JOIN users creator ON t.creator_id = creator.id
                LEFT JOIN users assignee ON t.assignee_id = assignee.id
                LEFT JOIN task_supporters ts ON t.id = ts.task_id
                WHERE t.assignee_id = $1 OR ts.user_id = $1 OR t.creator_id = $1
                ORDER BY t.created_at DESC
            `;
        }
        
        const { rows } = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error("Lỗi khi tải công việc:", error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
};


// Tạo công việc mới
exports.createTask = async (req, res) => {
    const { title, description, assignee_id, due_date, priority } = req.body;
    const { id: creatorId } = req.user;

    try {
        const query = `
            INSERT INTO tasks (title, description, creator_id, assignee_id, due_date, priority, status)
            VALUES ($1, $2, $3, $4, $5, $6, 'Mới tạo') RETURNING *
        `;
        const { rows } = await pool.query(query, [title, description, creatorId, assignee_id, due_date, priority]);
        const newTask = rows[0];

        // Ghi lại lịch sử
        const assignee = await pool.query('SELECT full_name FROM users WHERE id = $1', [assignee_id]);
        await logTaskHistory(newTask.id, creatorId, 'Tạo mới', `Giao việc cho ${assignee.rows[0].full_name}`);
        
        res.status(201).json(newTask);
    } catch (error) {
        console.error("Lỗi khi tạo công việc:", error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
};

// Cập nhật trạng thái công việc
exports.updateTaskStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const { id: userId, fullName, permissions } = req.user;

    try {
        const taskRes = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
        if (taskRes.rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy công việc' });
        }
        const task = taskRes.rows[0];
        const isAssignee = task.assignee_id === userId;
        const isCreator = task.creator_id === userId;
        const canApprove = permissions.includes('approve_task');

        let newStatus = status;
        let logDetails = `${fullName} đã cập nhật trạng thái thành "${newStatus}"`;

        // Logic phân quyền hành động
        switch(status) {
            case 'Tiếp nhận':
            case 'Đang thực hiện':
            case 'Chờ duyệt':
                if (!isAssignee) return res.status(403).json({ message: 'Chỉ người được giao mới có thể cập nhật trạng thái này.' });
                break;
            case 'Yêu cầu làm lại':
                if (!isCreator && !canApprove) return res.status(403).json({ message: 'Bạn không có quyền yêu cầu làm lại công việc này.' });
                newStatus = 'Mới tạo'; // Quay về trạng thái ban đầu
                logDetails = `${fullName} đã yêu cầu làm lại công việc.`;
                break;
            case 'Hoàn thành':
                 if (!isCreator && !canApprove) return res.status(403).json({ message: 'Bạn không có quyền duyệt hoàn thành công việc này.' });
                 await pool.query('UPDATE tasks SET completed_at = NOW() WHERE id = $1', [id]);
                 break;
            default:
                 return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
        }
        
        await pool.query('UPDATE tasks SET status = $1 WHERE id = $2', [newStatus, id]);
        await logTaskHistory(id, userId, 'Cập nhật trạng thái', logDetails);
        
        res.json({ message: 'Cập nhật trạng thái thành công', status: newStatus });
    } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái:", error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
};

// Lấy lịch sử của một công việc
exports.getTaskHistory = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT h.id, h.action, h.details, h.created_at, u.full_name as user_name
            FROM task_history h
            JOIN users u ON h.user_id = u.id
            WHERE h.task_id = $1
            ORDER BY h.created_at ASC
        `;
        const { rows } = await pool.query(query, [id]);
        res.json(rows);
    } catch (error) {
        console.error("Lỗi khi tải lịch sử công việc:", error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
};

// Chỉnh sửa công việc
exports.updateTask = async (req, res) => {
    const { id } = req.params;
    const { title, description, assignee_id, due_date, priority } = req.body;
    const { id: userId, fullName } = req.user;
    try {
        const query = `
            UPDATE tasks 
            SET title = $1, description = $2, assignee_id = $3, due_date = $4, priority = $5
            WHERE id = $6 RETURNING *
        `;
        const { rows } = await pool.query(query, [title, description, assignee_id, due_date, priority, id]);
        await logTaskHistory(id, userId, 'Chỉnh sửa', `${fullName} đã cập nhật thông tin công việc.`);
        res.json(rows[0]);
    } catch (error) {
        console.error("Lỗi khi cập nhật công việc:", error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
};

// Xóa công việc
exports.deleteTask = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
        res.json({ message: 'Công việc đã được xóa vĩnh viễn.' });
    } catch (error) {
        console.error("Lỗi khi xóa công việc:", error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
};