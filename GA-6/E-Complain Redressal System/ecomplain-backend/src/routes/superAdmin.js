const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const {
  getSystemOverview,
  getAllStudents,
  getAllAdmins,
  getAllComplaints,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getSystemAnalytics,
  createStudent,
  updateStudent,
  deleteStudent,
  resetAdminPassword,
  unlockAdmin,
  resetStudentPassword,
  updateComplaint,
  deleteComplaint
} = require('../controllers/superAdminController');

// Apply authentication and super admin authorization to all routes
router.use(authenticateToken);
router.use(requireRole('super_admin'));

// System Overview
router.get('/overview', getSystemOverview);

// Students Management
router.get('/students', getAllStudents);
router.post('/students', createStudent);
router.put('/students/:id', updateStudent);
router.delete('/students/:id', deleteStudent);
router.put('/students/:id/reset-password', resetStudentPassword);

// Admins Management
router.get('/admins', getAllAdmins);
router.post('/admins', createAdmin);
router.put('/admins/:id', updateAdmin);
router.delete('/admins/:id', deleteAdmin);
router.put('/admins/:id/reset-password', resetAdminPassword);
router.put('/admins/:id/unlock', unlockAdmin);

// Complaints Management
router.get('/complaints', getAllComplaints);
router.put('/complaints/:id', updateComplaint);
router.delete('/complaints/:id', deleteComplaint);

// Analytics
router.get('/analytics', getSystemAnalytics);

module.exports = router;
