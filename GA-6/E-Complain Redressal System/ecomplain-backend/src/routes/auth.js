const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/authController');
const {
  validateStudentRegistration,
  validateStudentLogin,
  validateAdminLogin,
  validatePasswordReset,
  validateNewPassword,
  validatePasswordResetOTP,
  validateVerifyPasswordResetOTP,
  validateResetPasswordOTP
} = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

// Public routes
// OTP-based registration flow
router.post('/send-otp', validateStudentRegistration, sendRegistrationOTP);
router.post('/verify-otp', verifyOTPAndRegister);
router.post('/resend-otp', resendRegistrationOTP);
// Keep old register endpoint for backwards compatibility (redirects to OTP flow)
router.post('/register', validateStudentRegistration, sendRegistrationOTP);
router.post('/login', validateStudentLogin, loginStudent);
router.post('/admin/login', validateAdminLogin, loginAdmin);
router.post('/refresh', refreshToken);

// Token-based password reset (legacy - kept for admin)
router.post('/forgot-password', validatePasswordReset, forgotPassword);
router.put('/reset-password/:token', validateNewPassword, resetPassword);

// OTP-based password reset (for students with university emails)
router.post('/forgot-password-otp', validatePasswordResetOTP, sendPasswordResetOTP);
router.post('/verify-password-reset-otp', validateVerifyPasswordResetOTP, verifyPasswordResetOTP);
router.put('/reset-password-otp', validateResetPasswordOTP, resetPasswordWithOTP);

// Super Admin password reset via recovery email
router.post('/super-admin/forgot-password', sendSuperAdminPasswordResetOTP);
router.post('/super-admin/reset-password', resetSuperAdminPassword);

// Protected routes
router.get('/me', authenticateToken, getMe);
router.post('/logout', authenticateToken, logout);

module.exports = router;
