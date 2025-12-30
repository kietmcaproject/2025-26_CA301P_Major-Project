const Complaint = require('../models/Complaint');
const Student = require('../models/Student');
const Admin = require('../models/Admin');
const { asyncHandler } = require('../middleware/errorHandler');
const { invalidateComplaintCache, invalidateDashboardCache } = require('../utils/cacheHelper');
const {
  sendComplaintCreatedEmail,
  sendComplaintStatusUpdateEmail,
  sendCommentAddedEmail
} = require('../utils/emailService');

// Helper to get complaint URL (adjust based on your frontend URL)
const getComplaintUrl = (complaintId) => {
  const baseUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:3000';
  return `${baseUrl}/dashboard?complaint=${complaintId}`;
};

// @desc    Get all complaints (with filtering and pagination)
// @route   GET /api/complaints
// @access  Private (Student: own complaints, Admin: all complaints)
const getComplaints = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sort = '-createdAt',
    status,
    priority,
    category,
    department,
    search,
    assignedTo,
    coordinatorAssigned,
    additionalHodAssigned
  } = req.query;

  // Build filter object
  const filter = {};

  // Students can only see their own complaints
  if (req.userType === 'student') {
    filter.student = req.user._id;
  }

  // Admins can filter by department (if not super admin and not external department)
  const externalRoles = ['accounts', 'librarian', 'maintenance', 'external'];
  if (req.userType === 'admin' && req.user.role !== 'super_admin' && !externalRoles.includes(req.user.role)) {
    filter.department = req.user.department;
  }

  // For external departments, filter by externalForward.forwardedTo
  if (req.userType === 'admin' && externalRoles.includes(req.user.role)) {
    // Ensure department is capitalized to match enum values
    const userDepartment = req.user.department 
      ? req.user.department.charAt(0).toUpperCase() + req.user.department.slice(1)
      : null;
    
    if (userDepartment) {
      filter['externalForward.isForwarded'] = true;
      filter['externalForward.forwardedTo'] = userDepartment;
    } else {
      // If no department, return empty results
      filter['externalForward.isForwarded'] = false; // This will return no results
    }
  }

  // Apply filters
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (category) filter.category = category;
  if (department && req.userType === 'admin') filter.department = department;
  if (assignedTo) filter.assignedTo = assignedTo;
  if (coordinatorAssigned) filter['workflow.coordinatorAssigned'] = coordinatorAssigned;
  if (additionalHodAssigned) filter['workflow.additionalHodAssigned'] = additionalHodAssigned;

  // Search functionality
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Execute query with pagination - using lean() for better performance
  const complaints = await Complaint.find(filter)
    .populate('student', 'firstName lastName email libraryId rollNo department year')
    .populate('assignedTo', 'firstName lastName email role department')
    .populate('comments.commentedBy', 'firstName lastName email role')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .lean({ virtuals: true }); // Use lean() for read-only queries, keep virtuals

  // Get total count for pagination - use estimatedDocumentCount if no filters for better performance
  const total = Object.keys(filter).length === 0 
    ? await Complaint.estimatedDocumentCount()
    : await Complaint.countDocuments(filter);

  res.json({
    success: true,
    count: complaints.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    complaints
  });
});

// @desc    Get single complaint
// @route   GET /api/complaints/:id
// @access  Private
const getComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id)
    .populate('student', 'firstName lastName email libraryId rollNo department year')
    .populate('assignedTo', 'firstName lastName email role department')
    .populate('comments.commentedBy', 'firstName lastName email role')
    .lean({ virtuals: true }); // Use lean() for read-only queries, keep virtuals

  if (!complaint) {
    return res.status(404).json({
      success: false,
      message: 'Complaint not found'
    });
  }

  // Check access permissions
  if (req.userType === 'student' && complaint.student._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  // Check department access for admins
  if (req.userType === 'admin' && 
      req.user.role !== 'super_admin' && 
      complaint.department !== req.user.department &&
      complaint.department !== 'General') {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  res.json({
    success: true,
    complaint
  });
});

// @desc    Create new complaint
// @route   POST /api/complaints
// @access  Private (Student only)
const createComplaint = asyncHandler(async (req, res) => {
  const { title, description, category, priority, isPublic, anonymous } = req.body;

  // Get student's department
  const student = await Student.findById(req.user._id);
  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found'
    });
  }

  // Prefer assigning to Coordinator for this department; fallback to Additional HOD
  const coordinator = await Admin.findOne({
    role: 'coordinator',
    department: student.department,
    isActive: true
  });

  const additionalHOD = coordinator ? null : await Admin.findOne({ 
    role: 'additional_hod', 
    department: student.department,
    isActive: true 
  });

  const complaint = await Complaint.create({
    title,
    description,
    category,
    priority: priority || 'Medium',
    student: req.user._id,
    department: student.department,
    isPublic: isPublic || false,
    anonymous: anonymous || false,
    assignedTo: coordinator ? coordinator._id : (additionalHOD ? additionalHOD._id : null),
    workflow: coordinator ? {
      currentLevel: 'coordinator',
      coordinatorAssigned: coordinator._id
    } : {
      currentLevel: 'additional_hod',
      additionalHodAssigned: additionalHOD ? additionalHOD._id : null
    }
  });

  // Populate the created complaint
  await complaint.populate([
    { path: 'student', select: 'firstName lastName email libraryId rollNo department year' },
    { path: 'assignedTo', select: 'firstName lastName email role' }
  ]);

  // Invalidate cache after creating complaint
  await invalidateComplaintCache();
  await invalidateDashboardCache(req.user._id);

  // Send email notification to student (non-blocking)
  if (complaint.student && complaint.student.email) {
    sendComplaintCreatedEmail({
      email: complaint.student.email,
      name: `${complaint.student.firstName} ${complaint.student.lastName}`,
      complaint: complaint.toObject(),
      complaintUrl: getComplaintUrl(complaint._id)
    }).catch(err => {
      console.error('Failed to send complaint created email:', err);
      // Don't throw - email failure shouldn't break complaint creation
    });
  }

  res.status(201).json({
    success: true,
    message: 'Complaint created successfully',
    complaint
  });
});

// @desc    Update complaint
// @route   PUT /api/complaints/:id
// @access  Private
const updateComplaint = asyncHandler(async (req, res) => {
  const { status, priority, assignedTo, resolution, workflow } = req.body;

  let complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    return res.status(404).json({
      success: false,
      message: 'Complaint not found'
    });
  }

  // Store old status for email notification
  const oldStatus = complaint.status;

  // Check permissions
  if (req.userType === 'student') {
    // Students can only update their own complaints and only certain fields
    if (complaint.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Students cannot edit complaints that have been forwarded to Dean or Additional HOD
    // Check workflow level - handle both object and string formats
    const workflowLevel = (complaint.workflow && complaint.workflow.currentLevel) 
      ? complaint.workflow.currentLevel 
      : (complaint.workflow?.currentLevel || '')
    
    if (workflowLevel === 'dean' || workflowLevel === 'additional_hod') {
      return res.status(403).json({
        success: false,
        message: 'Cannot edit complaint. It has been forwarded to higher authority and is under review.'
      });
    }
    
    // Students can only edit complaints that are still pending or in progress
    if (complaint.status !== 'Pending' && complaint.status !== 'In Progress') {
      return res.status(400).json({
        success: false,
        message: 'Can only edit complaints that are Pending or In Progress'
      });
    }
    
    // Students can update complaint fields (title, description, category, priority)
    if (req.body.title) complaint.title = req.body.title;
    if (req.body.description) complaint.description = req.body.description;
    if (req.body.category) complaint.category = req.body.category;
    if (req.body.priority) {
      complaint.priority = req.body.priority;
      // Recalculate due date based on new priority
      const now = new Date();
      switch (req.body.priority) {
        case 'Urgent':
          complaint.dueDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day
          break;
        case 'High':
          complaint.dueDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
          break;
        case 'Medium':
          complaint.dueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
          break;
        case 'Low':
          complaint.dueDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days
          break;
      }
    }
    
    // Students can also update feedback
    if (req.body.feedback) {
      complaint.feedback = req.body.feedback;
      complaint.feedback.submittedAt = new Date();
    }
  } else if (req.userType === 'admin') {
    // Admins can update most fields
    // Additional HODs cannot modify complaints that have been forwarded to the Dean
    if (req.user.role === 'additional_hod' && complaint.workflow?.currentLevel === 'dean') {
      return res.status(403).json({
        success: false,
        message: 'Only the Dean can update complaints that have been forwarded to the Dean'
      });
    }

    if (status) complaint.status = status;
    if (priority) complaint.priority = priority;
    if (assignedTo) complaint.assignedTo = assignedTo;
    if (resolution) {
      complaint.resolution = {
        ...complaint.resolution,
        ...resolution,
        resolvedBy: req.user._id,
        resolvedAt: new Date()
      };
    }
    // Handle workflow updates
    if (workflow) {
      complaint.workflow = {
        ...complaint.workflow,
        ...workflow
      };
    }
  }

  complaint = await complaint.save();

  // Populate updated complaint
  await complaint.populate('student', 'firstName lastName email libraryId rollNo department year');
  await complaint.populate('assignedTo', 'firstName lastName email role department');

  // Invalidate cache after updating complaint
  await invalidateComplaintCache(complaint._id);
  await invalidateDashboardCache();

  // Send email notification if status changed (non-blocking)
  if (status && status !== oldStatus && complaint.student && complaint.student.email) {
    sendComplaintStatusUpdateEmail({
      email: complaint.student.email,
      name: `${complaint.student.firstName} ${complaint.student.lastName}`,
      complaint: complaint.toObject(),
      oldStatus,
      newStatus: status,
      complaintUrl: getComplaintUrl(complaint._id)
    }).catch(err => {
      console.error('Failed to send status update email:', err);
      // Don't throw - email failure shouldn't break complaint update
    });
  }

  res.json({
    success: true,
    message: 'Complaint updated successfully',
    complaint
  });
});

// @desc    Delete complaint
// @route   DELETE /api/complaints/:id
// @access  Private
const deleteComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    return res.status(404).json({
      success: false,
      message: 'Complaint not found'
    });
  }

  // Check permissions
  if (req.userType === 'student') {
    // Students can only delete their own pending complaints
    if (complaint.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    if (complaint.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only delete pending complaints'
      });
    }
  } else if (req.userType === 'admin') {
    // Super admin can delete any complaint
    if (req.user.role === 'super_admin') {
      // Super admin has full access
    } else if (req.user.role === 'coordinator' || req.user.role === 'additional_hod') {
      // Coordinators and Additional HODs can delete complaints from their department
      if (complaint.department !== req.user.department && complaint.department !== 'General') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only delete complaints from your department'
        });
      }

      // Additional HODs cannot delete complaints that have been forwarded to the Dean
      if (req.user.role === 'additional_hod' && complaint.workflow?.currentLevel === 'dean') {
        return res.status(403).json({
          success: false,
          message: 'Only the Dean can delete complaints that have been forwarded to the Dean'
        });
      }
    } else {
      // Other admins (Dean) can delete complaints from their department
      if (complaint.department !== req.user.department && complaint.department !== 'General') {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }
  }

  await complaint.deleteOne();

  // Invalidate cache after deleting complaint
  await invalidateComplaintCache();
  await invalidateDashboardCache();

  res.json({
    success: true,
    message: 'Complaint deleted successfully'
  });
});

// @desc    Add comment to complaint
// @route   POST /api/complaints/:id/comments
// @access  Private
const addComment = asyncHandler(async (req, res) => {
  const { comment, isInternal } = req.body;

  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    return res.status(404).json({
      success: false,
      message: 'Complaint not found'
    });
  }

  // Check if complaint is resolved - no one can comment on resolved or closed complaints
  if (complaint.status === 'Resolved' || complaint.status === 'Closed') {
    return res.status(400).json({
      success: false,
      message: 'Cannot add comment to a resolved or closed complaint'
    });
  }

  // Check permissions
  if (req.userType === 'student') {
    // Students can only comment on their own complaints
    if (complaint.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
  }

  // Add comment
  await complaint.addComment({
    comment,
    commentedBy: req.user._id,
    commentedByModel: req.userType === 'student' ? 'Student' : 'Admin',
    isInternal: isInternal || false
  });

  // Populate the updated complaint
  await complaint.populate('student', 'firstName lastName email libraryId rollNo department year');
  await complaint.populate('assignedTo', 'firstName lastName email role department');
  await complaint.populate('comments.commentedBy', 'firstName lastName email role');

  // Invalidate cache after adding comment
  await invalidateComplaintCache(complaint._id);

  // Send email notification (non-blocking)
  // Don't send email for internal comments
  if (!isInternal) {
    const commentedByUser = complaint.comments[complaint.comments.length - 1]?.commentedBy;
    const commentedByName = commentedByUser 
      ? `${commentedByUser.firstName || ''} ${commentedByUser.lastName || ''}`.trim() || 'System'
      : 'System';

    // If admin commented, notify student; if student commented, notify assigned admin
    if (req.userType === 'admin' && complaint.student && complaint.student.email) {
      sendCommentAddedEmail({
        email: complaint.student.email,
        name: `${complaint.student.firstName} ${complaint.student.lastName}`,
        complaint: complaint.toObject(),
        comment,
        commentedBy: commentedByName,
        complaintUrl: getComplaintUrl(complaint._id)
      }).catch(err => {
        console.error('Failed to send comment notification email:', err);
      });
    } else if (req.userType === 'student' && complaint.assignedTo && complaint.assignedTo.email) {
      sendCommentAddedEmail({
        email: complaint.assignedTo.email,
        name: `${complaint.assignedTo.firstName} ${complaint.assignedTo.lastName}`,
        complaint: complaint.toObject(),
        comment,
        commentedBy: commentedByName,
        complaintUrl: getComplaintUrl(complaint._id)
      }).catch(err => {
        console.error('Failed to send comment notification email:', err);
      });
    }
  }

  res.json({
    success: true,
    message: 'Comment added successfully',
    complaint
  });
});

// @desc    Assign complaint to admin
// @route   PUT /api/complaints/:id/assign
// @access  Private (Admin only)
const assignComplaint = asyncHandler(async (req, res) => {
  const { assignedTo } = req.body;

  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    return res.status(404).json({
      success: false,
      message: 'Complaint not found'
    });
  }

  // Check if admin exists
  const admin = await Admin.findById(assignedTo);
  if (!admin) {
    return res.status(404).json({
      success: false,
      message: 'Admin not found'
    });
  }

  // Check permissions
  if (req.user.role !== 'super_admin' && 
      complaint.department !== req.user.department &&
      complaint.department !== 'General') {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  // Assign complaint
  await complaint.assignTo(assignedTo, req.user._id);

  // Populate the updated complaint
  await complaint.populate('student', 'firstName lastName email libraryId rollNo department year');
  await complaint.populate('assignedTo', 'firstName lastName email role department');

  res.json({
    success: true,
    message: 'Complaint assigned successfully',
    complaint
  });
});

// @desc    Get complaint statistics
// @route   GET /api/complaints/stats
// @access  Private (Admin only)
const getComplaintStats = asyncHandler(async (req, res) => {
  const { department, startDate, endDate } = req.query;

  // Build filter
  const filter = {};
  
  if (department && req.user.role !== 'super_admin') {
    filter.department = req.user.department;
  } else if (department) {
    filter.department = department;
  }

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const stats = await Complaint.getStatistics(filter);

  // Get additional statistics
  const totalComplaints = await Complaint.countDocuments(filter);
  const resolvedComplaints = await Complaint.countDocuments({ ...filter, status: 'Resolved' });
  const avgResolutionTime = await Complaint.aggregate([
    { $match: { ...filter, status: 'Resolved', 'resolution.resolvedAt': { $exists: true } } },
    {
      $project: {
        resolutionTime: {
          $subtract: ['$resolution.resolvedAt', '$createdAt']
        }
      }
    },
    {
      $group: {
        _id: null,
        avgTime: { $avg: '$resolutionTime' }
      }
    }
  ]);

  res.json({
    success: true,
    stats: {
      ...stats,
      totalComplaints,
      resolvedComplaints,
      resolutionRate: totalComplaints > 0 ? (resolvedComplaints / totalComplaints * 100).toFixed(2) : 0,
      avgResolutionTimeHours: avgResolutionTime.length > 0 ? 
        Math.round(avgResolutionTime[0].avgTime / (1000 * 60 * 60)) : 0
    }
  });
});

// @desc    Escalate complaint to Dean
// @route   PUT /api/complaints/:id/escalate
// @access  Private (Additional HOD only)
const escalateComplaint = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { escalationReason } = req.body;
  const { user } = req;

  // Only additional HODs can escalate
  if (user.role !== 'additional_hod') {
    return res.status(403).json({
      success: false,
      message: 'Only Additional HODs can escalate complaints'
    });
  }

  if (!escalationReason || escalationReason.trim().length < 10) {
    return res.status(400).json({
      success: false,
      message: 'Escalation reason is required and must be at least 10 characters'
    });
  }

  const complaint = await Complaint.findById(id);

  if (!complaint) {
    return res.status(404).json({
      success: false,
      message: 'Complaint not found'
    });
  }

  // Check if complaint belongs to the same department
  if (complaint.department !== user.department) {
    return res.status(403).json({
      success: false,
      message: 'You can only escalate complaints from your department'
    });
  }

  // Find the Dean for this department
  const dean = await Admin.findOne({ 
    role: 'dean', 
    department: user.department,
    isActive: true 
  });

  if (!dean) {
    return res.status(404).json({
      success: false,
      message: 'Dean not found for this department'
    });
  }

  // Update complaint with escalation details
  complaint.workflow = {
    ...complaint.workflow,
    currentLevel: 'dean',
    coordinatorAssigned: complaint.workflow?.coordinatorAssigned || null,
    additionalHodAssigned: complaint.workflow?.additionalHodAssigned || user._id,
    deanAssigned: dean._id,
    escalatedBy: user._id,
    escalatedAt: new Date(),
    escalationReason: escalationReason.trim()
  };

  complaint.assignedTo = dean._id;
  complaint.status = 'Pending'; // Reset status for Dean review

  await complaint.save();

  res.json({
    success: true,
    message: 'Complaint escalated to Dean successfully',
    complaint: await Complaint.findById(id)
      .populate('student', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email role')
      .populate('workflow.escalatedBy', 'firstName lastName email')
  });
});

// @desc    Assign complaint to Additional HOD
// @route   PUT /api/complaints/:id/assign
// @access  Private (Dean only)
const assignToAdditionalHOD = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { assignedTo, workflow } = req.body;
  const { user } = req;

  // Only Deans can assign to additional HODs
  if (user.role !== 'dean') {
    return res.status(403).json({
      success: false,
      message: 'Only Deans can assign complaints to Additional HODs'
    });
  }

  if (!assignedTo) {
    return res.status(400).json({
      success: false,
      message: 'Additional HOD assignment is required'
    });
  }

  const complaint = await Complaint.findById(id);

  if (!complaint) {
    return res.status(404).json({
      success: false,
      message: 'Complaint not found'
    });
  }

  // Check if complaint belongs to the same department
  if (complaint.department !== user.department) {
    return res.status(403).json({
      success: false,
      message: 'You can only assign complaints from your department'
    });
  }

  // Verify the assigned admin is an additional HOD in the same department
  const additionalHOD = await Admin.findOne({ 
    _id: assignedTo,
    role: 'additional_hod', 
    department: user.department,
    isActive: true 
  });

  if (!additionalHOD) {
    return res.status(404).json({
      success: false,
      message: 'Additional HOD not found or not in your department'
    });
  }

  // Update complaint assignment
  complaint.assignedTo = assignedTo;
  
  if (workflow) {
    complaint.workflow = {
      ...complaint.workflow,
      ...workflow
    };
  }

  await complaint.save();

  res.json({
    success: true,
    message: 'Complaint assigned to Additional HOD successfully',
    complaint: await Complaint.findById(id)
      .populate('student', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email role')
  });
});

// @desc    Forward complaint (Coordinator -> Additional HOD or Dean)
// @route   PUT /api/complaints/:id/forward
// @access  Private (Coordinator only)
const forwardComplaint = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { targetLevel, reason } = req.body;
  const { user } = req;

  if (user.role !== 'coordinator') {
    return res.status(403).json({ success: false, message: 'Only Coordinators can forward complaints' });
  }

  if (!['additional_hod', 'dean'].includes(targetLevel)) {
    return res.status(400).json({ success: false, message: 'targetLevel must be additional_hod or dean' });
  }

  const complaint = await Complaint.findById(id);
  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found' });
  }

  // Must be same department unless General
  if (complaint.department !== user.department && complaint.department !== 'General') {
    return res.status(403).json({ success: false, message: 'Access denied for this complaint department' });
  }

  // Find target admin in same department
  const targetAdmin = await Admin.findOne({ role: targetLevel, department: user.department, isActive: true });
  if (!targetAdmin) {
    return res.status(404).json({ success: false, message: `${targetLevel} not found for this department` });
  }

  // Update assignment and workflow
  complaint.assignedTo = targetAdmin._id;
  complaint.workflow = {
    ...complaint.workflow,
    currentLevel: targetLevel,
    coordinatorAssigned: complaint.workflow?.coordinatorAssigned || user._id,
    additionalHodAssigned: targetLevel === 'additional_hod' ? targetAdmin._id : complaint.workflow?.additionalHodAssigned,
    deanAssigned: targetLevel === 'dean' ? targetAdmin._id : complaint.workflow?.deanAssigned,
    escalatedBy: user._id,
    escalatedAt: new Date(),
    escalationReason: reason || `Forwarded by Coordinator to ${targetLevel}`
  };

  // Reset status to Pending on forward
  complaint.status = 'Pending';

  // Add internal comment
  complaint.comments.push({
    comment: `Forwarded to ${targetLevel.toUpperCase()}${reason ? `: ${reason}` : ''}`,
    commentedBy: user._id,
    commentedByModel: 'Admin',
    isInternal: true
  });

  await complaint.save();

  const populated = await Complaint.findById(id)
    .populate('student', 'firstName lastName email')
    .populate('assignedTo', 'firstName lastName email role');

  res.json({ success: true, message: 'Complaint forwarded successfully', complaint: populated });
});

// @desc    Forward complaint to external department (Dean -> Accounts/Librarian/Maintenance)
// @route   PUT /api/complaints/:id/forward-external
// @access  Private (Dean only)
const forwardToExternal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { forwardReason, forwardedTo } = req.body;
  const { user } = req;

  // Only Deans can forward to external departments
  if (user.role !== 'dean') {
    return res.status(403).json({ 
      success: false, 
      message: 'Only Deans can forward complaints to external departments' 
    });
  }

  const complaint = await Complaint.findById(id);
  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found' });
  }

  // Check if complaint belongs to the same department
  if (complaint.department !== user.department && complaint.department !== 'General') {
    return res.status(403).json({ 
      success: false, 
      message: 'You can only forward complaints from your department' 
    });
  }

  // Validate forwardedTo parameter
  const validDepartments = ['Accounts', 'Librarian', 'Maintenance'];
  if (!forwardedTo || !validDepartments.includes(forwardedTo)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid department. Please select Accounts, Librarian, or Maintenance.' 
    });
  }

  // Update external forward information
  complaint.externalForward = {
    isForwarded: true,
    forwardedTo: forwardedTo,
    forwardedBy: user._id,
    forwardedAt: new Date(),
    forwardReason: forwardReason || `Forwarded to ${forwardedTo} department by Dean`
  };

  // Update status to In Progress
  complaint.status = 'In Progress';

  // Add comment
  complaint.comments.push({
    comment: `Forwarded to ${forwardedTo} Department${forwardReason ? `: ${forwardReason}` : ''}`,
    commentedBy: user._id,
    commentedByModel: 'Admin',
    isInternal: false // External forwards are visible to students
  });

  await complaint.save();

  const populated = await Complaint.findById(id)
    .populate('student', 'firstName lastName email')
    .populate('assignedTo', 'firstName lastName email role')
    .populate('externalForward.forwardedBy', 'firstName lastName email role');

  res.json({ 
    success: true, 
    message: `Complaint forwarded to ${forwardedTo} Department successfully`, 
    complaint: populated 
  });
});

// @desc    Acknowledge complaint from external department
// @route   PUT /api/complaints/:id/acknowledge-external
// @access  Private (External departments - Accounts/Librarian/Maintenance)
const acknowledgeExternal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { acknowledgementComment } = req.body;
  const { user } = req;

  // Check if user is an external department admin
  const externalRoles = ['accounts', 'librarian', 'maintenance'];
  if (!externalRoles.includes(user.role)) {
    return res.status(403).json({ 
      success: false, 
      message: 'Only external department admins can acknowledge complaints' 
    });
  }

  const complaint = await Complaint.findById(id);
  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found' });
  }

  // Check if complaint is forwarded to external department
  if (!complaint.externalForward?.isForwarded) {
    return res.status(400).json({ 
      success: false, 
      message: 'This complaint has not been forwarded to an external department' 
    });
  }

  // Map role to department name
  const roleToDepartment = {
    'accounts': 'Accounts',
    'librarian': 'Librarian',
    'maintenance': 'Maintenance'
  };
  const userDepartment = roleToDepartment[user.role] || user.department;

  // Verify that the complaint is forwarded to this admin's department
  if (complaint.externalForward.forwardedTo !== userDepartment) {
    return res.status(403).json({ 
      success: false, 
      message: `You can only acknowledge complaints forwarded to ${userDepartment} Department` 
    });
  }

  // Check if already acknowledged
  if (complaint.externalForward?.acknowledged) {
    return res.status(400).json({ 
      success: false, 
      message: 'This complaint has already been acknowledged' 
    });
  }

  // Update acknowledgement information
  complaint.externalForward.acknowledged = true;
  complaint.externalForward.acknowledgedAt = new Date();
  if (acknowledgementComment) {
    complaint.externalForward.acknowledgementComment = acknowledgementComment;
  }

  // Add comment
  complaint.comments.push({
    comment: `Acknowledged by ${complaint.externalForward.forwardedTo} Department${acknowledgementComment ? `: ${acknowledgementComment}` : ''}`,
    commentedBy: req.user._id,
    commentedByModel: 'Admin',
    isInternal: false // Visible to students
  });

  await complaint.save();

  const populated = await Complaint.findById(id)
    .populate('student', 'firstName lastName email')
    .populate('assignedTo', 'firstName lastName email role')
    .populate('externalForward.forwardedBy', 'firstName lastName email role');

  res.json({ 
    success: true, 
    message: `Complaint acknowledged successfully`, 
    complaint: populated 
  });
});

// @desc    Close complaint after external acknowledgement (Dean only)
// @route   PUT /api/complaints/:id/close-external
// @access  Private (Dean only)
const closeExternalComplaint = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { closeComment } = req.body;
  const { user } = req;

  // Only Deans can close external complaints
  if (user.role !== 'dean') {
    return res.status(403).json({ 
      success: false, 
      message: 'Only Deans can close complaints forwarded to external departments' 
    });
  }

  const complaint = await Complaint.findById(id);
  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found' });
  }

  // Check if complaint belongs to the same department
  if (complaint.department !== user.department && complaint.department !== 'General') {
    return res.status(403).json({ 
      success: false, 
      message: 'You can only close complaints from your department' 
    });
  }

  // Check if complaint is forwarded to external department
  if (!complaint.externalForward?.isForwarded) {
    return res.status(400).json({ 
      success: false, 
      message: 'This complaint has not been forwarded to an external department' 
    });
  }

  // Check if acknowledged
  if (!complaint.externalForward?.acknowledged) {
    return res.status(400).json({ 
      success: false, 
      message: 'Cannot close complaint. External department has not acknowledged yet.' 
    });
  }

  // Check if already closed
  if (complaint.status === 'Closed') {
    return res.status(400).json({ 
      success: false, 
      message: 'This complaint is already closed' 
    });
  }

  // Update status to Closed
  complaint.status = 'Closed';

  // Add comment
  complaint.comments.push({
    comment: `Complaint closed by Dean after acknowledgement from ${complaint.externalForward.forwardedTo} Department${closeComment ? `: ${closeComment}` : ''}`,
    commentedBy: user._id,
    commentedByModel: 'Admin',
    isInternal: false // Visible to students
  });

  await complaint.save();

  const populated = await Complaint.findById(id)
    .populate('student', 'firstName lastName email')
    .populate('assignedTo', 'firstName lastName email role')
    .populate('externalForward.forwardedBy', 'firstName lastName email role');

  res.json({ 
    success: true, 
    message: 'Complaint closed successfully', 
    complaint: populated 
  });
});

// @desc    Upload attachments to complaint
// @route   POST /api/complaints/:id/attachments
// @access  Private
const uploadAttachments = asyncHandler(async (req, res) => {
  const complaintId = req.params.id;
  
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Please upload at least one file'
    });
  }

  // Find complaint
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) {
    return res.status(404).json({
      success: false,
      message: 'Complaint not found'
    });
  }

  // Check permissions
  if (req.userType === 'student') {
    if (complaint.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
  }

  // Process uploaded files with proper logging
  const attachments = req.files.map((file, index) => {
    // Determine file type
    const isPdf = file.mimetype === 'application/pdf';
    const isImage = file.mimetype.startsWith('image/');
    
    // Get the secure URL from Cloudinary
    // CloudinaryStorage provides: path, url, secure_url, public_id, resource_type, etc.
    const cloudinaryUrl = file.secure_url || file.url || file.path;
    
    // Log upload details for debugging
    console.log(`[Upload ${index + 1}] File upload details:`, {
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      isPdf,
      isImage,
      cloudinaryUrl,
      resource_type: file.resource_type || 'unknown',
      public_id: file.public_id || 'unknown'
    });
    
    // Validate that we have a Cloudinary URL
    if (!cloudinaryUrl) {
      console.error(`[Upload ${index + 1}] ERROR: No URL returned from Cloudinary for file:`, file.originalname);
      console.error(`[Upload ${index + 1}] File object keys:`, Object.keys(file));
      console.error(`[Upload ${index + 1}] File object:`, JSON.stringify(file, null, 2));
      throw new Error(`Failed to get upload URL for file: ${file.originalname}`);
    }
    
    // Ensure we have a full Cloudinary URL (not relative path)
    if (!cloudinaryUrl.startsWith('http://') && !cloudinaryUrl.startsWith('https://')) {
      console.error(`[Upload ${index + 1}] ERROR: URL is not a full URL (missing http/https):`, cloudinaryUrl);
      throw new Error(`Invalid URL format for file: ${file.originalname}. Expected full Cloudinary URL.`);
    }
    
    // Ensure PDFs have the correct Cloudinary URL format
    if (isPdf && !cloudinaryUrl.includes('cloudinary.com')) {
      console.error(`[Upload ${index + 1}] ERROR: PDF URL is not a Cloudinary URL:`, cloudinaryUrl);
      throw new Error(`Invalid PDF URL format for file: ${file.originalname}. Expected Cloudinary URL.`);
    }
    
    // Log the final URL that will be stored
    console.log(`[Upload ${index + 1}] Final URL to be stored in database:`, cloudinaryUrl);
    
    // Log successful PDF upload
    if (isPdf) {
      console.log(`[Upload ${index + 1}] PDF successfully uploaded to Cloudinary:`, {
        url: cloudinaryUrl,
        resource_type: file.resource_type || 'raw',
        public_id: file.public_id
      });
    }
    
    return {
      filename: file.filename || file.originalname,
      originalName: file.originalname,
      path: cloudinaryUrl, // Store the Cloudinary secure URL
      size: file.size || 0,
      uploadedAt: new Date()
    };
  });

  // Add attachments to complaint
  complaint.attachments.push(...attachments);
  await complaint.save();

  // Invalidate cache
  await invalidateComplaintCache();
  await invalidateDashboardCache(complaint.student.toString());

  res.json({
    success: true,
    message: 'Attachments uploaded successfully',
    attachments: complaint.attachments.slice(-attachments.length) // Return only newly added attachments
  });
});

// @desc    Proxy image file from Cloudinary
// @route   GET /api/complaints/attachments/image
// @access  Public (but validates Cloudinary URL for security)
const proxyImage = (req, res) => {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({
      success: false,
      message: 'Image URL is required'
    });
  }

  try {
    // Validate that the URL is from Cloudinary
    if (!url.includes('cloudinary.com')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image URL'
      });
    }

    // Use Node.js built-in https/http to fetch the image
    const https = require('https');
    const http = require('http');
    const { URL: URLParser } = require('url');
    
    const parsedUrl = new URLParser(url);
    const client = parsedUrl.protocol === 'https:' ? https : http;
    
    const request = client.get(url, (response) => {
      // Handle redirects (max 5 redirects to prevent loops)
      if ((response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 307 || response.statusCode === 308) && response.headers.location) {
        const redirectUrl = response.headers.location;
        const redirectCount = (req.redirectCount || 0) + 1;
        
        if (redirectCount > 5) {
          return res.status(500).json({
            success: false,
            message: 'Too many redirects'
          });
        }
        
        // Handle relative redirects
        const fullRedirectUrl = redirectUrl.startsWith('http') 
          ? redirectUrl 
          : `${parsedUrl.protocol}//${parsedUrl.host}${redirectUrl}`;
        
        return proxyImage({ ...req, query: { url: fullRedirectUrl }, redirectCount }, res);
      }

      if (response.statusCode !== 200) {
        if (!res.headersSent) {
          return res.status(response.statusCode).json({
            success: false,
            message: 'Failed to fetch image from Cloudinary'
          });
        }
        return;
      }

      // Determine content type from response or URL
      let contentType = response.headers['content-type'] || 'image/jpeg';
      if (!contentType.startsWith('image/')) {
        // Try to determine from URL extension
        if (url.match(/\.(jpg|jpeg)$/i)) contentType = 'image/jpeg';
        else if (url.match(/\.png$/i)) contentType = 'image/png';
        else if (url.match(/\.gif$/i)) contentType = 'image/gif';
        else if (url.match(/\.webp$/i)) contentType = 'image/webp';
        else contentType = 'image/jpeg'; // Default
      }

      // Set appropriate headers
      if (!res.headersSent) {
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `inline; filename="image"`);
        res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET');
      }
      
      // Pipe the response directly to the client
      response.pipe(res);
    });
    
    request.on('error', (error) => {
      console.error('Error proxying image:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error fetching image'
        });
      }
    });
    
    // Set timeout
    request.setTimeout(30000, () => {
      request.destroy();
      if (!res.headersSent) {
        res.status(504).json({
          success: false,
          message: 'Request timeout'
        });
      }
    });
  } catch (error) {
    console.error('Error proxying image:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Error fetching image'
      });
    }
  }
};

// @desc    Proxy PDF file from Cloudinary
// @route   GET /api/complaints/attachments/pdf
// @access  Public (but validates Cloudinary URL for security)
const proxyPdf = (req, res) => {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({
      success: false,
      message: 'PDF URL is required'
    });
  }

  try {
    // Validate that the URL is from Cloudinary
    if (!url.includes('cloudinary.com')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid PDF URL'
      });
    }

    // Use Node.js built-in https/http to fetch the PDF
    const https = require('https');
    const http = require('http');
    const { URL: URLParser } = require('url');
    
    const parsedUrl = new URLParser(url);
    const client = parsedUrl.protocol === 'https:' ? https : http;
    
    const request = client.get(url, (response) => {
      // Handle redirects (max 5 redirects to prevent loops)
      if ((response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 307 || response.statusCode === 308) && response.headers.location) {
        const redirectUrl = response.headers.location;
        const redirectCount = (req.redirectCount || 0) + 1;
        
        if (redirectCount > 5) {
          return res.status(500).json({
            success: false,
            message: 'Too many redirects'
          });
        }
        
        // Handle relative redirects
        const fullRedirectUrl = redirectUrl.startsWith('http') 
          ? redirectUrl 
          : `${parsedUrl.protocol}//${parsedUrl.host}${redirectUrl}`;
        
        return proxyPdf({ ...req, query: { url: fullRedirectUrl }, redirectCount }, res);
      }

      if (response.statusCode !== 200) {
        if (!res.headersSent) {
          return res.status(response.statusCode).json({
            success: false,
            message: 'Failed to fetch PDF from Cloudinary'
          });
        }
        return;
      }

      // Set appropriate headers
      if (!res.headersSent) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="document.pdf"`);
        res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET');
      }
      
      // Pipe the response directly to the client
      response.pipe(res);
    });
    
    request.on('error', (error) => {
      console.error('Error proxying PDF:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error fetching PDF'
        });
      }
    });
    
    // Set timeout
    request.setTimeout(30000, () => {
      request.destroy();
      if (!res.headersSent) {
        res.status(504).json({
          success: false,
          message: 'Request timeout'
        });
      }
    });
  } catch (error) {
    console.error('Error proxying PDF:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Error fetching PDF'
      });
    }
  }
};

module.exports = {
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
};
