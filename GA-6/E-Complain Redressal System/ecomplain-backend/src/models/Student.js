const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema({
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
      /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9.-]+\.edu|gmail\.com)$/i,
      'Please provide a valid educational email (.edu) or Gmail address'
    ]
  },
  libraryId: {
    type: String,
    required: [true, 'Library ID is required'],
    unique: true,
    trim: true,
    minlength: [5, 'Library ID must contain at least 5 alphanumeric characters'],
    maxlength: [20, 'Library ID cannot exceed 20 characters'],
    match: [/^[a-zA-Z0-9]+$/, 'Library ID must contain only letters and numbers']
  },
  rollNo: {
    type: String,
    required: [true, 'University Roll Number is required'],
    unique: true,
    trim: true,
    minlength: [10, 'University Roll Number must contain at least 10 digits'],
    maxlength: [15, 'University Roll Number cannot exceed 15 characters'],
    match: [/^\d+$/, 'Roll Number must contain only numbers']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: {
      values: ['MCA', 'MBA', 'CSE', 'Electronics', 'Mechanical', 'Civil', 'Electrical'],
      message: 'Please select a valid department'
    }
  },
  year: {
    type: String,
    required: [true, 'Year of study is required'],
    validate: {
      validator: function (value) {
        const department = this.department;
        const twoYearCourses = ['MCA', 'MBA'];
        const fourYearCourses = ['CSE', 'Electronics', 'Mechanical', 'Civil', 'Electrical'];

        if (twoYearCourses.includes(department)) {
          return ['1', '2'].includes(value);
        } else if (fourYearCourses.includes(department)) {
          return ['1', '2', '3', '4'].includes(value);
        }
        return ['1', '2', '3', '4'].includes(value);
      },
      message: function (props) {
        const department = this.department;
        if (['MCA', 'MBA'].includes(department)) {
          return 'MBA and MCA courses are only 2 years. Please select 1st or 2nd year.';
        }
        return 'Please select a valid year of study.';
      }
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't include password in queries by default
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
  profilePicture: {
    type: String,
    default: null
  },
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
studentSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for account lock status
studentSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Index for better query performance
studentSchema.index({ department: 1 });
// Note: email and libraryId already have unique indexes from the unique: true option

// Pre-save middleware to hash password
studentSchema.pre('save', async function (next) {
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

// Instance method to check password
studentSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to generate email verification token
studentSchema.methods.generateEmailVerificationToken = function () {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');

  this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return token;
};

// Instance method to generate password reset token
studentSchema.methods.generatePasswordResetToken = function () {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return token;
};

// Instance method to increment login attempts
studentSchema.methods.incLoginAttempts = function () {
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
studentSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

module.exports = mongoose.model('Student', studentSchema);
