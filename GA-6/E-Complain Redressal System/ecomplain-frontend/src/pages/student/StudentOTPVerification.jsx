import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom'
import api from '../../lib/api.js'
import { useAuth } from '../../auth/AuthContext.jsx'
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext.jsx'
import { useToast } from '../../contexts/ToastContext.jsx'
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material'
import {
  Email,
  Verified,
  Refresh,
  ArrowBack
} from '@mui/icons-material'

export default function StudentOTPVerification() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setToken, setUser } = useAuth()
  const { isDarkMode } = useCustomTheme()
  const { showSuccess, showError } = useToast()

  const email = searchParams.get('email') || ''
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [timer, setTimer] = useState(0)
  const inputRefs = useRef([])

  // Countdown timer for resend OTP
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [timer])

  // Start 60 second timer when component mounts
  useEffect(() => {
    setTimer(60)
  }, [])

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      showError('Email not found. Please register again.')
      setTimeout(() => {
        navigate('/register')
      }, 2000)
    }
  }, [email, navigate, showError])

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) {
      return
    }

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setError('')

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      navigator.clipboard.readText().then(text => {
        const pasteText = text.replace(/\D/g, '').slice(0, 6)
        const newOtp = [...otp]
        pasteText.split('').forEach((char, i) => {
          if (index + i < 6) {
            newOtp[index + i] = char
          }
        })
        setOtp(newOtp)
        if (pasteText.length === 6) {
          inputRefs.current[5]?.focus()
        }
      })
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasteText = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newOtp = [...otp]
    pasteText.split('').forEach((char, i) => {
      if (i < 6) {
        newOtp[i] = char
      }
    })
    setOtp(newOtp)
    if (pasteText.length === 6) {
      inputRefs.current[5]?.focus()
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setError('')

    const otpString = otp.join('')
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP')
      showError('Please enter the complete 6-digit OTP')
      return
    }

    setLoading(true)
    try {
      const { data } = await api.post('/api/auth/verify-otp', {
        email,
        otp: otpString
      })

      // Clear API cache before setting auth
      const { clearApiCache } = await import('../../lib/api.js')
      clearApiCache()

      setToken(data.token)
      setUser(data.student)
      showSuccess('Email verified successfully! Registration complete.')
      
      // Navigate to dashboard
      navigate('/dashboard')
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Invalid OTP. Please try again.'
      setError(errorMessage)
      showError(errorMessage)
      
      // Clear OTP on error
      setOtp(['', '', '', '', '', ''])
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus()
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (timer > 0) {
      return
    }

    setResending(true)
    setError('')
    try {
      await api.post('/api/auth/resend-otp', { email })
      showSuccess('New OTP sent to your email. Please check your inbox.')
      setTimer(60) // Reset timer
      setOtp(['', '', '', '', '', ''])
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus()
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to resend OTP. Please try again.'
      setError(errorMessage)
      showError(errorMessage)
    } finally {
      setResending(false)
    }
  }

  if (!email) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: isDarkMode 
          ? 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              color: 'white',
              fontWeight: 'bold',
              textAlign: 'center'
            }}
          >
            Email Verification
          </Typography>
        </Box>

        <Card 
          elevation={10}
          sx={{ 
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: isDarkMode 
              ? '0 20px 40px rgba(0,0,0,0.3)'
              : '0 20px 40px rgba(0,0,0,0.1)',
            backgroundColor: isDarkMode ? '#424242' : '#ffffff'
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                mb: 2 
              }}>
                <Verified sx={{ fontSize: 48, color: '#1976d2' }} />
              </Box>
              <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                Verify Your Email
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                We've sent a 6-digit verification code to
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <Email sx={{ fontSize: 18, color: '#1976d2' }} />
                <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                  {email}
                </Typography>
              </Box>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleVerify} noValidate>
              {/* OTP Input Fields */}
              <Box sx={{ mb: 4 }}>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    mb: 3, 
                    textAlign: 'center',
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}
                >
                  Enter the 6-digit code
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: { xs: 1.5, sm: 2, md: 2.5 },
                    flexWrap: 'nowrap',
                    px: { xs: 1, sm: 0 }
                  }}
                >
                  {otp.map((digit, index) => (
                    <TextField
                      key={index}
                      inputRef={(el) => (inputRefs.current[index] = el)}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      inputProps={{
                        maxLength: 1,
                        style: {
                          textAlign: 'center',
                          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                        }
                      }}
                      sx={{
                        width: { xs: '48px', sm: '56px', md: '64px' },
                        height: { xs: '48px', sm: '56px', md: '64px' },
                        '& .MuiOutlinedInput-root': {
                          width: '100%',
                          height: '100%',
                          backgroundColor: isDarkMode 
                            ? (digit ? 'rgba(25, 118, 210, 0.15)' : 'rgba(66, 66, 66, 0.8)')
                            : (digit ? 'rgba(25, 118, 210, 0.08)' : 'rgba(255, 255, 255, 0.9)'),
                          borderRadius: '8px',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '& input': {
                            padding: 0,
                            textAlign: 'center',
                            fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                            fontWeight: 'bold',
                            color: isDarkMode 
                              ? (digit ? '#42a5f5' : '#ffffff')
                              : (digit ? '#1976d2' : '#212121'),
                            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                            height: '100%',
                            width: '100%',
                          },
                          '& fieldset': {
                            borderWidth: digit ? 2.5 : 2,
                            borderColor: digit 
                              ? (isDarkMode ? '#42a5f5' : '#1976d2')
                              : (isDarkMode ? '#555' : '#ccc'),
                            transition: 'all 0.3s ease',
                          },
                          '&:hover fieldset': {
                            borderColor: isDarkMode ? '#42a5f5' : '#1976d2',
                            borderWidth: 2.5,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: isDarkMode ? '#42a5f5' : '#1976d2',
                            borderWidth: 3,
                            boxShadow: isDarkMode
                              ? '0 0 0 3px rgba(66, 165, 245, 0.2)'
                              : '0 0 0 3px rgba(25, 118, 210, 0.2)',
                          },
                          '&.Mui-focused': {
                            transform: 'scale(1.05)',
                            backgroundColor: isDarkMode 
                              ? 'rgba(25, 118, 210, 0.25)'
                              : 'rgba(25, 118, 210, 0.12)',
                          }
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Verify Button */}
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading || otp.join('').length !== 6}
                sx={{
                  py: 2,
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                  borderRadius: 3,
                  mb: 3,
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 30px rgba(25, 118, 210, 0.4)'
                  },
                  '&:disabled': {
                    background: '#ccc',
                    transform: 'none'
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Verified />}
              >
                {loading ? 'Verifying...' : 'Verify & Register'}
              </Button>

              {/* Resend OTP */}
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Didn't receive the code?
                </Typography>
                <Button
                  variant="text"
                  onClick={handleResendOTP}
                  disabled={resending || timer > 0}
                  startIcon={resending ? <CircularProgress size={16} /> : <Refresh />}
                  sx={{
                    color: '#1976d2',
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.08)'
                    }
                  }}
                >
                  {timer > 0 
                    ? `Resend OTP (${timer}s)` 
                    : resending 
                      ? 'Sending...' 
                      : 'Resend OTP'}
                </Button>
              </Box>

              {/* Back to Register */}
              <Box sx={{ textAlign: 'center' }}>
                <Link 
                  component={RouterLink} 
                  to="/register" 
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
                  Back to Registration
                </Link>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}

