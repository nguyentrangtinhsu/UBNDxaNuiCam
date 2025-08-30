const pool = require('../db');

// --- LƯU Ý QUAN TRỌNG ---
// Để xử lý upload file, bạn cần cài đặt multer: npm install multer
// Và cấu hình nó trong file departmentRoutes.js.
// Ví dụ: const upload = multer({ dest: 'uploads/avatars/' });
// router.post('/', upload.single('avatar'), departmentController.createDepartment);

// Lấy danh sách phòng ban
exports.getDepartments = async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM departments ORDER BY name');
        res.json(rows);
    } catch (error) {
        console.error("Lỗi khi tải phòng ban:", error);
        res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
};

// Tạo một phòng ban mới (NÂNG CẤP VỚI UPLOAD ẢNH)
exports.createDepartment = async (req, res) => {
    const { name, description } = req.body;
    // req.file sẽ chứa thông tin file ảnh từ middleware multer
    const avatarPath = req.file ? req.file.path : null; 

    if (!name) {
        return res.status(400).json({ message: "Tên phòng ban không được để trống." });
    }
    try {
        const query = 'INSERT INTO departments (name, description, avatar) VALUES ($1, $2, $3) RETURNING *';
        const { rows } = await pool.query(query, [name, description, avatarPath]);
        res.status(201).json(rows[0]);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ message: "Tên phòng ban này đã tồn tại." });
        }
        console.error("Lỗi khi tạo phòng ban:", error);
        res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
};

// Cập nhật thông tin phòng ban (NÂNG CẤP VỚI UPLOAD ẢNH)
exports.updateDepartment = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    const avatarPath = req.file ? req.file.path : null;

    if (!name) {
        return res.status(400).json({ message: "Tên phòng ban không được để trống." });
    }
    try {
        // Chỉ cập nhật avatar nếu có file mới được tải lên
        let query;
        let params;
        if (avatarPath) {
            query = 'UPDATE departments SET name = $1, description = $2, avatar = $3 WHERE id = $4 RETURNING *';
            params = [name, description, avatarPath, id];
        } else {
            query = 'UPDATE departments SET name = $1, description = $2 WHERE id = $3 RETURNING *';
            params = [name, description, id];
        }
        
        const { rows } = await pool.query(query, params);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy phòng ban." });
        }
        res.json(rows[0]);
    } catch (error) {
         if (error.code === '23505') {
            return res.status(400).json({ message: "Tên phòng ban này đã tồn tại." });
        }
        console.error("Lỗi khi cập nhật phòng ban:", error);
        res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
};

// Xóa một phòng ban
exports.deleteDepartment = async (req, res) => {
    const { id } = req.params;
    try {
        const userCheckQuery = 'SELECT COUNT(*) FROM users WHERE department_id = $1';
        const userCheckResult = await pool.query(userCheckQuery, [id]);
        if (parseInt(userCheckResult.rows[0].count, 10) > 0) {
            return res.status(400).json({ message: "Không thể xóa vì vẫn còn người dùng trong phòng ban." });
        }

        const deleteQuery = 'DELETE FROM departments WHERE id = $1 RETURNING *';
        const { rows } = await pool.query(deleteQuery, [id]);
         if (rows.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy phòng ban." });
        }
        // TODO: Xóa file ảnh avatar khỏi server nếu cần
        res.json({ message: "Phòng ban đã được xóa thành công." });
    } catch (error) {
        console.error("Lỗi khi xóa phòng ban:", error);
        res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
};