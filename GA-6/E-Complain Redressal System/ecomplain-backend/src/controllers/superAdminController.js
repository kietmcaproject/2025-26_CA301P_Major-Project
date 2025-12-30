const { asyncHandler } = require('../middleware/errorHandler');
const Student = require('../models/Student');
const Admin = require('../models/Admin');
const Complaint = require('../models/Complaint');

// @desc    Get system overview statistics
// @route   GET /api/super-admin/overview
// @access  Private (Super Admin only)
const getSystemOverview = asyncHandler(async (req, res) => {
  try {
    // Get total counts
    const totalStudents = await Student.countDocuments();
    const totalAdmins = await Admin.countDocuments();
    const totalComplaints = await Complaint.countDocuments();

    // Get complaints by status
    const complaintsByStatus = await Complaint.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get complaints by department
    const complaintsByDepartment = await Complaint.aggregate([
      {
        $lookup: {
          from: 'students',
          localField: 'student',
          foreignField: '_id',
          as: 'studentInfo'
        }
      },
      {
        $unwind: '$studentInfo'
      },
      {
        $group: {
          _id: '$studentInfo.department',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get recent complaints (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentComplaints = await Complaint.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Get complaints by category
    const complaintsByCategory = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get admin distribution by role
    const adminDistribution = await Admin.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get department-wise admin count
    const departmentAdminCount = await Admin.aggregate([
      {
        $match: { role: { $ne: 'super_admin' } }
      },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalStudents,
          totalAdmins,
          totalComplaints,
          recentComplaints
        },
        complaintsByStatus,
        complaintsByDepartment,
        complaintsByCategory,
        adminDistribution,
        departmentAdminCount
      }
    });
  } catch (error) {
    console.error('Error getting system overview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system overview'
    });
  }
});

// @desc    Get all students with pagination
// @route   GET /api/super-admin/students
// @access  Private (Super Admin only)
const getAllStudents = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const department = req.query.department || '';

    const skip = (page - 1) * limit;

    // Build query
    let query = {};

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { rollNo: { $regex: search, $options: 'i' } }
      ];
    }

    if (department) {
      query.department = department;
    }

    const students = await Student.find(query)
      .select('-password -passwordResetToken -passwordResetExpires')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Use lean() for read-only queries

    const total = await Student.countDocuments(query);

    res.json({
      success: true,
      data: {
        students,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalStudents: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students'
    });
  }
});

// @desc    Get all admins
// @route   GET /api/super-admin/admins
// @access  Private (Super Admin only)
const getAllAdmins = asyncHandler(async (req, res) => {
  try {
    const admins = await Admin.find({})
      .select('-password -passwordResetToken -passwordResetExpires')
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .lean({ virtuals: true }); // Use lean() for read-only queries

    res.json({
      success: true,
      data: { admins }
    });
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admins'
    });
  }
});

// @desc    Get all complaints with filters
// @route   GET /api/super-admin/complaints
// @access  Private (Super Admin only)
const getAllComplaints = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || '';
    const department = req.query.department || '';
    const category = req.query.category || '';

    const skip = (page - 1) * limit;

    // Build query
    let query = {};

    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    const complaints = await Complaint.find(query)
      .populate('student', 'firstName lastName email rollNo department')
      .populate('assignedTo', 'firstName lastName email role department')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true }); // Use lean() for read-only queries

    // Filter by department if specified
    let filteredComplaints = complaints;
    if (department) {
      filteredComplaints = complaints.filter(complaint =>
        complaint.student && complaint.student.department === department
      );
    }

    const total = await Complaint.countDocuments(query);

    res.json({
      success: true,
      data: {
        complaints: filteredComplaints,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalComplaints: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints'
    });
  }
});

// @desc    Create new admin
// @route   POST /api/super-admin/admins
// @access  Private (Super Admin only)
const createAdmin = asyncHandler(async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, department } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this email already exists'
      });
    }

    // Create new admin
    const newAdmin = new Admin({
      firstName,
      lastName,
      email,
      password,
      role,
      department: role !== 'super_admin' ? department : undefined,
      createdBy: req.user._id,
      isEmailVerified: true,
      isActive: true
    });

    await newAdmin.save();

    // Remove password from response
    const adminResponse = newAdmin.toObject();
    delete adminResponse.password;

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: { admin: adminResponse }
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create admin'
    });
  }
});

// @desc    Update admin
// @route   PUT /api/super-admin/admins/:id
// @access  Private (Super Admin only)
const updateAdmin = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow updating super admin
    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    if (admin.role === 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot modify super admin account'
      });
    }

    // Update admin
    const updatedAdmin = await Admin.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Admin updated successfully',
      data: { admin: updatedAdmin }
    });
  } catch (error) {
    console.error('Error updating admin:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update admin'
    });
  }
});

// @desc    Delete admin
// @route   DELETE /api/super-admin/admins/:id
// @access  Private (Super Admin only)
const deleteAdmin = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Don't allow deleting super admin
    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    if (admin.role === 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete super admin account'
      });
    }

    await Admin.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Admin deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete admin'
    });
  }
});

// @desc    Get system analytics
// @route   GET /api/super-admin/analytics
// @access  Private (Super Admin only)
const getSystemAnalytics = asyncHandler(async (req, res) => {
  try {
    // Get monthly complaint trends (last 12 months)
    const monthlyTrends = await Complaint.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Get resolution time analytics
    const resolutionTime = await Complaint.aggregate([
      {
        $match: { status: 'Resolved' }
      },
      {
        $project: {
          resolutionTime: {
            $divide: [
              { $subtract: ['$updatedAt', '$createdAt'] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          averageResolutionTime: { $avg: '$resolutionTime' },
          minResolutionTime: { $min: '$resolutionTime' },
          maxResolutionTime: { $max: '$resolutionTime' }
        }
      }
    ]);

    // Get top performing departments
    const departmentPerformance = await Complaint.aggregate([
      {
        $lookup: {
          from: 'students',
          localField: 'student',
          foreignField: '_id',
          as: 'studentInfo'
        }
      },
      {
        $unwind: '$studentInfo'
      },
      {
        $group: {
          _id: '$studentInfo.department',
          totalComplaints: { $sum: 1 },
          resolvedComplaints: {
            $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          department: '$_id',
          totalComplaints: 1,
          resolvedComplaints: 1,
          resolutionRate: {
            $multiply: [
              { $divide: ['$resolvedComplaints', '$totalComplaints'] },
              100
            ]
          }
        }
      },
      {
        $sort: { resolutionRate: -1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        monthlyTrends,
        resolutionTime: resolutionTime[0] || {},
        departmentPerformance
      }
    });
  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    });
  }
});

// @desc    Create new student
// @route   POST /api/super-admin/students
// @access  Private (Super Admin only)
const createStudent = asyncHandler(async (req, res) => {
  try {
    const { firstName, lastName, email, libraryId, rollNo, department, year, password } = req.body;

    // Check if student already exists
    const existingStudent = await Student.findOne({
      $or: [{ email }, { libraryId }, { rollNo }]
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Student with this email, library ID, or roll number already exists'
      });
    }

    // Create new student
    const newStudent = await Student.create({
      firstName,
      lastName,
      email,
      libraryId,
      rollNo,
      department,
      year,
      password,
      isEmailVerified: true,
      isActive: true
    });

    // Remove password from response
    const studentResponse = newStudent.toObject();
    delete studentResponse.password;

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: { student: studentResponse }
    });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create student'
    });
  }
});

// @desc    Update student
// @route   PUT /api/super-admin/students/:id
// @access  Private (Super Admin only)
const updateStudent = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow password update through this endpoint (use reset password endpoint)
    if (updates.password) {
      delete updates.password;
    }

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check for duplicate email, libraryId, or rollNo if being updated
    if (updates.email || updates.libraryId || updates.rollNo) {
      const duplicateQuery = { _id: { $ne: id } };
      if (updates.email) duplicateQuery.email = updates.email;
      if (updates.libraryId) duplicateQuery.libraryId = updates.libraryId;
      if (updates.rollNo) duplicateQuery.rollNo = updates.rollNo;

      const duplicate = await Student.findOne(duplicateQuery);
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: 'Another student with this email, library ID, or roll number already exists'
        });
      }
    }

    // Update student
    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: { student: updatedStudent }
    });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update student'
    });
  }
});

// @desc    Delete student
// @route   DELETE /api/super-admin/students/:id
// @access  Private (Super Admin only)
const deleteStudent = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    await Student.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete student'
    });
  }
});

// @desc    Reset admin password
// @route   PUT /api/super-admin/admins/:id/reset-password
// @access  Private (Super Admin only)
const resetAdminPassword = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    if (admin.role === 'super_admin' && admin._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Cannot reset password for another super admin'
      });
    }

    // Update password (will be hashed by pre-save middleware)
    admin.password = newPassword;
    // Also unlock the account and reset failed attempts
    admin.loginAttempts = 0;
    admin.lockUntil = undefined;
    await admin.save();

    res.json({
      success: true,
      message: 'Admin password reset and account unlocked successfully'
    });
  } catch (error) {
    console.error('Error resetting admin password:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset admin password'
    });
  }
});

// @desc    Unlock admin account
// @route   PUT /api/super-admin/admins/:id/unlock
// @access  Private (Super Admin only)
const unlockAdmin = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Unlock the account
    admin.loginAttempts = 0;
    admin.lockUntil = undefined;
    await admin.save();

    res.json({
      success: true,
      message: `Admin account (${admin.email}) unlocked successfully`
    });
  } catch (error) {
    console.error('Error unlocking admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unlock admin account'
    });
  }
});

// @desc    Reset student password
// @route   PUT /api/super-admin/students/:id/reset-password
// @access  Private (Super Admin only)
const resetStudentPassword = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Update password (will be hashed by pre-save middleware)
    student.password = newPassword;
    await student.save();

    res.json({
      success: true,
      message: 'Student password reset successfully'
    });
  } catch (error) {
    console.error('Error resetting student password:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset student password'
    });
  }
});

// @desc    Update complaint
// @route   PUT /api/super-admin/complaints/:id
// @access  Private (Super Admin only)
const updateComplaint = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Update complaint
    const updatedComplaint = await Complaint.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('student', 'firstName lastName email rollNo department')
      .populate('assignedTo', 'firstName lastName email role department');

    res.json({
      success: true,
      message: 'Complaint updated successfully',
      data: { complaint: updatedComplaint }
    });
  } catch (error) {
    console.error('Error updating complaint:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update complaint'
    });
  }
});

// @desc    Delete complaint
// @route   DELETE /api/super-admin/complaints/:id
// @access  Private (Super Admin only)
const deleteComplaint = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    await Complaint.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Complaint deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting complaint:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete complaint'
    });
  }
});

module.exports = {
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
};
