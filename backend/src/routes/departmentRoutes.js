const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { verifyToken, hasPermission } = require('../middlewares/authMiddleware');
const { validateDepartment, validate } = require('../../middlewares/validationMiddleware');

// Tất cả các route đều yêu cầu đăng nhập
router.use(verifyToken);

// GET: Lấy danh sách
router.get('/', departmentController.getDepartments);

// POST: Tạo mới với validation
router.post('/', hasPermission(['department_management']), validateDepartment, validate, departmentController.createDepartment);

// PUT: Cập nhật với validation
router.put('/:id', hasPermission(['department_management']), validateDepartment, validate, departmentController.updateDepartment);

// DELETE: Xóa
router.delete('/:id', hasPermission(['department_management']), departmentController.deleteDepartment);

module.exports = router;