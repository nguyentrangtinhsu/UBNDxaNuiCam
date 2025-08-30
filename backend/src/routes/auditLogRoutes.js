const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLogController');
const { verifyToken, hasPermission } = require('../middlewares/authMiddleware');

// Yêu cầu đăng nhập và có quyền xem nhật ký
router.use(verifyToken, hasPermission(['view_audit_log']));

// GET: Lấy danh sách nhật ký có phân trang và bộ lọc
router.get('/', auditLogController.getAuditLogs);

module.exports = router;