const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, hasPermission } = require('../middlewares/authMiddleware');
const { validateUserCreation, validateUserUpdate, validate } = require('../../middlewares/validationMiddleware');

// Tất cả các route đều yêu cầu đăng nhập
router.use(verifyToken);

// GET: Lấy danh sách người dùng
router.get('/', hasPermission(['user_management']), userController.getUsers);

// POST: Tạo người dùng mới với validation
router.post('/', hasPermission(['user_management']), validateUserCreation, validate, userController.createUser);

// PUT: Cập nhật người dùng với validation
router.put('/:id', hasPermission(['user_management']), validateUserUpdate, validate, userController.updateUser);

// PATCH: Khóa/Mở khóa tài khoản
router.patch('/:id/status', hasPermission(['user_management']), userController.toggleUserStatus);

// DELETE: Xóa người dùng
router.delete('/:id', hasPermission(['user_management']), userController.deleteUser);


module.exports = router;