const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Complaint title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Complaint description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Complaint category is required'],
    enum: {
      values: [
        'Academic',
        'Infrastructure',
        'Library',
        'Hostel',
        'Cafeteria',
        'Transport',
        'Faculty',
        'Administration',
        'Examination',
        'Fee',
        'Other'
      ],
      message: 'Please select a valid complaint category'
    }
  },
  priority: {
    type: String,
    enum: {
      values: ['Low', 'Medium', 'High', 'Urgent'],
      message: 'Priority must be Low, Medium, High, or Urgent'
    },
    default: 'Medium'
  },
  status: {
    type: String,
    enum: {
      values: ['Pending', 'In Progress', 'Resolved', 'Rejected', 'Closed'],
      message: 'Status must be Pending, In Progress, Resolved, Rejected, or Closed'
    },
    default: 'Pending'
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student reference is required']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  },
  workflow: {
    currentLevel: {
      type: String,
      enum: ['coordinator', 'additional_hod', 'dean'],
      default: 'coordinator'
    },
    coordinatorAssigned: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null
    },
    additionalHodAssigned: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null
    },
    deanAssigned: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null
    },
    escalatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null
    },
    escalatedAt: {
      type: Date,
      default: null
    },
    escalationReason: {
      type: String,
      trim: true,
      maxlength: [500, 'Escalation reason cannot exceed 500 characters']
    }
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: {
      values: ['MCA', 'MBA', 'CSE', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'General'],
      message: 'Please select a valid department'
    }
  },
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    commentedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'comments.commentedByModel',
      required: true
    },
    commentedByModel: {
      type: String,
      enum: ['Student', 'Admin'],
      required: true
    },
    isInternal: {
      type: Boolean,
      default: false // Internal comments are only visible to admins
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  resolution: {
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Resolution description cannot exceed 1000 characters']
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    resolvedAt: Date,
    resolutionType: {
      type: String,
      enum: {
        values: ['Fixed', 'Under Review', 'Not Applicable', 'Duplicate', 'Invalid'],
        message: 'Please select a valid resolution type'
      }
    }
  },
  escalation: {
    isEscalated: {
      type: Boolean,
      default: false
    },
    escalatedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    escalatedAt: Date,
    escalationReason: String
  },
  externalForward: {
    isForwarded: {
      type: Boolean,
      default: false
    },
    forwardedTo: {
      type: String,
      enum: ['Accounts', 'Librarian', 'Maintenance'],
      default: null
    },
    forwardedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null
    },
    forwardedAt: {
      type: Date,
      default: null
    },
    forwardReason: {
      type: String,
      trim: true,
      maxlength: [500, 'Forward reason cannot exceed 500 characters']
    },
    acknowledged: {
      type: Boolean,
      default: false
    },
    acknowledgedAt: {
      type: Date,
      default: null
    },
    acknowledgementComment: {
      type: String,
      trim: true,
      maxlength: [500, 'Acknowledgement comment cannot exceed 500 characters']
    }
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  dueDate: Date,
  isPublic: {
    type: Boolean,
    default: false // Whether complaint is visible to other students
  },
  anonymous: {
    type: Boolean,
    default: false
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'Feedback comment cannot exceed 500 characters']
    },
    submittedAt: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for complaint number (auto-generated)
complaintSchema.virtual('complaintNumber').get(function() {
  return `COMP-${this._id.toString().slice(-8).toUpperCase()}`;
});

// Virtual for days since creation
complaintSchema.virtual('daysSinceCreation').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for is overdue
complaintSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate) return false;
  return new Date() > this.dueDate && this.status !== 'Resolved' && this.status !== 'Closed';
});

// Indexes for better query performance
complaintSchema.index({ student: 1 });
complaintSchema.index({ assignedTo: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ category: 1 });
complaintSchema.index({ department: 1 });
complaintSchema.index({ priority: 1 });
complaintSchema.index({ createdAt: -1 });
complaintSchema.index({ dueDate: 1 });

// Compound indexes for common query patterns
complaintSchema.index({ status: 1, priority: 1 });
complaintSchema.index({ department: 1, status: 1 });
complaintSchema.index({ assignedTo: 1, status: 1 });
complaintSchema.index({ student: 1, status: 1 });
complaintSchema.index({ student: 1, createdAt: -1 });
complaintSchema.index({ 'externalForward.isForwarded': 1, 'externalForward.forwardedTo': 1 });
complaintSchema.index({ 'workflow.currentLevel': 1, department: 1 });
complaintSchema.index({ createdAt: -1, status: 1 });

// Pre-save middleware to set due date based on priority
complaintSchema.pre('save', function(next) {
  if (this.isNew && !this.dueDate) {
    const now = new Date();
    switch (this.priority) {
      case 'Urgent':
        this.dueDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day
        break;
      case 'High':
        this.dueDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
        break;
      case 'Medium':
        this.dueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
        break;
      case 'Low':
        this.dueDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days
        break;
    }
  }
  next();
});

// Instance method to add comment
complaintSchema.methods.addComment = function(commentData) {
  this.comments.push({
    comment: commentData.comment,
    commentedBy: commentData.commentedBy,
    commentedByModel: commentData.commentedByModel,
    isInternal: commentData.isInternal || false
  });
  return this.save();
};

// Instance method to update status
complaintSchema.methods.updateStatus = function(newStatus, updatedBy) {
  this.status = newStatus;
  
  // Add automatic comment for status change
  this.comments.push({
    comment: `Status changed to ${newStatus}`,
    commentedBy: updatedBy,
    commentedByModel: 'Admin',
    isInternal: false
  });
  
  // Set resolution data if status is resolved
  if (newStatus === 'Resolved') {
    this.resolution.resolvedBy = updatedBy;
    this.resolution.resolvedAt = new Date();
  }
  
  return this.save();
};

// Instance method to assign complaint
complaintSchema.methods.assignTo = function(adminId, assignedBy) {
  this.assignedTo = adminId;
  
  // Add comment for assignment
  this.comments.push({
    comment: `Complaint assigned to admin`,
    commentedBy: assignedBy,
    commentedByModel: 'Admin',
    isInternal: true
  });
  
  return this.save();
};

// Instance method to escalate complaint
complaintSchema.methods.escalate = function(escalatedTo, reason, escalatedBy) {
  this.escalation = {
    isEscalated: true,
    escalatedTo: escalatedTo,
    escalatedAt: new Date(),
    escalationReason: reason
  };
  
  // Add comment for escalation
  this.comments.push({
    comment: `Complaint escalated: ${reason}`,
    commentedBy: escalatedBy,
    commentedByModel: 'Admin',
    isInternal: true
  });
  
  return this.save();
};

// Static method to get complaint statistics
complaintSchema.statics.getStatistics = async function(filters = {}) {
  const pipeline = [
    { $match: filters },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] } },
        resolved: { $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] } },
        rejected: { $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] } },
        closed: { $sum: { $cond: [{ $eq: ['$status', 'Closed'] }, 1, 0] } },
        urgent: { $sum: { $cond: [{ $eq: ['$priority', 'Urgent'] }, 1, 0] } },
        high: { $sum: { $cond: [{ $eq: ['$priority', 'High'] }, 1, 0] } },
        medium: { $sum: { $cond: [{ $eq: ['$priority', 'Medium'] }, 1, 0] } },
        low: { $sum: { $cond: [{ $eq: ['$priority', 'Low'] }, 1, 0] } }
      }
    }
  ];
  
  const result = await this.aggregate(pipeline);
  return result[0] || {
    total: 0, pending: 0, inProgress: 0, resolved: 0, rejected: 0, closed: 0,
    urgent: 0, high: 0, medium: 0, low: 0
  };
};

module.exports = mongoose.model('Complaint', complaintSchema);
