const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { identifier, password } = req.body; // Sử dụng identifier thay cho cccd
  try {
    const query = `
      SELECT u.id, u.username, u.cccd, u.full_name, u.password_hash, u.avatar, 
             u.department_id, u.birth_date, u.phone_number, u.email,
             r.id as role_id, r.role_name, r.color as role_color, r.level as role_level, 
             d.name as department_name
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE (u.cccd = $1 OR u.username = $1) AND u.is_active = TRUE
    `;
    const { rows } = await pool.query(query, [identifier]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Tên đăng nhập, CCCD hoặc mật khẩu không đúng, hoặc tài khoản đã bị khóa.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Tên đăng nhập, CCCD hoặc mật khẩu không đúng.' });
    }

    const permissionsQuery = `
        SELECT p.permission_name FROM permissions p
        JOIN role_permissions rp ON p.id = rp.permission_id
        WHERE rp.role_id = $1
    `;
    const permissionsResult = await pool.query(permissionsQuery, [user.role_id]);
    const permissions = permissionsResult.rows.map(p => p.permission_name);
     // Nếu user có quyền full_access, gán tất cả các quyền cho họ
    if (permissions.includes('full_access')) {
        const allPermissions = await pool.query('SELECT permission_name FROM permissions');
        permissions.push(...allPermissions.rows.map(p => p.permission_name));
    }


    const payload = {
      user: {
        id: user.id,
        fullName: user.full_name,
        username: user.username,
        cccd: user.cccd,
        birth_date: user.birth_date,
        phone_number: user.phone_number,
        email: user.email,
        role_id: user.role_id,
        role: `${user.role_name} - Cấp ${user.role_level}`, // Hiển thị cấp bậc
        roleColor: user.role_color,
        avatar: user.avatar,
        department: user.department_name,
        permissions: [...new Set(permissions)] // Loại bỏ quyền trùng lặp
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: payload.user });
      }
    );
  } catch (error) {
    console.error("Lỗi đăng nhập:", error.message);
    res.status(500).send('Lỗi máy chủ');
  }
};

// Cập nhật thông tin cá nhân (Profile)
exports.updateProfile = async (req, res) => {
    const { id } = req.user;
    const { fullName, birth_date, phone_number, email } = req.body;

    try {
        const query = `
            UPDATE users
            SET full_name = $1, birth_date = $2, phone_number = $3, email = $4
            WHERE id = $5
            RETURNING id, full_name, birth_date, phone_number, email;
        `;
        const { rows } = await pool.query(query, [fullName, birth_date, phone_number, email, id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
        }
        res.json(rows[0]);
    } catch (error) {
        if (error.code === '23505' && error.constraint.includes('email')) {
            return res.status(400).json({ message: 'Email này đã được sử dụng.' });
        }
        console.error("Lỗi khi cập nhật hồ sơ:", error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ.' });
    }
};


// Đổi mật khẩu
exports.changePassword = async (req, res) => {
    const { id } = req.user;
    const { oldPassword, newPassword } = req.body;

    try {
        const userRes = await pool.query('SELECT password_hash FROM users WHERE id = $1', [id]);
        if (userRes.rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
        }
        const user = userRes.rows[0];

        const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mật khẩu cũ không đúng.' });
        }

        const salt = await bcrypt.genSalt(10);
        const newPasswordHash = await bcrypt.hash(newPassword, salt);

        await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newPasswordHash, id]);

        res.json({ message: 'Đổi mật khẩu thành công.' });
    } catch (error) {
        console.error("Lỗi khi đổi mật khẩu:", error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
};