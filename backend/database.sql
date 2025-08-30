-- Xóa các bảng cũ nếu tồn tại để tạo lại cấu trúc mới
DROP TABLE IF EXISTS task_supporters, task_history, tasks, role_permissions, permissions, users, departments, roles, system_settings CASCADE;

-- Bảng lưu các vai trò (đã nâng cấp)
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#64748b',
    level INT NOT NULL -- Cấp I, II, III, IV
);

-- Bảng lưu các phòng ban/đơn vị
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    avatar VARCHAR(255) -- Thêm ảnh đại diện cho phòng ban
);

-- Bảng lưu thông tin người dùng (đã nâng cấp)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE, -- Tên đăng nhập tùy chọn
    cccd VARCHAR(12) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    birth_date DATE, -- Đổi từ birth_year sang birth_date
    phone_number VARCHAR(15), -- Bổ sung SĐT
    email VARCHAR(255) UNIQUE, -- Bổ sung email
    avatar VARCHAR(255),
    role_id INT REFERENCES roles(id),
    department_id INT REFERENCES departments(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng lưu các quyền hạn
CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    permission_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

-- Bảng trung gian gán quyền cho vai trò
CREATE TABLE role_permissions (
    role_id INT REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INT REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- Bảng công việc
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    creator_id INT REFERENCES users(id),
    assignee_id INT REFERENCES users(id),
    due_date TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'Mới tạo',
    priority VARCHAR(50) DEFAULT 'Trung bình',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Bảng lưu lịch sử công việc
CREATE TABLE task_history (
    id SERIAL PRIMARY KEY,
    task_id INT REFERENCES tasks(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng lưu người hỗ trợ
CREATE TABLE task_supporters (
    task_id INT REFERENCES tasks(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, user_id)
);

-- Bảng cài đặt hệ thống (MỚI)
CREATE TABLE system_settings (
    key VARCHAR(50) PRIMARY KEY,
    value JSONB,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- DỮ LIỆU KHỞI TẠO ĐÃ NÂNG CẤP
INSERT INTO roles (id, role_name, description, color, level) VALUES
(1, 'Admin', 'Quản trị viên hệ thống, có toàn quyền', '#ef4444', 1),
(2, 'Tài khoản thử nghiệm', 'Quyền quản lý cao nhất, tương đương Admin', '#f97316', 1),
(3, 'Chủ tịch', 'Quyền quản lý cao nhất, tương đương Admin', '#f97316', 1),
(4, 'Lãnh đạo', 'Quản lý cấp dưới, giao việc', '#eab308', 1),
(5, 'Cán bộ', 'Nhận việc và quản lý nhân viên cấp dưới', '#84cc16', 2),
(6, 'Chuyên viên', 'Thực hiện công việc', '#22c55e', 2),
(7, 'Viên chức', 'Tương đương Chuyên viên', '#14b8a6', 2),
(8, 'Người hỗ trợ', 'Thực hiện công việc được giao hoặc hỗ trợ', '#0ea5e9', 3),
(9, 'Tổ trưởng/Trưởng ban', 'Quản lý công việc trong tổ/ban', '#6366f1', 3),
(10, 'Trưởng ấp', 'Vai trò hỗ trợ tại các ấp', '#a855f7', 3),
(11, 'Trường học', 'Vai trò hỗ trợ tại các trường học', '#d946ef', 3);


INSERT INTO permissions (permission_name, description) VALUES
('full_access', 'Toàn quyền truy cập hệ thống'),
('user_management', 'Quyền quản lý người dùng (tạo, sửa, xóa, khóa)'),
('department_management', 'Quyền quản lý phòng ban'),
('role_management', 'Quyền quản lý phân quyền và vai trò'),
('create_task', 'Quyền giao việc cho người khác'),
('edit_delete_task', 'Quyền chỉnh sửa, xóa công việc của người khác'),
('approve_task', 'Quyền duyệt và yêu cầu làm lại công việc'),
('view_reports', 'Quyền xem báo cáo và thống kê toàn diện'),
('view_audit_log', 'Quyền xem nhật ký hệ thống'),
('system_settings', 'Quyền truy cập cài đặt hệ thống (bảo trì, thông báo đẩy,...)');

-- Gán quyền cho các vai trò cấp I (Admin, Chủ tịch, Tài khoản thử nghiệm)
INSERT INTO role_permissions (role_id, permission_id)
SELECT id, (SELECT id FROM permissions WHERE permission_name = 'full_access') FROM roles WHERE level = 1;

-- Gán quyền cho Lãnh đạo (cũng là cấp I nhưng không có full_access tuyệt đối như Admin)
INSERT INTO role_permissions (role_id, permission_id)
SELECT (SELECT id FROM roles WHERE role_name = 'Lãnh đạo'), p.id FROM permissions p WHERE p.permission_name != 'full_access';


-- Thêm cài đặt mặc định cho chế độ bảo trì
INSERT INTO system_settings (key, value, description) VALUES
('maintenance_mode', '{"enabled": false, "title": "Hệ thống đang bảo trì", "message": "Chúng tôi sẽ sớm quay trở lại. Vui lòng quay lại sau."}', 'Cấu hình chế độ bảo trì cho toàn bộ trang web.');