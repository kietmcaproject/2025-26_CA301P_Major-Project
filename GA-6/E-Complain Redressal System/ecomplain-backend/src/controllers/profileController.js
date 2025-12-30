const Student = require('../models/Student');
const { asyncHandler } = require('../middleware/errorHandler');
const { deleteImage } = require('../config/cloudinary');

// @desc    Upload profile picture
// @route   POST /api/profile/upload-picture
// @access  Private (Student only)
const uploadProfilePicture = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload an image file'
    });
  }

  // Get student
  const student = await Student.findById(studentId);

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found'
    });
  }

  // Delete old profile picture if exists
  if (student.profilePicture) {
    await deleteImage(student.profilePicture);
  }

  // Get the secure URL from Cloudinary
  // CloudinaryStorage provides: path, url, secure_url, public_id, etc.
  const imageUrl = req.file.secure_url || req.file.url || req.file.path;
  
  // Debug logging (remove in production)
  console.log('Cloudinary file object:', {
    path: req.file.path,
    url: req.file.url,
    secure_url: req.file.secure_url,
    public_id: req.file.public_id
  });
  
  if (!imageUrl) {
    return res.status(500).json({
      success: false,
      message: 'Failed to get image URL from Cloudinary',
      file: req.file
    });
  }

  // Update student with new profile picture URL
  student.profilePicture = imageUrl;
  await student.save();
  
  console.log('Profile picture saved:', imageUrl);

  res.json({
    success: true,
    message: 'Profile picture uploaded successfully',
    profilePicture: student.profilePicture
  });
});

// @desc    Delete profile picture
// @route   DELETE /api/profile/delete-picture
// @access  Private (Student only)
const deleteProfilePicture = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  // Get student
  const student = await Student.findById(studentId);

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found'
    });
  }

  if (!student.profilePicture) {
    return res.status(400).json({
      success: false,
      message: 'No profile picture to delete'
    });
  }

  // Delete image from Cloudinary
  await deleteImage(student.profilePicture);

  // Remove profile picture from student
  student.profilePicture = null;
  await student.save();

  res.json({
    success: true,
    message: 'Profile picture deleted successfully'
  });
});

module.exports = {
  uploadProfilePicture,
  deleteProfilePicture
};

