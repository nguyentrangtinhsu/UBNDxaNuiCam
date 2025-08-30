const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { verifyToken, hasPermission } = require('../middlewares/authMiddleware');
const { validateTaskCreation, validate } = require('../../middlewares/validationMiddleware');

router.use(verifyToken);

// GET: Lấy danh sách công việc
router.get('/', taskController.getTasks);
// GET: Lấy lịch sử của một công việc (MỚI)
router.get('/:id/history', taskController.getTaskHistory);

// POST: Tạo công việc mới
router.post('/', hasPermission(['create_task']), validateTaskCreation, validate, taskController.createTask);

// PUT: Chỉnh sửa công việc (MỚI)
router.put('/:id', hasPermission(['edit_delete_task']), taskController.updateTask);

// PATCH: Cập nhật trạng thái công việc
router.patch('/:id/status', taskController.updateTaskStatus);

// DELETE: Xóa công việc (MỚI)
router.delete('/:id', hasPermission(['edit_delete_task']), taskController.deleteTask);

module.exports = router;