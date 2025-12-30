const express = require('express');
const router = express.Router();
const { getStudentDashboard } = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/auth');

// Protected routes (require authentication)
router.get('/', authenticateToken, getStudentDashboard);

module.exports = router;
