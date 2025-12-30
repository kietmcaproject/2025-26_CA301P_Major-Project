const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Student = require('../models/Student');
const Admin = require('../models/Admin');
const { asyncHandler } = require('../middleware/errorHandler');
const { setCache, getCache, deleteCache } = require('../middleware/cache');
const { sendOTPEmail, sendPasswordResetOTPEmail } = require('../utils/emailService');

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate JWT Token
const generateToken = (userId, userType) => {
  return jwt.sign(
    { userId, userType },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Generate Refresh Token
const generateRefreshToken = (userId, userType) => {
  return jwt.sign(
    { userId, userType, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
  );
};

// @desc    Send OTP for student registration
// @route   POST /api/auth/send-otp
// @access  Public
const sendRegistrationOTP = asyncHandler(async (req, res) => {
  try {
    const { firstName, lastName, email, libraryId, rollNo, department, year, password } = req.body;

    // Basic validation (validation middleware should handle this, but double-check)
    if (!email || !firstName || !lastName || !password) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if student already exists
    const existingStudent = await Student.findOne({
      $or: [{ email }, { libraryId }, { rollNo }]
    });

    if (existingStudent) {
      let message = 'Student already exists with ';
      if (existingStudent.email === email) message += 'this email';
      else if (existingStudent.libraryId === libraryId) message += 'this library ID';
      else if (existingStudent.rollNo === rollNo) message += 'this roll number';

      return res.status(400).json({
        success: false,
        message
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store registration data temporarily with OTP
    const registrationData = {
      firstName,
      lastName,
      email: email.toLowerCase(),
      libraryId,
      rollNo,
      department,
      year,
      password,
      otp,
      otpExpiry,
      attempts: 0 // Track OTP verification attempts
    };

    // Cache key based on email
    const cacheKey = `registration:${email.toLowerCase()}`;
    await setCache(cacheKey, registrationData, 10 * 60 * 1000); // 10 minutes TTL

    // Send OTP email (with timeout and better error handling)
    try {
      // Send email with timeout protection
      const emailPromise = sendOTPEmail({
        email: email.toLowerCase(),
        name: `${firstName} ${lastName}`,
        otp
      });

      // Set timeout for email sending (15 seconds)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Email sending timeout')), 15000);
      });

      await Promise.race([emailPromise, timeoutPromise]);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      // Delete cached data if email fails
      await deleteCache(cacheKey).catch(err => console.error('Failed to delete cache:', err));

      // In development mode or if email not configured, log OTP and continue
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.log('\n=== OTP VERIFICATION (Email not configured) ===');
        console.log(`Email: ${email.toLowerCase()}`);
        console.log(`OTP: ${otp}`);
        console.log('================================================\n');
        // Continue with response - OTP is logged to console
      } else {
        // Email is configured but failed to send
        console.error('Email sending failed:', emailError.message);
        await deleteCache(cacheKey).catch(err => console.error('Failed to delete cache:', err));
        return res.status(500).json({
          success: false,
          message: 'Failed to send verification email. Please try again later.',
          error: process.env.NODE_ENV === 'development' ? emailError.message : undefined
        });
      }
    }

    res.json({
      success: true,
      message: 'OTP sent to your email address. Please check your inbox.',
      email: email.toLowerCase() // Return email for frontend use
    });
  } catch (error) {
    console.error('Error in sendRegistrationOTP:', error);
    throw error;
  }
});

// @desc    Verify OTP and complete student registration
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTPAndRegister = asyncHandler(async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    // Get registration data from cache
    const cacheKey = `registration:${email.toLowerCase()}`;
    const registrationData = await getCache(cacheKey);

    if (!registrationData) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired or invalid. Please register again.'
      });
    }

    // Check if OTP has expired
    if (registrationData.otpExpiry < Date.now()) {
      await deleteCache(cacheKey);
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    // Check OTP attempts (max 5 attempts)
    if (registrationData.attempts >= 5) {
      await deleteCache(cacheKey);
      return res.status(400).json({
        success: false,
        message: 'Too many failed attempts. Please register again.'
      });
    }

    // Verify OTP
    if (registrationData.otp !== otp) {
      registrationData.attempts += 1;
      await setCache(cacheKey, registrationData, 10 * 60 * 1000);
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please try again.',
        attemptsRemaining: 5 - registrationData.attempts
      });
    }

    // OTP is correct - create student account
    const { firstName, lastName, libraryId, rollNo, department, year, password } = registrationData;

    // Double-check if student already exists (race condition protection)
    const existingStudent = await Student.findOne({
      $or: [{ email: email.toLowerCase() }, { libraryId }, { rollNo }]
    });

    if (existingStudent) {
      await deleteCache(cacheKey);
      return res.status(400).json({
        success: false,
        message: 'Student already exists. Please login instead.'
      });
    }

    // Create student
    const student = await Student.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      libraryId,
      rollNo,
      department,
      year,
      password,
      isEmailVerified: true
    });

    // Delete cached registration data
    await deleteCache(cacheKey);

    // Generate tokens
    const token = generateToken(student._id, 'student');
    const refreshToken = generateRefreshToken(student._id, 'student');

    // Update last login
    student.lastLogin = new Date();
    await student.save();

    res.status(201).json({
      success: true,
      message: 'Registration successful! Email verified.',
      token,
      refreshToken,
      student: {
        id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        libraryId: student.libraryId,
        rollNo: student.rollNo,
        department: student.department,
        year: student.year,
        fullName: student.fullName
      }
    });
  } catch (error) {
    console.error('Error in verifyOTPAndRegister:', error);

    // Handle duplicate key errors
    if (error.name === 'MongoServerError' && error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `Student already exists with this ${field === 'email' ? 'email' : field === 'libraryId' ? 'library ID' : 'roll number'}`
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({
        success: false,
        message: messages || 'Validation error'
      });
    }

    throw error;
  }
});

// @desc    Resend OTP for registration
// @route   POST /api/auth/resend-otp
// @access  Public
const resendRegistrationOTP = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Get registration data from cache
    const cacheKey = `registration:${email.toLowerCase()}`;
    const registrationData = await getCache(cacheKey);

    if (!registrationData) {
      return res.status(400).json({
        success: false,
        message: 'Registration session expired. Please register again.'
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Update registration data
    registrationData.otp = otp;
    registrationData.otpExpiry = otpExpiry;
    registrationData.attempts = 0; // Reset attempts
    await setCache(cacheKey, registrationData, 10 * 60 * 1000);

    // Send OTP email
    try {
      await sendOTPEmail({
        email: email.toLowerCase(),
        name: `${registrationData.firstName} ${registrationData.lastName}`,
        otp
      });
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again.'
      });
    }

    res.json({
      success: true,
      message: 'New OTP sent to your email address. Please check your inbox.'
    });
  } catch (error) {
    console.error('Error in resendRegistrationOTP:', error);
    throw error;
  }
});

// @desc    Register a new student (old endpoint - kept for backwards compatibility, but now redirects to OTP flow)
// @route   POST /api/auth/register
// @access  Public
const registerStudent = asyncHandler(async (req, res) => {
  try {
    const { firstName, lastName, email, libraryId, rollNo, department, year, password } = req.body;

    // Check if student already exists
    const existingStudent = await Student.findOne({
      $or: [{ email }, { libraryId }, { rollNo }]
    });

    if (existingStudent) {
      let message = 'Student already exists with ';
      if (existingStudent.email === email) message += 'this email';
      else if (existingStudent.libraryId === libraryId) message += 'this library ID';
      else if (existingStudent.rollNo === rollNo) message += 'this roll number';

      return res.status(400).json({
        success: false,
        message
      });
    }

    // Create student
    const student = await Student.create({
      firstName,
      lastName,
      email,
      libraryId,
      rollNo,
      department,
      year,
      password
    });

    // Generate tokens
    const token = generateToken(student._id, 'student');
    const refreshToken = generateRefreshToken(student._id, 'student');

    // Update last login
    student.lastLogin = new Date();
    await student.save();

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      token,
      refreshToken,
      redirectUrl: '/student-dashboard',
      student: {
        id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        libraryId: student.libraryId,
        rollNo: student.rollNo,
        department: student.department,
        year: student.year,
        fullName: student.fullName
      }
    });
  } catch (error) {
    console.error('\n❌ Registration error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Request body:', JSON.stringify(req.body, null, 2));
    console.error('Environment:', process.env.VERCEL ? 'Vercel' : process.env.NODE_ENV || 'Unknown');

    // Handle MongoDB connection errors
    if (error.name === 'MongoServerError' || error.name === 'MongoNetworkError' || error.name === 'MongoTimeoutError' || error.name === 'MongooseError') {
      console.error('💡 MongoDB connection issue detected');

      // Check if it's a network/connection issue
      if (error.message.includes('timeout') ||
        error.message.includes('ECONNREFUSED') ||
        error.message.includes('ENOTFOUND') ||
        error.message.includes('whitelist') ||
        error.message.includes('connection') ||
        error.message.includes('network')) {
        return res.status(503).json({
          success: false,
          message: 'Database connection error. Please check your MongoDB Atlas network settings and ensure IP whitelist includes 0.0.0.0/0 for Vercel deployments.',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }

      return res.status(503).json({
        success: false,
        message: 'Database connection error. Please try again later.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    // Handle duplicate key errors (email, libraryId, rollNo already exists)
    if (error.name === 'MongoServerError' && error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      console.error(`💡 Duplicate ${field} detected`);
      return res.status(400).json({
        success: false,
        message: `Student already exists with this ${field === 'email' ? 'email' : field === 'libraryId' ? 'library ID' : 'roll number'}`
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message).join(', ');
      console.error('💡 Validation error:', messages);
      return res.status(400).json({
        success: false,
        message: messages || 'Validation error'
      });
    }

    // Handle other errors
    console.error('💡 Unknown error type, re-throwing to asyncHandler');
    // Re-throw to be handled by asyncHandler
    throw error;
  }
});

// @desc    Login student
// @route   POST /api/auth/login
// @access  Public
const loginStudent = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if student exists and include password for comparison
  const student = await Student.findOne({ email }).select('+password');

  if (!student) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Check if account is locked
  if (student.isLocked) {
    return res.status(423).json({
      success: false,
      message: 'Account is temporarily locked due to multiple failed login attempts'
    });
  }

  // Check if account is active
  if (!student.isActive) {
    return res.status(401).json({
      success: false,
      message: 'Account is deactivated'
    });
  }

  // Check password
  const isPasswordValid = await student.comparePassword(password);

  if (!isPasswordValid) {
    // Increment login attempts
    await student.incLoginAttempts();

    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Reset login attempts on successful login
  if (student.loginAttempts > 0) {
    await student.resetLoginAttempts();
  }

  // Update last login
  student.lastLogin = new Date();
  await student.save();

  // Generate tokens
  const token = generateToken(student._id, 'student');
  const refreshToken = generateRefreshToken(student._id, 'student');

  res.json({
    success: true,
    message: 'Login successful',
    token,
    refreshToken,
    redirectUrl: '/student-dashboard',
    student: {
      id: student._id,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      libraryId: student.libraryId,
      rollNo: student.rollNo,
      department: student.department,
      year: student.year,
      fullName: student.fullName
    }
  });
});

// @desc    Login admin
// @route   POST /api/auth/admin/login
// @access  Public
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password, role, department } = req.body;

  console.log('Admin login attempt:', { email, role, department });

  // Check if admin exists and include password for comparison
  const admin = await Admin.findOne({ email }).select('+password');

  if (!admin) {
    console.log('Admin not found for email:', email);
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  console.log('Admin found:', {
    id: admin._id,
    email: admin.email,
    role: admin.role,
    department: admin.department,
    isActive: admin.isActive,
    isLocked: admin.isLocked
  });

  // Check if account is locked
  if (admin.isLocked) {
    return res.status(423).json({
      success: false,
      message: 'Account is temporarily locked due to multiple failed login attempts'
    });
  }

  // Check if account is active
  if (!admin.isActive) {
    return res.status(401).json({
      success: false,
      message: 'Account is deactivated'
    });
  }

  // Check role if specified
  if (role && admin.role !== role) {
    console.log('Role mismatch:', { expected: role, actual: admin.role });
    return res.status(401).json({
      success: false,
      message: 'Invalid role for this account'
    });
  }

  // Check department if specified (for non-super admin roles)
  if (department && admin.role !== 'super_admin' && admin.department !== department) {
    console.log('Department mismatch:', { expected: department, actual: admin.department });
    return res.status(401).json({
      success: false,
      message: 'Invalid department for this account'
    });
  }

  // Check password
  const isPasswordValid = await admin.comparePassword(password);

  if (!isPasswordValid) {
    console.log('Password validation failed for admin:', admin.email);
    // Increment login attempts
    await admin.incLoginAttempts();

    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  console.log('Password validation successful for admin:', admin.email);

  // Reset login attempts on successful login
  if (admin.loginAttempts > 0) {
    await admin.resetLoginAttempts();
  }

  // Update last login
  admin.lastLogin = new Date();
  await admin.save();

  // Generate tokens
  const token = generateToken(admin._id, 'admin');
  const refreshToken = generateRefreshToken(admin._id, 'admin');

  res.json({
    success: true,
    message: 'Login successful',
    token,
    refreshToken,
    admin: {
      _id: admin._id,
      id: admin._id, // Keep both for compatibility
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      role: admin.role,
      displayRole: admin.displayRole,
      department: admin.department,
      permissions: admin.permissions,
      fullName: admin.fullName
    }
  });
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = req.user;
  const userType = req.userType;

  res.json({
    success: true,
    userType,
    user
  });
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token is required'
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Check if user still exists
    let user;
    if (decoded.userType === 'student') {
      user = await Student.findById(decoded.userId);
    } else if (decoded.userType === 'admin') {
      user = await Admin.findById(decoded.userId);
    }

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    // Generate new tokens
    const newToken = generateToken(user._id, decoded.userType);
    const newRefreshToken = generateRefreshToken(user._id, decoded.userType);

    res.json({
      success: true,
      token: newToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  // In a more sophisticated implementation, you might want to blacklist the token
  // For now, we'll just send a success response
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email, userType } = req.body;

  let user;
  if (userType === 'student') {
    user = await Student.findOne({ email });
  } else if (userType === 'admin') {
    user = await Admin.findOne({ email });
  } else {
    return res.status(400).json({
      success: false,
      message: 'User type must be specified (student or admin)'
    });
  }

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found with this email address'
    });
  }

  // Generate reset token
  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    // Create reset URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}?userType=${userType}`;

    // Send password reset email
    const { sendPasswordResetEmail } = require('../utils/emailService');
    await sendPasswordResetEmail({
      email: user.email,
      name: user.firstName || user.name || 'User',
      resetToken,
      resetUrl
    });

    res.json({
      success: true,
      message: 'Password reset link has been sent to your email. Please check your inbox.'
    });
  } catch (error) {
    // If email fails, still clear the reset token for security
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    console.error('Error sending password reset email:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send password reset email. Please try again later.'
    });
  }
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password, userType } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Reset token is required'
    });
  }

  // Decode URL-encoded token if needed (handles URL encoding from email links)
  let decodedToken;
  try {
    decodedToken = decodeURIComponent(token);
  } catch (e) {
    // If decoding fails, use original token
    decodedToken = token;
  }

  // Hash the token to compare with stored hash
  const hashedToken = crypto.createHash('sha256').update(decodedToken).digest('hex');

  let user;
  if (userType === 'student') {
    user = await Student.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });
  } else if (userType === 'admin') {
    user = await Admin.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });
  } else {
    return res.status(400).json({
      success: false,
      message: 'User type must be specified (student or admin)'
    });
  }

  if (!user) {
    // Check if token exists but expired
    const expiredUser = userType === 'student'
      ? await Student.findOne({ passwordResetToken: hashedToken })
      : await Admin.findOne({ passwordResetToken: hashedToken });

    if (expiredUser) {
      const now = Date.now();
      const expires = expiredUser.passwordResetExpires?.getTime() || 0;
      if (expires <= now) {
        return res.status(400).json({
          success: false,
          message: 'Reset token has expired. Please request a new password reset link. Tokens expire after 10 minutes.'
        });
      }
    }

    return res.status(400).json({
      success: false,
      message: 'Invalid reset token. Please use the link from your email or request a new one.'
    });
  }

  // Set new password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Generate new token
  const newToken = generateToken(user._id, userType);

  res.json({
    success: true,
    message: 'Password reset successful',
    token: newToken
  });
});

// @desc    Send OTP for password reset (university email only)
// @route   POST /api/auth/forgot-password-otp
// @access  Public
const sendPasswordResetOTP = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Validate university email (must end with .edu)
    const universityEmailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.edu$/i;
    if (!universityEmailPattern.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Only university email addresses (ending with .edu) are allowed for password reset'
      });
    }

    // Find student by email
    const student = await Student.findOne({ email: normalizedEmail });

    if (!student) {
      // Don't reveal if email exists or not for security
      return res.json({
        success: true,
        message: 'If your email is registered, you will receive an OTP shortly.',
        email: normalizedEmail
      });
    }

    // Check if there's a recent OTP request (rate limiting - 1 minute cooldown)
    const cacheKey = `password-reset:${normalizedEmail}`;
    const existingData = await getCache(cacheKey);

    if (existingData && existingData.createdAt) {
      const timeSinceLastRequest = Date.now() - existingData.createdAt;
      if (timeSinceLastRequest < 60000) { // 1 minute cooldown
        const remainingTime = Math.ceil((60000 - timeSinceLastRequest) / 1000);
        return res.status(429).json({
          success: false,
          message: `Please wait ${remainingTime} seconds before requesting another OTP.`
        });
      }
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP data in cache
    const resetData = {
      email: normalizedEmail,
      studentId: student._id.toString(),
      otp,
      otpExpiry,
      attempts: 0,
      createdAt: Date.now()
    };

    await setCache(cacheKey, resetData, 10 * 60 * 1000); // 10 minutes TTL

    // Send OTP email
    try {
      const emailPromise = sendPasswordResetOTPEmail({
        email: normalizedEmail,
        name: student.firstName || student.fullName || 'User',
        otp
      });

      // Set timeout for email sending (15 seconds)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Email sending timeout')), 15000);
      });

      await Promise.race([emailPromise, timeoutPromise]);
    } catch (emailError) {
      console.error('Failed to send password reset OTP email:', emailError);
      await deleteCache(cacheKey).catch(err => console.error('Failed to delete cache:', err));

      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please try again later.',
        error: process.env.NODE_ENV === 'development' ? emailError.message : undefined
      });
    }

    res.json({
      success: true,
      message: 'OTP sent to your email address. Please check your inbox.',
      email: normalizedEmail
    });
  } catch (error) {
    console.error('Error in sendPasswordResetOTP:', error);
    throw error;
  }
});

// @desc    Verify OTP for password reset
// @route   POST /api/auth/verify-password-reset-otp
// @access  Public
const verifyPasswordResetOTP = asyncHandler(async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cacheKey = `password-reset:${normalizedEmail}`;
    const resetData = await getCache(cacheKey);

    if (!resetData) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired or invalid. Please request a new OTP.'
      });
    }

    // Check if OTP has expired
    if (resetData.otpExpiry < Date.now()) {
      await deleteCache(cacheKey);
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    // Check OTP attempts (max 5 attempts)
    if (resetData.attempts >= 5) {
      await deleteCache(cacheKey);
      return res.status(400).json({
        success: false,
        message: 'Too many failed attempts. Please request a new OTP.'
      });
    }

    // Verify OTP
    if (resetData.otp !== otp) {
      resetData.attempts += 1;
      await setCache(cacheKey, resetData, 10 * 60 * 1000);
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please try again.',
        attemptsRemaining: 5 - resetData.attempts
      });
    }

    // OTP is correct - generate a short-lived reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Store the verified reset token (valid for 5 minutes)
    const verifiedResetData = {
      email: normalizedEmail,
      studentId: resetData.studentId,
      resetToken: hashedToken,
      expires: Date.now() + 5 * 60 * 1000 // 5 minutes
    };

    const verifiedCacheKey = `password-reset-verified:${normalizedEmail}`;
    await setCache(verifiedCacheKey, verifiedResetData, 5 * 60 * 1000);

    // Delete OTP cache
    await deleteCache(cacheKey);

    res.json({
      success: true,
      message: 'OTP verified successfully. You can now reset your password.',
      resetToken: resetToken, // Send plain token, we store hashed version
      email: normalizedEmail
    });
  } catch (error) {
    console.error('Error in verifyPasswordResetOTP:', error);
    throw error;
  }
});

// @desc    Reset password with verified OTP token
// @route   PUT /api/auth/reset-password-otp
// @access  Public
const resetPasswordWithOTP = asyncHandler(async (req, res) => {
  try {
    const { email, resetToken, password } = req.body;

    if (!email || !resetToken || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email, reset token, and new password are required'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const verifiedCacheKey = `password-reset-verified:${normalizedEmail}`;
    const verifiedData = await getCache(verifiedCacheKey);

    if (!verifiedData) {
      return res.status(400).json({
        success: false,
        message: 'Reset session expired. Please start the password reset process again.'
      });
    }

    // Verify the reset token
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    if (verifiedData.resetToken !== hashedToken) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset token. Please start the password reset process again.'
      });
    }

    // Check if token has expired
    if (verifiedData.expires < Date.now()) {
      await deleteCache(verifiedCacheKey);
      return res.status(400).json({
        success: false,
        message: 'Reset session has expired. Please start the password reset process again.'
      });
    }

    // Find and update the student's password
    const student = await Student.findById(verifiedData.studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Update password
    student.password = password;
    await student.save();

    // Clear the verified reset cache
    await deleteCache(verifiedCacheKey);

    // Generate new auth token
    const token = generateToken(student._id, 'student');

    res.json({
      success: true,
      message: 'Password reset successful! You can now login with your new password.',
      token
    });
  } catch (error) {
    console.error('Error in resetPasswordWithOTP:', error);
    throw error;
  }
});

// @desc    Send password reset OTP to super admin's recovery email
// @route   POST /api/auth/super-admin/forgot-password
// @access  Public
const sendSuperAdminPasswordResetOTP = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Find super admin by email
    const superAdmin = await Admin.findOne({
      email: email.toLowerCase(),
      role: 'super_admin'
    });

    if (!superAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Super admin account not found'
      });
    }

    // Check if recovery email is set
    if (!superAdmin.recoveryEmail) {
      return res.status(400).json({
        success: false,
        message: 'No recovery email configured for this account. Please contact system support.'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP in cache
    const cacheKey = `super_admin_reset:${email.toLowerCase()}`;
    await setCache(cacheKey, {
      otp,
      otpExpiry,
      adminId: superAdmin._id.toString(),
      attempts: 0
    }, 10 * 60 * 1000);

    // Send OTP to recovery email
    try {
      await sendPasswordResetOTPEmail({
        email: superAdmin.recoveryEmail,
        name: `${superAdmin.firstName} ${superAdmin.lastName}`,
        otp
      });

      // Mask recovery email for response
      const maskedEmail = superAdmin.recoveryEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3');

      res.json({
        success: true,
        message: `Password reset OTP sent to recovery email: ${maskedEmail}`,
        maskedEmail
      });
    } catch (emailError) {
      console.error('Error sending super admin reset OTP:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please try again.'
      });
    }
  } catch (error) {
    console.error('Error in sendSuperAdminPasswordResetOTP:', error);
    throw error;
  }
});

// @desc    Verify OTP and reset super admin password
// @route   POST /api/auth/super-admin/reset-password
// @access  Public
const resetSuperAdminPassword = asyncHandler(async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, and new password are required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    // Get cached OTP data
    const cacheKey = `super_admin_reset:${email.toLowerCase()}`;
    const cachedData = await getCache(cacheKey);

    if (!cachedData) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired or is invalid. Please request a new one.'
      });
    }

    // Check attempts
    if (cachedData.attempts >= 5) {
      await deleteCache(cacheKey);
      return res.status(400).json({
        success: false,
        message: 'Too many failed attempts. Please request a new OTP.'
      });
    }

    // Verify OTP
    if (cachedData.otp !== otp) {
      cachedData.attempts += 1;
      await setCache(cacheKey, cachedData, 10 * 60 * 1000);
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${5 - cachedData.attempts} attempts remaining.`
      });
    }

    // Check OTP expiry
    if (Date.now() > cachedData.otpExpiry) {
      await deleteCache(cacheKey);
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    // Find and update super admin
    const superAdmin = await Admin.findById(cachedData.adminId);

    if (!superAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    // Update password and unlock account
    superAdmin.password = newPassword;
    superAdmin.loginAttempts = 0;
    superAdmin.lockUntil = undefined;
    await superAdmin.save();

    // Clear cache
    await deleteCache(cacheKey);

    console.log('✅ Super admin password reset via recovery email:', superAdmin.email);

    res.json({
      success: true,
      message: 'Password reset successful! You can now login with your new password.'
    });
  } catch (error) {
    console.error('Error in resetSuperAdminPassword:', error);
    throw error;
  }
});

module.exports = {
  registerStudent,
  sendRegistrationOTP,
  verifyOTPAndRegister,
  resendRegistrationOTP,
  loginStudent,
  loginAdmin,
  getMe,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  sendPasswordResetOTP,
  verifyPasswordResetOTP,
  resetPasswordWithOTP,
  sendSuperAdminPasswordResetOTP,
  resetSuperAdminPassword
};
