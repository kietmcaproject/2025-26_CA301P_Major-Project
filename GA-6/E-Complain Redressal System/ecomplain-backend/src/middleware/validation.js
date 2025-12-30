const { body, param, query, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', JSON.stringify(errors.array(), null, 2));
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Request URL:', req.originalUrl);
    console.log('Request method:', req.method);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Student registration validation
const validateStudentRegistration = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .matches(/^[a-zA-Z]+$/)
    .withMessage('First name must contain only alphabetic characters')
    .isLength({ min: 4, max: 50 })
    .withMessage('First name must be between 4 and 50 characters'),

  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .matches(/^[a-zA-Z]+$/)
    .withMessage('Last name must contain only alphabetic characters')
    .isLength({ min: 4, max: 50 })
    .withMessage('Last name must be between 4 and 50 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address'),

  body('libraryId')
    .trim()
    .notEmpty()
    .withMessage('Library ID is required')
    .isLength({ min: 5, max: 20 })
    .withMessage('Library ID must be between 5 and 20 characters')
    .matches(/^[a-zA-Z0-9]+$/)
    .withMessage('Library ID must contain only letters and numbers'),

  body('rollNo')
    .trim()
    .notEmpty()
    .withMessage('University Roll Number is required')
    .isLength({ min: 10, max: 15 })
    .withMessage('Roll Number must be between 10 and 15 characters')
    .matches(/^\d+$/)
    .withMessage('Roll Number must contain only numbers'),

  body('department')
    .notEmpty()
    .withMessage('Department is required')
    .isIn(['MCA', 'MBA', 'CSE', 'Electronics', 'Mechanical', 'Civil', 'Electrical'])
    .withMessage('Please select a valid department'),

  body('year')
    .notEmpty()
    .withMessage('Year of study is required')
    .custom((value, { req }) => {
      const department = req.body.department;
      const twoYearCourses = ['MCA', 'MBA'];
      const fourYearCourses = ['CSE', 'Electronics', 'Mechanical', 'Civil', 'Electrical'];

      if (twoYearCourses.includes(department)) {
        if (!['1', '2'].includes(value)) {
          throw new Error('MBA and MCA courses are only 2 years. Please select 1st or 2nd year.');
        }
      } else if (fourYearCourses.includes(department)) {
        if (!['1', '2', '3', '4'].includes(value)) {
          throw new Error('Please select a valid year of study (1st, 2nd, 3rd, or 4th year).');
        }
      } else {
        // Default validation for unknown departments
        if (!['1', '2', '3', '4'].includes(value)) {
          throw new Error('Please select a valid year of study.');
        }
      }
      return true;
    }),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),

  handleValidationErrors
];

// Student login validation
const validateStudentLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address'),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  handleValidationErrors
];

// Admin login validation
const validateAdminLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .matches(/^[a-zA-Z0-9._%+-]+@university\.edu$/i)
    .withMessage('Please provide a valid university email address (@university.edu)'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),

  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['coordinator', 'additional_hod', 'dean', 'super_admin', 'accounts', 'librarian', 'maintenance'])
    .withMessage('Please select a valid role'),

  body('department')
    .custom((value, { req }) => {
      const role = req.body.role;

      // Super admin doesn't need a department
      if (role === 'super_admin') {
        return true;
      }

      // Department is required for all other roles
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        throw new Error('Department is required for this role');
      }

      // Normalize the value (trim and handle null/undefined)
      const normalizedValue = typeof value === 'string' ? value.trim() : String(value || '').trim();

      const externalRoles = ['accounts', 'librarian', 'maintenance'];
      const externalDepartments = ['Accounts', 'Librarian', 'Maintenance'];
      const academicDepartments = ['MCA', 'MBA', 'CSE', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'General'];
      const allValidDepartments = [...academicDepartments, ...externalDepartments];

      // Check if department is in the valid list (case-sensitive)
      if (!allValidDepartments.includes(normalizedValue)) {
        throw new Error('Please select a valid department');
      }

      // External departments must match their role
      if (externalRoles.includes(role)) {
        if (role === 'accounts' && normalizedValue !== 'Accounts') {
          throw new Error('Accounts role must have Accounts department');
        }
        if (role === 'librarian' && normalizedValue !== 'Librarian') {
          throw new Error('Librarian role must have Librarian department');
        }
        if (role === 'maintenance' && normalizedValue !== 'Maintenance') {
          throw new Error('Maintenance role must have Maintenance department');
        }
      } else {
        // Academic roles must have academic departments
        if (!academicDepartments.includes(normalizedValue)) {
          throw new Error('Academic roles must have academic departments');
        }
      }

      return true;
    }),

  handleValidationErrors
];

// Complaint creation validation
const validateComplaintCreation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Complaint title is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Complaint description is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),

  body('category')
    .notEmpty()
    .withMessage('Complaint category is required')
    .isIn([
      'Academic', 'Infrastructure', 'Library', 'Hostel', 'Cafeteria',
      'Transport', 'Faculty', 'Administration', 'Examination', 'Fee', 'Other'
    ])
    .withMessage('Please select a valid complaint category'),

  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Urgent'])
    .withMessage('Priority must be Low, Medium, High, or Urgent'),

  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean value'),

  body('anonymous')
    .optional()
    .isBoolean()
    .withMessage('anonymous must be a boolean value'),

  handleValidationErrors
];

// Complaint update validation
const validateComplaintUpdate = [
  body('status')
    .optional()
    .isIn(['Pending', 'In Progress', 'Resolved', 'Rejected', 'Closed'])
    .withMessage('Status must be Pending, In Progress, Resolved, Rejected, or Closed'),

  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Complaint title cannot be empty')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),

  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Complaint description cannot be empty')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),

  body('category')
    .optional()
    .isIn([
      'Academic', 'Infrastructure', 'Library', 'Hostel', 'Cafeteria',
      'Transport', 'Faculty', 'Administration', 'Examination', 'Fee', 'Other'
    ])
    .withMessage('Please select a valid complaint category'),

  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Urgent'])
    .withMessage('Priority must be Low, Medium, High, or Urgent'),

  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Assigned admin ID must be a valid MongoDB ObjectId'),

  handleValidationErrors
];

// Comment validation
const validateComment = [
  body('comment')
    .trim()
    .notEmpty()
    .withMessage('Comment is required')
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment must be between 1 and 500 characters'),

  body('isInternal')
    .optional()
    .isBoolean()
    .withMessage('isInternal must be a boolean value'),

  handleValidationErrors
];

// Password reset validation
const validatePasswordReset = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address'),

  handleValidationErrors
];

// New password validation
const validateNewPassword = [
  // Token is in URL params, not body
  // body('token') - removed, token comes from URL params

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),

  body('userType')
    .notEmpty()
    .withMessage('User type is required')
    .isIn(['student', 'admin'])
    .withMessage('User type must be either student or admin'),

  // confirmPassword validation removed - handled on frontend
  // body('confirmPassword') - removed, frontend handles this

  handleValidationErrors
];

// MongoDB ObjectId validation
const validateObjectId = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName} ID format`),

  handleValidationErrors
];

// Query parameter validation
const validateQueryParams = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('Limit must be between 1 and 10000'),

  query('sort')
    .optional()
    .isIn(['createdAt', '-createdAt', 'updatedAt', '-updatedAt', 'priority', '-priority', 'status', '-status'])
    .withMessage('Invalid sort parameter'),

  query('status')
    .optional()
    .isIn(['Pending', 'In Progress', 'Resolved', 'Rejected', 'Closed'])
    .withMessage('Invalid status parameter'),

  query('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Urgent'])
    .withMessage('Invalid priority parameter'),

  query('category')
    .optional()
    .isIn([
      'Academic', 'Infrastructure', 'Library', 'Hostel', 'Cafeteria',
      'Transport', 'Faculty', 'Administration', 'Examination', 'Fee', 'Other'
    ])
    .withMessage('Invalid category parameter'),

  handleValidationErrors
];

// Validation for OTP-based password reset (university email only)
const validatePasswordResetOTP = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.edu$/i)
    .withMessage('Only university email addresses (ending with .edu) are allowed for password reset'),

  handleValidationErrors
];

// Validation for verifying password reset OTP
const validateVerifyPasswordResetOTP = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address'),

  body('otp')
    .trim()
    .notEmpty()
    .withMessage('OTP is required')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits')
    .matches(/^\d{6}$/)
    .withMessage('OTP must contain only numbers'),

  handleValidationErrors
];

// Validation for resetting password with OTP token
const validateResetPasswordOTP = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address'),

  body('resetToken')
    .trim()
    .notEmpty()
    .withMessage('Reset token is required'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),

  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateStudentRegistration,
  validateStudentLogin,
  validateAdminLogin,
  validateComplaintCreation,
  validateComplaintUpdate,
  validateComment,
  validatePasswordReset,
  validateNewPassword,
  validateObjectId,
  validateQueryParams,
  validatePasswordResetOTP,
  validateVerifyPasswordResetOTP,
  validateResetPasswordOTP
};
