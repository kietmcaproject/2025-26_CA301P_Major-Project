const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { getAdditionalHODs, getDeans } = require('../controllers/adminController');

// Get additional HODs for a specific department
router.get('/additional-hods', authenticateToken, requireAdmin, getAdditionalHODs);

// Get Deans for a specific department
router.get('/deans', authenticateToken, requireAdmin, getDeans);

module.exports = router;
