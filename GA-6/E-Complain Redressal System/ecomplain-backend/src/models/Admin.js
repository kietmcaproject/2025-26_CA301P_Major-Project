const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i,
      'Please provide a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: {
      values: ['coordinator', 'additional_hod', 'dean', 'super_admin', 'accounts', 'librarian', 'maintenance', 'external'],
      message: 'Role must be one of coordinator, additional_hod, dean, super_admin, accounts, librarian, maintenance, or external'
    },
    default: 'additional_hod'
  },
  department: {
    type: String,
    required: function () {
      return this.role === 'coordinator' || this.role === 'additional_hod' || this.role === 'dean' ||
        this.role === 'accounts' || this.role === 'librarian' || this.role === 'maintenance' || this.role === 'external';
    },
    validate: {
      validator: function (value) {
        // For external role, allow any department name
        if (this.role === 'external') {
          return value && value.trim().length > 0;
        }
        // For other roles, validate against allowed values
        const allowedDepartments = ['MCA', 'MBA', 'CSE', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'General', 'Accounts', 'Librarian', 'Maintenance'];
        return allowedDepartments.includes(value);
      },
      message: 'Please enter a valid department name'
    }
  },
  permissions: {
    canManageComplaints: {
      type: Boolean,
      default: true
    },
    canManageStudents: {
      type: Boolean,
      default: false
    },
    canManageAdmins: {
      type: Boolean,
      default: false
    },
    canViewReports: {
      type: Boolean,
      default: true
    },
    canExportData: {
      type: Boolean,
      default: false
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  // Recovery email for super admin password reset (uses real email address)
  recoveryEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: function () {
      return this.role !== 'super_admin';
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
adminSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for account lock status
adminSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Virtual for display role
adminSchema.virtual('displayRole').get(function () {
  const roleMap = {
    'coordinator': 'Coordinator',
    'additional_hod': 'Additional HOD',
    'dean': 'Dean',
    'super_admin': 'Super Administrator',
    'accounts': 'Accounts Department',
    'librarian': 'Librarian',
    'maintenance': 'Maintenance Department',
    'external': 'External Department'
  };
  return roleMap[this.role] || this.role;
});

// Index for better query performance
adminSchema.index({ role: 1 });
adminSchema.index({ department: 1 });
adminSchema.index({ isActive: 1 });
// Compound indexes for common queries
adminSchema.index({ role: 1, department: 1, isActive: 1 });
// Note: email already has a unique index from the unique: true option

// Pre-save middleware to hash password
adminSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to set permissions based on role
adminSchema.pre('save', function (next) {
  if (this.isModified('role')) {
    switch (this.role) {
      case 'coordinator':
        this.permissions = {
          canManageComplaints: true,
          canManageStudents: false,
          canManageAdmins: false,
          canViewReports: true,
          canExportData: false
        };
        break;
      case 'super_admin':
        this.permissions = {
          canManageComplaints: true,
          canManageStudents: true,
          canManageAdmins: true,
          canViewReports: true,
          canExportData: true
        };
        break;
      case 'dean':
        this.permissions = {
          canManageComplaints: true,
          canManageStudents: false,
          canManageAdmins: true,
          canViewReports: true,
          canExportData: true
        };
        break;
      case 'additional_hod':
        this.permissions = {
          canManageComplaints: true,
          canManageStudents: false,
          canManageAdmins: false,
          canViewReports: true,
          canExportData: false
        };
        break;
      case 'accounts':
      case 'librarian':
      case 'maintenance':
      case 'external':
        this.permissions = {
          canManageComplaints: true,
          canManageStudents: false,
          canManageAdmins: false,
          canViewReports: true,
          canExportData: false
        };
        // Set department based on role (only for predefined roles, not external)
        if (this.role === 'accounts') {
          this.department = 'Accounts';
        } else if (this.role === 'librarian') {
          this.department = 'Librarian';
        } else if (this.role === 'maintenance') {
          this.department = 'Maintenance';
        }
        // For 'external' role, department is set manually from form
        break;
    }
  }
  next();
});

// Instance method to check password
adminSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to generate email verification token
adminSchema.methods.generateEmailVerificationToken = function () {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');

  this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return token;
};

// Instance method to generate password reset token
adminSchema.methods.generatePasswordResetToken = function () {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return token;
};

// Instance method to increment login attempts
adminSchema.methods.incLoginAttempts = function () {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }

  return this.updateOne(updates);
};

// Instance method to reset login attempts
adminSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Instance method to check if admin has permission
adminSchema.methods.hasPermission = function (permission) {
  return this.permissions[permission] === true;
};

// Static method to create super admin
adminSchema.statics.createSuperAdmin = async function (adminData) {
  const superAdmin = new this({
    ...adminData,
    role: 'super_admin',
    isEmailVerified: true,
    isActive: true
  });

  // Set all permissions to true for super admin
  superAdmin.permissions = {
    canManageComplaints: true,
    canManageStudents: true,
    canManageAdmins: true,
    canViewReports: true,
    canExportData: true
  };

  return await superAdmin.save();
};

module.exports = mongoose.model('Admin', adminSchema);
