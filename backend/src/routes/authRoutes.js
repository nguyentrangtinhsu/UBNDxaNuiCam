const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware'); // Chỉ cần verifyToken ở đây
const { validatePasswordChange, validate } = require('../../middlewares/validationMiddleware');


// POST: Đăng nhập (không cần validation ở đây vì logic kiểm tra phức tạp hơn)
router.post('/login', authController.login);

// PUT: Cập nhật hồ sơ (đã được bảo vệ và có thể thêm validation nếu cần)
router.put('/profile', verifyToken, authController.updateProfile);

// POST: Đổi mật khẩu với validation
router.post('/change-password', verifyToken, validatePasswordChange, validate, authController.changePassword);

module.exports = router;