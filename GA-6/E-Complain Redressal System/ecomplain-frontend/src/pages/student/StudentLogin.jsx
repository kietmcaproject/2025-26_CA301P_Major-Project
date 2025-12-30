import { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import api, { clearApiCache } from '../../lib/api.js'
import { useAuth } from '../../auth/AuthContext.jsx'
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext.jsx'
import { useToast } from '../../contexts/ToastContext.jsx'
import { slideUp, staggerContainer, staggerItem } from '../../utils/AnimationConfig.jsx'
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  InputAdornment,
  IconButton,
  Link,
  Card,
  CardContent,
  Divider
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Login as LoginIcon,
  School
} from '@mui/icons-material'

// Create motion components
const MotionBox = motion.create(Box)
const MotionCard = motion.create(Card)


export default function StudentLogin() {
  const nav = useNavigate()
  const { setToken, setUser } = useAuth()
  const { isDarkMode } = useCustomTheme()
  const { showSuccess, showError } = useToast()
  const [form, setForm] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // College email validation
  const validateCollegeEmail = (email) => {
    const collegeEmailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.edu$/i
    return collegeEmailPattern.test(email)
  }

  // Form validation
  const validateForm = () => {
    const newErrors = {}

    // Required fields validation
    if (!form.email.trim()) {
      newErrors.email = 'College email is required'
    }

    if (!form.password) {
      newErrors.password = 'Password is required'
    }

    // College email validation
    if (form.email && !validateCollegeEmail(form.email)) {
      newErrors.email = 'Please use your educational email address (must end with .edu)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value })
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }
  }

  async function submit(e) {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      const errorMsg = 'Please fix the errors below'
      setError(errorMsg)
      showError(errorMsg)
      return
    }

    setLoading(true)
    try {
      const { data } = await api.post('/api/auth/login', {
        email: form.email,
        password: form.password
      })

      // Clear all cached data before setting new auth credentials
      clearApiCache()

      setToken(data.token)
      setUser(data.student)
      showSuccess('Login successful! Redirecting...')

      // Navigate immediately after clearing cache and setting credentials
      // The dashboard will load fresh data without cache interference
      nav('/dashboard')
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Invalid credentials. Please try again.'
      setError(errorMsg)
      showError(errorMsg)
    } finally {
      setLoading(false)
    }
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
        <MotionBox
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{
              color: 'white',
              fontWeight: 'bold',
              textAlign: 'center'
            }}
          >
            Student Login
          </Typography>
        </MotionBox>

        <MotionCard
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
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
                <School sx={{ fontSize: 48, color: '#1976d2' }} />
              </Box>
              <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                Welcome Back
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in to your E-Complaint System account
              </Typography>
            </Box>

            {error && (
              <Alert color="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box as="form" onSubmit={submit} noValidate>
              {/* Login Form Fields */}
              <Box sx={{ mb: 4 }}>
                <TextField
                  fullWidth
                  label="College Email Address"
                  type="email"
                  value={form.email}
                  onChange={handleInputChange('email')}
                  error={!!errors.email}
                  helperText={errors.email || "Enter your college email address"}
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
                          <Email color="primary" />
                        </InputAdornment>
                      ),
                    }
                  }}
                />

                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleInputChange('password')}
                  error={!!errors.password}
                  helperText={errors.password || "Enter your account password"}
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
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }
                  }}
                />

                {/* Forgot Password Link */}
                <Box sx={{ textAlign: 'left', mb: 3 }}>
                  <Link
                    component={RouterLink}
                    to="/forgot-password"
                    sx={{
                      color: '#1976d2',
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    Forgot Password?
                  </Link>
                </Box>
              </Box>

              {/* Submit Button */}
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                  sx={{
                    py: 2,
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                    borderRadius: 3,
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
                  startIcon={<LoginIcon />}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </Box>

              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  OR
                </Typography>
              </Divider>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Don't have an account?
                </Typography>
                <Button
                  as={RouterLink}
                  to="/register"
                  variant="outlined"
                  size="large"
                  fullWidth
                  sx={{
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    borderColor: '#1976d2',
                    color: '#1976d2',
                    '&:hover': {
                      borderColor: '#1565c0',
                      backgroundColor: 'rgba(25, 118, 210, 0.04)',
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Create New Account
                </Button>
              </Box>
            </Box>
          </CardContent>
        </MotionCard>

        {/* Additional Info */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" sx={{
            color: isDarkMode ? '#e0e0e0' : 'white',
            opacity: 0.8
          }}>
            Need help? Contact support at{' '}
            <Link
              href="mailto:support@university.edu"
              sx={{
                color: isDarkMode ? '#e0e0e0' : 'white',
                textDecoration: 'underline',
                '&:hover': { opacity: 0.7 }
              }}
            >
              support@university.edu
            </Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}