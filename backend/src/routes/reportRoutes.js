const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken, hasPermission } = require('../middlewares/authMiddleware');

// Mọi route trong đây đều yêu cầu đăng nhập và có quyền xem báo cáo
router.use(verifyToken, hasPermission(['view_reports']));

// GET: Lấy thống kê tổng quan
router.get('/overview-stats', reportController.getOverviewStats);

// GET: Lấy thống kê theo phòng ban
router.get('/tasks-by-department', reportController.getTasksByDepartment);

module.exports = router;