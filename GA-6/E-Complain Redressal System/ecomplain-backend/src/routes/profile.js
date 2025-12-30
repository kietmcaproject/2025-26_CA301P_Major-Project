const express = require('express');
const router = express.Router();
const { uploadProfilePicture, deleteProfilePicture } = require('../controllers/profileController');
const { authenticateToken } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// Test route to verify profile routes are working
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Profile routes are working' });
});

// Multer error handling middleware
const handleMulterError = (err, req, res, next) => {
  if (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB.'
      });
    }
    if (err.message === 'Only image files are allowed!') {
      return res.status(400).json({
        success: false,
        message: 'Only image files are allowed'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload error'
    });
  }
  next();
};

// Protected routes (require authentication)
router.post(
  '/upload-picture',
  authenticateToken,
  upload.single('profilePicture'),
  handleMulterError,
  uploadProfilePicture
);
router.delete('/delete-picture', authenticateToken, deleteProfilePicture);

module.exports = router;

