const pool = require('../db');
const bcrypt = require('bcryptjs');

// Lấy tất cả người dùng
exports.getUsers = async (req, res) => {
    try {
        const query = `
            SELECT u.id, u.username, u.cccd, u.full_name, u.email, u.phone_number,
                   u.birth_date, u.avatar, u.note, u.is_active,
                   r.id as role_id, r.role_name, r.color as role_color, r.level as role_level,
                   d.id as department_id, d.name as department_name
            FROM users u
            JOIN roles r ON u.role_id = r.id
            LEFT JOIN departments d ON u.department_id = d.id
            ORDER BY u.full_name
        `;
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error("Lỗi khi tải người dùng:", error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
};

// Tạo người dùng mới
exports.createUser = async (req, res) => {
    const { cccd, password, fullName, role_id, department_id, note, username, email, phone_number, birth_date } = req.body;
    
    try {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const query = `
            INSERT INTO users (cccd, password_hash, full_name, role_id, department_id, note, username, email, phone_number, birth_date)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id, full_name
        `;
        const params = [cccd, password_hash, fullName, role_id, department_id, note, username || null, email || null, phone_number || null, birth_date || null];
        const { rows } = await pool.query(query, params);
        res.status(201).json(rows[0]);
    } catch (error) {
        if (error.code === '23505') { // Lỗi unique cccd, username, email
            if (error.constraint.includes('cccd')) {
                 return res.status(400).json({ message: 'Số CCCD này đã tồn tại trong hệ thống.' });
            }
            if (error.constraint.includes('username')) {
                 return res.status(400).json({ message: 'Tên đăng nhập này đã tồn tại.' });
            }
             if (error.constraint.includes('email')) {
                 return res.status(400).json({ message: 'Email này đã được sử dụng.' });
            }
        }
        console.error("Lỗi khi tạo người dùng:", error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
};

// Cập nhật người dùng (dành cho Admin/Lãnh đạo)
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { fullName, role_id, department_id, note, is_active, username, email, phone_number, birth_date } = req.body;
    try {
        const query = `
            UPDATE users 
            SET full_name = $1, role_id = $2, department_id = $3, note = $4, is_active = $5,
                username = $6, email = $7, phone_number = $8, birth_date = $9
            WHERE id = $10
            RETURNING id, full_name
        `;
        const params = [fullName, role_id, department_id, note, is_active, username || null, email || null, phone_number || null, birth_date || null, id];
        const { rows } = await pool.query(query, params);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
        }
        res.json(rows[0]);
    } catch (error) {
         if (error.code === '23505') {
            return res.status(400).json({ message: 'Thông tin (Tên đăng nhập, CCCD, Email) bị trùng lặp.' });
        }
        console.error("Lỗi khi cập nhật người dùng:", error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
};

// Khóa/Mở khóa tài khoản
exports.toggleUserStatus = async (req, res) => {
    const { id } = req.params;
    const { is_active } = req.body; 
     try {
        const result = await pool.query('UPDATE users SET is_active = $1 WHERE id = $2 RETURNING id', [is_active, id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
        }
        res.json({ message: `Tài khoản đã được ${is_active ? 'mở khóa' : 'khóa'}.` });
    } catch (error) {
        console.error("Lỗi khi thay đổi trạng thái người dùng:", error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
};

// Xóa người dùng
exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM users WHERE id = $1', [id]);
        res.json({ message: 'Đã xóa người dùng vĩnh viễn.' });
    } catch (error) {
        console.error("Lỗi khi xóa người dùng:", error);
        res.status(500).json({ message: 'Không thể xóa người dùng này. Có thể do họ đang liên quan đến các công việc hoặc dữ liệu khác.' });
    }
};