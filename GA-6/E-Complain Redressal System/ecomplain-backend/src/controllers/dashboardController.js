const Complaint = require('../models/Complaint');
const Student = require('../models/Student');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get student dashboard data
// @route   GET /api/dashboard
// @access  Private (Student only)
const getStudentDashboard = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  // Get student details
  const student = await Student.findById(studentId).select('-password -passwordResetToken -passwordResetExpires');

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found'
    });
  }

  // Get student's complaints with stats - using lean() for better performance
  const complaints = await Complaint.find({ student: studentId })
    .sort({ createdAt: -1 })
    .select('_id title description category priority status createdAt updatedAt workflow')
    .lean(); // Use lean() for read-only queries to improve performance

  // Calculate stats
  const totalComplaints = complaints.length;
  const pendingComplaints = complaints.filter(c => c.status.toLowerCase() === 'pending').length;
  const resolvedComplaints = complaints.filter(c => c.status.toLowerCase() === 'resolved').length;
  const rejectedComplaints = complaints.filter(c => c.status.toLowerCase() === 'rejected').length;

  const stats = {
    totalComplaints,
    pendingComplaints,
    resolvedComplaints,
    rejectedComplaints
  };

  res.json({
    success: true,
    student: {
      id: student._id,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      rollNo: student.rollNo,
      department: student.department,
      year: student.year,
      libraryId: student.libraryId,
      profilePicture: student.profilePicture
    },
    stats,
    complaints
  });
});

module.exports = {
  getStudentDashboard
};
