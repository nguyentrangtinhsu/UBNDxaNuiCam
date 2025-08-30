const { body, validationResult } = require('express-validator');

// Validation cho việc tạo người dùng (ĐÃ NÂNG CẤP)
const validateUserCreation = [
    body('cccd').isLength({ min: 12, max: 12 }).withMessage('CCCD phải có đúng 12 chữ số.').isNumeric().withMessage('CCCD chỉ được chứa số.'),
    body('fullName').trim().notEmpty().withMessage('Họ và tên không được để trống.'),
    body('password').isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự.'),
    body('role_id').isInt({ gt: 0 }).withMessage('Vai trò không hợp lệ.'),
    body('department_id').optional({ checkFalsy: true }).isInt({ gt: 0 }).withMessage('Phòng ban không hợp lệ.'),
    // Bổ sung validation cho các trường mới
    body('username').optional({ checkFalsy: true }).isAlphanumeric().withMessage('Tên đăng nhập chỉ được chứa chữ và số.'),
    body('email').optional({ checkFalsy: true }).isEmail().withMessage('Email không hợp lệ.'),
    body('phone_number').optional({ checkFalsy: true }).isMobilePhone('vi-VN').withMessage('Số điện thoại không hợp lệ.')
];

// Validation cho việc cập nhật người dùng (ĐÃ NÂNG CẤP)
const validateUserUpdate = [
    body('fullName').trim().notEmpty().withMessage('Họ và tên không được để trống.'),
    body('role_id').isInt({ gt: 0 }).withMessage('Vai trò không hợp lệ.'),
    body('department_id').optional({ checkFalsy: true }).isInt({ gt: 0 }).withMessage('Phòng ban không hợp lệ.'),
    // Bổ sung validation cho các trường mới
    body('username').optional({ checkFalsy: true }).isAlphanumeric().withMessage('Tên đăng nhập chỉ được chứa chữ và số.'),
    body('email').optional({ checkFalsy: true }).isEmail().withMessage('Email không hợp lệ.'),
    body('phone_number').optional({ checkFalsy: true }).isMobilePhone('vi-VN').withMessage('Số điện thoại không hợp lệ.')
];

// Validation cho việc tạo công việc
const validateTaskCreation = [
    body('title').trim().notEmpty().withMessage('Tên công việc không được để trống.'),
    body('assignee_id').isInt({ gt: 0 }).withMessage('Người thực hiện không hợp lệ.'),
    body('due_date').isISO8601().toDate().withMessage('Ngày hết hạn không hợp lệ.'),
    body('priority').isIn(['Thấp', 'Trung bình', 'Cao']).withMessage('Độ ưu tiên không hợp lệ.'),
];

// Validation cho việc đổi mật khẩu
const validatePasswordChange = [
    body('oldPassword').notEmpty().withMessage('Mật khẩu cũ không được để trống.'),
    body('newPassword').isLength({ min: 6 }).withMessage('Mật khẩu mới phải có ít nhất 6 ký tự.'),
];

// Validation cho phòng ban
const validateDepartment = [
    body('name').trim().notEmpty().withMessage('Tên phòng ban không được để trống.'),
];


// Middleware trung gian để kiểm tra kết quả validation
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    // Lấy lỗi đầu tiên và gửi về cho client
    const firstError = errors.array({ onlyFirstError: true })[0];
    return res.status(422).json({ message: firstError.msg });
};

module.exports = {
    validateUserCreation,
    validateUserUpdate,
    validateTaskCreation,
    validatePasswordChange,
    validateDepartment,
    validate,
};