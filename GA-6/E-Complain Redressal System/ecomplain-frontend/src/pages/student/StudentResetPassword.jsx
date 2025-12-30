import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, useParams, Link as RouterLink } from 'react-router-dom'
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
  Link
} from '@mui/material'
import {
  Lock,
  Visibility,
  VisibilityOff,
  ArrowBack,
  LockReset
} from '@mui/icons-material'

export default function StudentResetPassword() {
  const nav = useNavigate()
  const { token: tokenFromParams } = useParams()
  const [searchParams] = useSearchParams()
  const { isDarkMode } = useCustomTheme()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [token, setToken] = useState('')
  const [userType, setUserType] = useState('student')

  useEffect(() => {
    // Get token from URL params or query string
    const tokenParam = tokenFromParams || searchParams.get('token')
    const userTypeParam = searchParams.get('userType') || 'student'
    
    if (tokenParam) {
      setToken(tokenParam)
    } else {
      setError('Invalid or missing reset token')
    }
    setUserType(userTypeParam)
  }, [tokenFromParams, searchParams])

  // Password validation
  const validatePassword = (pwd) => {
    if (pwd.length < 8) {
      return 'Password must be at least 8 characters long'
    }
    if (!/(?=.*[a-z])/.test(pwd)) {
      return 'Password must contain at least one lowercase letter'
    }
    if (!/(?=.*[A-Z])/.test(pwd)) {
      return 'Password must contain at least one uppercase letter'
    }
    if (!/(?=.*[0-9])/.test(pwd)) {
      return 'Password must contain at least one number'
    }
    return null
  }

  // Form validation
  const validateForm = () => {
    const newErrors = {}

    const passwordError = validatePassword(password)
    if (passwordError) {
      newErrors.password = passwordError
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field) => (e) => {
    const value = e.target.value
    if (field === 'password') {
      setPassword(value)
    } else if (field === 'confirmPassword') {
      setConfirmPassword(value)
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!validateForm()) {
      setError('Please fix the errors below')
      return
    }

    if (!token) {
      setError('Invalid reset token. Please use the link from your email.')
      return
    }

    setLoading(true)
    try {
      const { data } = await api.put(`/api/auth/reset-password/${token}`, {
        password: password.trim(),
        userType: userType
      })
      
      setSuccess('Password reset successful! Redirecting to login...')
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        nav('/login')
      }, 2000)
    } catch (err) {
      // Handle validation errors with detailed messages
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const errorMessages = err.response.data.errors.map(e => e.message || `${e.field}: ${e.message}`).join(', ')
        setError(errorMessages || 'Validation failed. Please check your input.')
      } else {
        setError(err.response?.data?.message || 'Failed to reset password. The link may have expired. Please request a new one.')
      }
      console.error('Reset password error:', err.response?.data || err)
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <Box 
        sx={{ 
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          py: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Container maxWidth="sm">
          <Card 
            sx={{ 
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              backgroundColor: isDarkMode 
                ? 'rgba(30, 30, 30, 0.9)' 
                : 'white'
            }}
          >
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Alert severity="error" sx={{ mb: 3 }}>
                Invalid or missing reset token. Please use the link from your email.
              </Alert>
              <Link 
                component={RouterLink} 
                to="/forgot-password" 
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
                Request New Reset Link
              </Link>
            </CardContent>
          </Card>
        </Container>
      </Box>
    )
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Container maxWidth="sm">
        <Card 
          sx={{ 
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            backgroundColor: isDarkMode 
              ? 'rgba(30, 30, 30, 0.9)' 
              : 'white'
          }}
        >
          <CardContent sx={{ p: 4 }}>
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
                Reset Password
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enter your new password below
              </Typography>
            </Box>

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  '& .MuiAlert-message': {
                    fontSize: '0.95rem',
                    whiteSpace: 'pre-line'
                  }
                }} 
                onClose={() => setError('')}
              >
                {error}
              </Alert>
            )}

            {success ? (
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
                  {success}
                </Alert>
              </Box>
            ) : (
              <Box component="form" onSubmit={submit} noValidate>
                <TextField
                  fullWidth
                  label="New Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handleInputChange('password')}
                  error={!!errors.password}
                  helperText={errors.password || "Must be at least 8 characters with uppercase, lowercase, and number"}
                  required
                  sx={{ 
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: isDarkMode ? 'rgba(66, 66, 66, 0.8)' : 'rgba(255, 255, 255, 0.9)'
                    }
                  }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="primary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button
                            onClick={() => setShowPassword(!showPassword)}
                            sx={{ minWidth: 'auto', p: 1 }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </Button>
                        </InputAdornment>
                      ),
                    }
                  }}
                />

                <TextField
                  fullWidth
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  required
                  sx={{ 
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: isDarkMode ? 'rgba(66, 66, 66, 0.8)' : 'rgba(255, 255, 255, 0.9)'
                    }
                  }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="primary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            sx={{ minWidth: 'auto', p: 1 }}
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </Button>
                        </InputAdornment>
                      ),
                    }
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
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </Button>

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
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}

