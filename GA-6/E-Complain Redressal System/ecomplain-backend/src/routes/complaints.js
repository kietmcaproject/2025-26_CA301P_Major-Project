const express = require('express');
const multer = require('multer');
const router = express.Router();
const {
  getComplaints,
  getComplaint,
  createComplaint,
  updateComplaint,
  deleteComplaint,
  addComment,
  assignComplaint,
  getComplaintStats,
  escalateComplaint,
  assignToAdditionalHOD,
  forwardComplaint,
  forwardToExternal,
  acknowledgeExternal,
  closeExternalComplaint,
  uploadAttachments,
  proxyImage,
  proxyPdf
} = require('../controllers/complaintController');
const { uploadComplaintAttachments } = require('../config/cloudinary');
const {
  validateComplaintCreation,
  validateComplaintUpdate,
  validateComment,
  validateQueryParams,
  validateObjectId
} = require('../middleware/validation');
const {
  authenticateToken,
  requireStudent,
  requireAdmin,
  requirePermission
} = require('../middleware/auth');

// Proxy routes (before auth middleware - needs to be accessible for iframe)
router.get('/attachments/image', proxyImage);
router.get('/attachments/pdf', proxyPdf);

// All other routes require authentication
router.use(authenticateToken);

// Public complaint routes (for students)
router.route('/')
  .get(validateQueryParams, getComplaints)
  .post(requireStudent, validateComplaintCreation, createComplaint);

// Admin-only routes
router.get('/stats', requireAdmin, requirePermission('canViewReports'), getComplaintStats);

// Individual complaint routes
router.route('/:id')
  .get(validateObjectId('id'), getComplaint)
  .put(validateObjectId('id'), validateComplaintUpdate, updateComplaint)
  .delete(validateObjectId('id'), deleteComplaint);

// Comment routes
router.post('/:id/comments', 
  validateObjectId('id'), 
  validateComment, 
  addComment
);

// Assignment routes (Admin only)
router.put('/:id/assign', 
  requireAdmin, 
  requirePermission('canManageComplaints'),
  validateObjectId('id'),
  assignComplaint
);

// Escalation route (Additional HOD only)
router.put('/:id/escalate',
  requireAdmin,
  requirePermission('canManageComplaints'),
  validateObjectId('id'),
  escalateComplaint
);

// Forward route (Coordinator only)
router.put('/:id/forward',
  requireAdmin,
  requirePermission('canManageComplaints'),
  validateObjectId('id'),
  forwardComplaint
);

// Forward to external department route (Dean only)
router.put('/:id/forward-external',
  requireAdmin,
  requirePermission('canManageComplaints'),
  validateObjectId('id'),
  forwardToExternal
);

// Acknowledge external complaint route (External departments)
router.put('/:id/acknowledge-external',
  requireAdmin,
  validateObjectId('id'),
  acknowledgeExternal
);

// Close external complaint route (Dean only)
router.put('/:id/close-external',
  requireAdmin,
  requirePermission('canManageComplaints'),
  validateObjectId('id'),
  closeExternalComplaint
);

// Assign to Additional HOD route (Dean only)
router.put('/:id/assign-additional',
  requireAdmin,
  requirePermission('canManageComplaints'),
  validateObjectId('id'),
  assignToAdditionalHOD
);

// Multer error handling middleware
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds the 10MB limit'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 5 files allowed per complaint'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload error'
    });
  }
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload error'
    });
  }
  next();
};

// Upload attachments route
router.post('/:id/attachments',
  validateObjectId('id'),
  uploadComplaintAttachments.array('attachments', 5),
  handleMulterError,
  uploadAttachments
);

// Proxy routes (before :id routes to avoid conflicts)
// Note: These routes are public but validate the URL is from Cloudinary for security
router.get('/attachments/image', proxyImage);
router.get('/attachments/pdf', proxyPdf);

module.exports = router;
