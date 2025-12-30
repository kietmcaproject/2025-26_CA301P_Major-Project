import { useState, useRef } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import api from '../../lib/api.js'
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext.jsx'
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  InputAdornment,
  Card,
  CardContent,
  Link,
  IconButton,
  CircularProgress
} from '@mui/material'
import {
  Email,
  ArrowBack,
  LockReset,
  Lock,
  Visibility,
  VisibilityOff,
  MarkEmailRead
} from '@mui/icons-material'

export default function StudentForgotPassword() {
  const nav = useNavigate()
  const { isDarkMode } = useCustomTheme()

  // Multi-step state: 'email' | 'otp' | 'password' | 'success'
  const [step, setStep] = useState('email')

  // Form data
  const [email, setEmail] = useState('')
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  const otpRefs = useRef([...Array(6)].map(() => null))
  const [resetToken, setResetToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // UI state
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  // College email validation (must end with .edu)
  const validateCollegeEmail = (emailValue) => {
    const collegeEmailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.edu$/i
    return collegeEmailPattern.test(emailValue)
  }

  // Password validation
  const validatePassword = (pwd) => {
    if (pwd.length < 8) return 'Password must be at least 8 characters long'
    if (!/(?=.*[a-z])/.test(pwd)) return 'Password must contain at least one lowercase letter'
    if (!/(?=.*[A-Z])/.test(pwd)) return 'Password must contain at least one uppercase letter'
    if (!/(?=.*[0-9])/.test(pwd)) return 'Password must contain at least one number'
    return null
  }

  // Step 1: Send OTP to email
  const handleSendOTP = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setError('')
    setErrors({})

    if (!email.trim()) {
      setErrors({ email: 'University email is required' })
      return
    }

    if (!validateCollegeEmail(email)) {
      setErrors({ email: 'Please use your university email address (must end with .edu)' })
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/api/auth/forgot-password-otp', {
        email: email.trim().toLowerCase()
      })

      console.log('OTP sent successfully:', response.data)
      setStep('otp')
      startResendCooldown()
    } catch (err) {
      console.error('OTP error:', err)
      if (err.response?.status === 429) {
        setError(err.response?.data?.message || 'Please wait before requesting another OTP.')
      } else {
        setError(err.response?.data?.message || 'Failed to send OTP. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setError('')
    setErrors({})

    const otpValue = otpDigits.join('')
    if (otpValue.length !== 6) {
      setErrors({ otp: 'Please enter the 6-digit OTP' })
      return
    }

    setLoading(true)
    try {
      const { data } = await api.post('/api/auth/verify-password-reset-otp', {
        email: email.trim().toLowerCase(),
        otp: otpValue
      })

      setResetToken(data.resetToken)
      setStep('password')
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid OTP. Please try again.'
      const attemptsRemaining = err.response?.data?.attemptsRemaining

      if (attemptsRemaining !== undefined) {
        setError(`${message} (${attemptsRemaining} attempts remaining)`)
      } else {
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  // Handle OTP digit input
  const handleOtpChange = (index, value) => {
    // Only allow single digit
    const digit = value.replace(/\D/g, '').slice(-1)

    const newOtpDigits = [...otpDigits]
    newOtpDigits[index] = digit
    setOtpDigits(newOtpDigits)

    // Auto-focus next input if digit entered
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  // Handle backspace navigation
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      otpRefs.current[index - 1]?.focus()
    }
  }

  // Handle paste for OTP
  const handleOtpPaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pastedData) {
      const newOtpDigits = [...otpDigits]
      for (let i = 0; i < 6; i++) {
        newOtpDigits[i] = pastedData[i] || ''
      }
      setOtpDigits(newOtpDigits)
      // Focus last filled or next empty input
      const focusIndex = Math.min(pastedData.length, 5)
      otpRefs.current[focusIndex]?.focus()
    }
  }

  // Step 3: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setError('')
    setErrors({})

    const newErrors = {}
    const passwordError = validatePassword(password)
    if (passwordError) newErrors.password = passwordError
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      await api.put('/api/auth/reset-password-otp', {
        email: email.trim().toLowerCase(),
        resetToken: resetToken,
        password: password
      })

      setStep('success')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Resend OTP with cooldown
  const handleResendOTP = async () => {
    if (resendCooldown > 0) return

    setLoading(true)
    setError('')
    try {
      await api.post('/api/auth/forgot-password-otp', {
        email: email.trim().toLowerCase()
      })
      startResendCooldown()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.')
    } finally {
      setLoading(false)
    }
  }

  const startResendCooldown = () => {
    setResendCooldown(60)
    const interval = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // Common styles for wrapper
  const wrapperStyles = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    py: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }

  const cardStyles = {
    borderRadius: 4,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    backgroundColor: isDarkMode ? 'rgba(30, 30, 30, 0.9)' : 'white'
  }

  // Render content based on step
  const renderContent = () => {
    // Step 1: Email Input
    if (step === 'email') {
      return (
        <>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              mb: 3
            }}>
              <LockReset sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
              Forgot Password
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter your university email to receive an OTP
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSendOTP}>
            <TextField
              fullWidth
              label="University Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!errors.email}
              helperText={errors.email || "Must be a university email (ending with .edu)"}
              required
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: isDarkMode ? 'rgba(66, 66, 66, 0.8)' : 'rgba(255, 255, 255, 0.9)'
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="primary" />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mb: 2,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #6a3d91 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CircularProgress size={20} color="inherit" />
                  <span>Sending OTP...</span>
                </Box>
              ) : 'Send OTP'}
            </Button>

            {loading && (
              <Alert severity="info" sx={{ mb: 2 }}>
                📧 Sending verification email. This may take a few seconds...
              </Alert>
            )}
          </form>

          <Box sx={{ textAlign: 'center' }}>
            <Link
              component={RouterLink}
              to="/login"
              sx={{
                color: '#1976d2',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              <ArrowBack sx={{ fontSize: 18 }} />
              Back to Login
            </Link>
          </Box>
        </>
      )
    }

    // Step 2: OTP Verification
    if (step === 'otp') {
      return (
        <>
          <Box sx={{ textAlign: 'center', mb: { xs: 3, md: 4 } }}>
            <Box sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: { xs: 64, md: 80 },
              height: { xs: 64, md: 80 },
              borderRadius: '50%',
              bgcolor: isDarkMode ? '#22c55e' : 'success.main',
              mb: { xs: 2, md: 3 },
              boxShadow: isDarkMode
                ? '0 8px 32px rgba(34, 197, 94, 0.4)'
                : '0 8px 32px rgba(76, 175, 80, 0.3)'
            }}>
              <MarkEmailRead sx={{ fontSize: { xs: 32, md: 40 }, color: 'white' }} />
            </Box>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 'bold',
                color: isDarkMode ? '#60a5fa' : '#1976d2',
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' }
              }}
            >
              Enter OTP
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: isDarkMode ? '#9ca3af' : 'text.secondary',
                fontSize: { xs: '0.85rem', md: '0.875rem' }
              }}
            >
              We've sent a 6-digit code to <strong style={{ color: isDarkMode ? '#e5e7eb' : 'inherit' }}>{email}</strong>
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: { xs: 2, md: 3 } }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleVerifyOTP}>
            {/* OTP Input Boxes */}
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: { xs: 0.75, sm: 1.5, md: 2 },
              mb: { xs: 2, md: 3 }
            }}>
              {otpDigits.map((digit, index) => (
                <Box
                  key={index}
                  component="input"
                  ref={(el) => otpRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={index === 0 ? handleOtpPaste : undefined}
                  sx={{
                    width: { xs: '42px', sm: '48px', md: '54px' },
                    height: { xs: '50px', sm: '56px', md: '62px' },
                    fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                    fontWeight: 'bold',
                    textAlign: 'center',
                    border: `2px solid`,
                    borderColor: errors.otp
                      ? 'error.main'
                      : digit
                        ? (isDarkMode ? '#60a5fa' : 'primary.main')
                        : (isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.23)'),
                    borderRadius: { xs: '10px', md: '12px' },
                    bgcolor: isDarkMode ? 'rgba(66, 66, 66, 0.9)' : 'rgba(255, 255, 255, 0.98)',
                    color: isDarkMode ? '#ffffff' : '#111827',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    caretColor: isDarkMode ? '#60a5fa' : 'primary.main',
                    boxShadow: digit
                      ? (isDarkMode ? '0 0 15px rgba(96, 165, 250, 0.4)' : '0 4px 12px rgba(25, 118, 210, 0.25)')
                      : (isDarkMode ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 6px rgba(0,0,0,0.08)'),
                    '&:focus': {
                      borderColor: isDarkMode ? '#60a5fa' : 'primary.main',
                      boxShadow: isDarkMode
                        ? '0 0 20px rgba(96, 165, 250, 0.5)'
                        : '0 0 16px rgba(25, 118, 210, 0.4)',
                      transform: 'scale(1.05)'
                    },
                    '&::placeholder': {
                      color: isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'
                    }
                  }}
                />
              ))}
            </Box>

            {/* Helper text / Error */}
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                textAlign: 'center',
                mb: 2,
                color: errors.otp
                  ? '#f44336'
                  : (isDarkMode ? '#9ca3af' : 'text.secondary')
              }}
            >
              {errors.otp || "Enter the 6-digit code from your email"}
            </Typography>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || otpDigits.join('').length !== 6}
              sx={{
                mb: 2,
                py: { xs: 1.25, md: 1.5 },
                fontSize: { xs: '1rem', md: '1.1rem' },
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #6a3d91 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                },
                '&:disabled': {
                  background: isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify OTP'}
            </Button>
          </form>

          <Box sx={{ textAlign: 'center', mb: { xs: 2, md: 3 } }}>
            <Button
              variant="text"
              onClick={handleResendOTP}
              disabled={resendCooldown > 0 || loading}
              sx={{
                color: isDarkMode ? '#60a5fa' : '#1976d2',
                fontSize: { xs: '0.85rem', md: '0.875rem' }
              }}
            >
              {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
            </Button>
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="text"
              onClick={() => setStep('email')}
              sx={{
                color: isDarkMode ? '#60a5fa' : '#1976d2',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                fontSize: { xs: '0.85rem', md: '0.875rem' }
              }}
            >
              <ArrowBack sx={{ fontSize: { xs: 16, md: 18 } }} />
              Change Email
            </Button>
          </Box>
        </>
      )
    }

    // Step 3: New Password
    if (step === 'password') {
      return (
        <>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              mb: 3
            }}>
              <Lock sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
              Set New Password
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create a strong password for your account
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleResetPassword}>
            <TextField
              fullWidth
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!errors.password}
              helperText={errors.password || "Min 8 chars with uppercase, lowercase, and number"}
              required
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: isDarkMode ? 'rgba(66, 66, 66, 0.8)' : 'rgba(255, 255, 255, 0.9)'
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              required
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: isDarkMode ? 'rgba(66, 66, 66, 0.8)' : 'rgba(255, 255, 255, 0.9)'
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mb: 3,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #6a3d91 100%)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
            </Button>
          </form>
        </>
      )
    }

    // Step 4: Success
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Alert
          severity="success"
          sx={{
            mb: 3,
            fontSize: '1rem',
            '& .MuiAlert-message': {
              fontSize: '1rem'
            }
          }}
        >
          Password reset successful! You can now login with your new password.
        </Alert>

        <Button
          component={RouterLink}
          to="/login"
          variant="contained"
          size="large"
          sx={{
            py: 1.5,
            px: 4,
            fontSize: '1.1rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5568d3 0%, #6a3d91 100%)',
            },
            transition: 'all 0.3s ease'
          }}
        >
          Go to Login
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={wrapperStyles}>
      <Container maxWidth="sm">
        <Card sx={cardStyles}>
          <CardContent sx={{ p: 4 }}>
            {renderContent()}
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}
