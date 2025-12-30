import { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import api, { clearApiCache } from '../../lib/api.js'
import { useAuth } from '../../auth/AuthContext.jsx'
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext.jsx'
import AdminLoginNavbar from '../../components/AdminLoginNavbar.jsx'
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
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Login as LoginIcon,
  AdminPanelSettings,
  SupervisorAccount,
  LockReset
} from '@mui/icons-material'

export default function AdminLogin() {
  const nav = useNavigate()
  const { setToken, setUser } = useAuth()
  const { isDarkMode } = useCustomTheme()
  const [form, setForm] = useState({
    email: '',
    password: '',
    role: 'additional_hod', // Default to additional_hod
    department: '' // Department selection
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Forgot password state
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false)
  const [forgotStep, setForgotStep] = useState(1) // 1: email, 2: OTP, 3: new password
  const [forgotEmail, setForgotEmail] = useState('superadmin@university.edu')
  const [forgotOtp, setForgotOtp] = useState('')
  const [forgotNewPassword, setForgotNewPassword] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotError, setForgotError] = useState('')
  const [forgotSuccess, setForgotSuccess] = useState('')
  const [maskedEmail, setMaskedEmail] = useState('')

  // Form validation
  const validateForm = () => {
    const newErrors = {}

    // Email validation
    if (!form.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[a-zA-Z0-9._%+-]+@university\.edu$/i.test(form.email)) {
      newErrors.email = 'Please use your university email address (@university.edu)'
    }

    // Password validation
    if (!form.password) {
      newErrors.password = 'Password is required'
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    // Role validation
    if (!form.role) {
      newErrors.role = 'Please select your role'
    }

    // Department validation (required for all roles except super_admin and external departments)
    const externalRoles = ['accounts', 'librarian', 'maintenance'];
    if (form.role && form.role !== 'super_admin' && !externalRoles.includes(form.role) && !form.department) {
      newErrors.department = 'Please select your department'
    }

    // Auto-set department for external roles (capitalized)
    if (form.role === 'accounts') {
      form.department = 'Accounts';
    } else if (form.role === 'librarian') {
      form.department = 'Librarian';
    } else if (form.role === 'maintenance') {
      form.department = 'Maintenance';
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field) => (e) => {
    const value = e.target.value

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }

    // If role changes to super_admin or external department, handle department
    if (field === 'role') {
      let departmentValue = form.department
      if (value === 'super_admin') {
        departmentValue = ''
      } else if (value === 'accounts') {
        departmentValue = 'Accounts'
      } else if (value === 'librarian') {
        departmentValue = 'Librarian'
      } else if (value === 'maintenance') {
        departmentValue = 'Maintenance'
      }
      setForm({ ...form, [field]: value, department: departmentValue })
      if (errors.department) {
        setErrors({ ...errors, department: '' })
      }
    } else {
      setForm({ ...form, [field]: value })
    }
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Debug: Log form data before validation
    console.log('Form data before validation:', form)

    if (!validateForm()) {
      console.log('Validation failed. Errors:', errors)
      setError('Please fix the errors below')
      return
    }

    console.log('Validation passed. Proceeding with login...')

    // Ensure role is set
    if (!form.role || form.role.trim() === '') {
      setError('Please select a role')
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      // For external departments, send the actual role and capitalized department
      const isExternalRole = ['accounts', 'librarian', 'maintenance'].includes(form.role)
      const departmentValue = isExternalRole
        ? form.role.charAt(0).toUpperCase() + form.role.slice(1) // Capitalize: 'Accounts', 'Librarian', 'Maintenance'
        : (form.department || '')

      // Ensure department is set for non-super-admin roles
      if (form.role !== 'super_admin' && (!departmentValue || departmentValue.trim() === '')) {
        setError('Please select a department')
        setLoading(false)
        return
      }

      const loginData = {
        email: form.email.trim(),
        password: form.password,
        role: form.role.trim()
      }

      // Only add department if not super_admin
      if (form.role !== 'super_admin') {
        loginData.department = departmentValue.trim()
      }

      console.log('Login data being sent:', loginData)
      console.log('Form state:', form)

      const { data } = await api.post('/api/auth/admin/login', loginData)

      // Clear all cached data before setting new auth credentials
      clearApiCache()

      setToken(data.token)
      setUser(data.admin)
      setSuccess('Login successful! Redirecting...')

      // Navigate immediately after clearing cache and setting credentials
      // The dashboard will load fresh data without cache interference
      nav('/admin/dashboard')
    } catch (err) {
      console.error('Login error:', err)
      console.error('Error response:', err.response?.data)

      if (err.response?.data?.errors) {
        // Handle validation errors
        const validationErrors = err.response.data.errors
        const errorMessages = validationErrors.map(error => `${error.field}: ${error.message}`).join(', ')
        setError(`Validation failed: ${errorMessages}`)
      } else if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else if (err.code === 'NETWORK_ERROR' || !err.response) {
        setError('Network error. Please check your connection and try again.')
      } else {
        setError('Login failed. Please check your credentials and try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Forgot password handlers for super admin
  const handleOpenForgotPassword = () => {
    setForgotPasswordOpen(true)
    setForgotStep(1)
    setForgotEmail('superadmin@university.edu')
    setForgotOtp('')
    setForgotNewPassword('')
    setForgotError('')
    setForgotSuccess('')
    setMaskedEmail('')
  }

  const handleCloseForgotPassword = () => {
    setForgotPasswordOpen(false)
    setForgotStep(1)
    setForgotError('')
    setForgotSuccess('')
  }

  const handleSendOtp = async () => {
    setForgotLoading(true)
    setForgotError('')
    try {
      const { data } = await api.post('/api/auth/super-admin/forgot-password', {
        email: forgotEmail
      })
      setMaskedEmail(data.maskedEmail || 'your recovery email')
      setForgotStep(2)
      setForgotSuccess(`OTP sent to ${data.maskedEmail || 'recovery email'}`)
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Failed to send OTP')
    } finally {
      setForgotLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (forgotNewPassword.length < 8) {
      setForgotError('Password must be at least 8 characters')
      return
    }
    setForgotLoading(true)
    setForgotError('')
    try {
      await api.post('/api/auth/super-admin/reset-password', {
        email: forgotEmail,
        otp: forgotOtp,
        newPassword: forgotNewPassword
      })
      setForgotSuccess('Password reset successful! You can now login.')
      setForgotStep(3)
      setTimeout(() => {
        handleCloseForgotPassword()
      }, 2000)
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Failed to reset password')
    } finally {
      setForgotLoading(false)
    }
  }

  return (
    <>
      <AdminLoginNavbar />
      <Box
        sx={{
          minHeight: '100vh',
          background: isDarkMode
            ? 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)'
            : 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
          py: 4,
          pt: 12 // Add top padding to account for fixed navbar
        }}
      >
        <Container maxWidth="sm">
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: { xs: 2, sm: 3, md: 4 } }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                color: isDarkMode ? '#ffffff' : 'white',
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' }
              }}
            >
              Admin Portal
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
              backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
              border: isDarkMode ? '1px solid #333' : 'none'
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
              <Box sx={{ textAlign: 'center', mb: { xs: 2, sm: 3, md: 4 } }}>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mb: { xs: 1, sm: 2 }
                }}>
                  <AdminPanelSettings sx={{
                    fontSize: { xs: 40, sm: 44, md: 48 },
                    color: isDarkMode ? '#1976d2' : '#2c3e50'
                  }} />
                </Box>
                <Typography variant="h5" component="h2" gutterBottom sx={{
                  fontWeight: 'bold',
                  color: isDarkMode ? '#ffffff' : '#2c3e50',
                  fontSize: { xs: '1.15rem', sm: '1.35rem', md: '1.5rem' }
                }}>
                  Administrative Access
                </Typography>
                <Typography variant="body2" sx={{
                  color: isDarkMode ? '#94a3b8' : 'text.secondary',
                  fontSize: { xs: '0.8rem', sm: '0.875rem' }
                }}>
                  Sign in to manage complaints and oversee operations
                </Typography>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  {success}
                </Alert>
              )}

              <Box component="form" onSubmit={submit} noValidate>
                <FormControl fullWidth sx={{ mb: { xs: 2, sm: 2.5, md: 3 } }}>
                  <InputLabel sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Select Your Role</InputLabel>
                  <Select
                    value={form.role}
                    label="Select Your Role"
                    onChange={handleInputChange('role')}
                    error={!!errors.role}
                  >
                    <MenuItem value="coordinator">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SupervisorAccount color="primary" />
                        <Box>
                          <Typography variant="body1">Coordinator</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Intake level - Verify, resolve or forward complaints
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                    <MenuItem value="additional_hod">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SupervisorAccount color="primary" />
                        <Box>
                          <Typography variant="body1">Additional HOD</Typography>
                          <Typography variant="caption" color="text.secondary">
                            First level - Review and resolve complaints
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                    <MenuItem value="dean">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AdminPanelSettings color="primary" />
                        <Box>
                          <Typography variant="body1">Dean</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Final authority - Escalated complaints and reports
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                    <MenuItem value="super_admin">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AdminPanelSettings color="error" />
                        <Box>
                          <Typography variant="body1">Super Administrator</Typography>
                          <Typography variant="caption" color="text.secondary">
                            System-wide access and management
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                    <MenuItem value="accounts">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AdminPanelSettings color="info" />
                        <Box>
                          <Typography variant="body1">Accounts Department</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Handle fee-related complaints
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                    <MenuItem value="librarian">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AdminPanelSettings color="info" />
                        <Box>
                          <Typography variant="body1">Librarian</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Handle library-related complaints
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                    <MenuItem value="maintenance">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AdminPanelSettings color="info" />
                        <Box>
                          <Typography variant="body1">Maintenance Department</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Handle infrastructure complaints
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  </Select>
                  {errors.role && (
                    <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                      {errors.role}
                    </Typography>
                  )}
                </FormControl>

                {/* Department Selection - Only show for non-super admin and non-external department roles */}
                {form.role !== 'super_admin' && form.role !== 'accounts' && form.role !== 'librarian' && form.role !== 'maintenance' && (
                  <FormControl fullWidth sx={{ mb: { xs: 2, sm: 2.5, md: 3 } }}>
                    <InputLabel sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Select Department</InputLabel>
                    <Select
                      value={form.department}
                      label="Select Department"
                      onChange={handleInputChange('department')}
                      error={!!errors.department}
                    >
                      <MenuItem value="MCA">MCA</MenuItem>
                      <MenuItem value="MBA">MBA</MenuItem>
                      <MenuItem value="CSE">CSE</MenuItem>
                      <MenuItem value="Electronics">Electronics</MenuItem>
                      <MenuItem value="Mechanical">Mechanical</MenuItem>
                      <MenuItem value="Civil">Civil</MenuItem>
                      <MenuItem value="Electrical">Electrical</MenuItem>
                      <MenuItem value="General">General</MenuItem>
                    </Select>
                    {errors.department && (
                      <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                        {errors.department}
                      </Typography>
                    )}
                  </FormControl>
                )}
                {/* Auto-set department for external departments */}
                {form.role === 'accounts' && (
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Department</InputLabel>
                    <Select
                      value="Accounts"
                      label="Department"
                      disabled
                    >
                      <MenuItem value="Accounts">Accounts</MenuItem>
                    </Select>
                  </FormControl>
                )}
                {form.role === 'librarian' && (
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Department</InputLabel>
                    <Select
                      value="Librarian"
                      label="Department"
                      disabled
                    >
                      <MenuItem value="Librarian">Librarian</MenuItem>
                    </Select>
                  </FormControl>
                )}
                {form.role === 'maintenance' && (
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Department</InputLabel>
                    <Select
                      value="Maintenance"
                      label="Department"
                      disabled
                    >
                      <MenuItem value="Maintenance">Maintenance</MenuItem>
                    </Select>
                  </FormControl>
                )}

                <TextField
                  fullWidth
                  label="Admin Email"
                  type="email"
                  value={form.email}
                  onChange={handleInputChange('email')}
                  error={!!errors.email}
                  helperText={errors.email || "Enter your administrative email address"}
                  required
                  sx={{ mb: { xs: 2, sm: 2.5, md: 3 } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleInputChange('password')}
                  error={!!errors.password}
                  helperText={errors.password}
                  required
                  sx={{ mb: { xs: 2, sm: 2.5, md: 3 } }}
                  InputProps={{
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
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                  sx={{
                    py: { xs: 1.25, sm: 1.5 },
                    fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' },
                    fontWeight: 'bold',
                    background: isDarkMode
                      ? 'linear-gradient(45deg, #1976d2 30%, #1565c0 90%)'
                      : 'linear-gradient(45deg, #2c3e50 30%, #34495e 90%)',
                    '&:hover': {
                      background: isDarkMode
                        ? 'linear-gradient(45deg, #1565c0 30%, #0d47a1 90%)'
                        : 'linear-gradient(45deg, #1a252f 30%, #2c3e50 90%)',
                      transform: 'translateY(-2px)',
                      boxShadow: isDarkMode
                        ? '0 8px 25px rgba(25, 118, 210, 0.3)'
                        : '0 8px 25px rgba(44, 62, 80, 0.3)'
                    },
                    '&.Mui-disabled': {
                      background: isDarkMode
                        ? 'linear-gradient(45deg, #1976d2 30%, #1565c0 90%)'
                        : 'linear-gradient(45deg, #2c3e50 30%, #34495e 90%)',
                      color: 'rgba(255, 255, 255, 0.8)',
                      opacity: 0.85
                    },
                    transition: 'all 0.3s ease',
                    mb: { xs: 2, sm: 2.5, md: 3 }
                  }}
                  startIcon={loading ? null : <LoginIcon />}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>


                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{
                    color: isDarkMode ? '#94a3b8' : 'text.secondary',
                    mb: { xs: 1.5, sm: 2 },
                    fontSize: { xs: '0.8rem', sm: '0.875rem' }
                  }}>
                    Need access? Contact system administrator
                  </Typography>

                  {/* Default Credentials Info */}
                  <Box sx={{
                    p: { xs: 1.5, sm: 2 },
                    backgroundColor: isDarkMode ? 'rgba(25, 118, 210, 0.1)' : 'rgba(25, 118, 210, 0.05)',
                    borderRadius: 2,
                    border: isDarkMode ? '1px solid rgba(25, 118, 210, 0.2)' : '1px solid rgba(25, 118, 210, 0.1)'
                  }}>
                    <Typography variant="caption" sx={{
                      color: isDarkMode ? '#94a3b8' : 'text.secondary',
                      fontWeight: 'bold',
                      display: 'block',
                      mb: 1,
                      fontSize: { xs: '0.7rem', sm: '0.75rem' }
                    }}>
                      Default Credentials (Change after first login):
                    </Typography>
                    {/* Only show credentials for department roles, not external departments */}
                    {form.role !== 'accounts' && form.role !== 'librarian' && form.role !== 'maintenance' && form.role !== 'super_admin' && form.department && (
                      <>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Coordinator: {form.department ? `${form.department.toLowerCase()}.coordinator@university.edu` : 'dept.coordinator@university.edu'} / {form.department ? `${form.department.toLowerCase()}123456` : 'dept123456'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Additional HOD: {form.department ? `${form.department.toLowerCase()}.additional@university.edu` : 'dept.additional@university.edu'} / {form.department ? `${form.department.toLowerCase()}123456` : 'dept123456'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Dean: {form.department ? `${form.department.toLowerCase()}.dean@university.edu` : 'dept.dean@university.edu'} / {form.department ? `${form.department.toLowerCase()}123456` : 'dept123456'}
                        </Typography>
                      </>
                    )}
                    {/* Show message for external departments */}
                    {(form.role === 'accounts' || form.role === 'librarian' || form.role === 'maintenance') && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontStyle: 'italic' }}>
                        External departments have a single login account. Contact Super Admin to create your account.
                      </Typography>
                    )}
                    {/* Show message for super admin */}
                    {form.role === 'super_admin' && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Super Admin: superadmin@university.edu / superadmin123456
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <Box sx={{ mt: { xs: 2, sm: 3, md: 4 }, textAlign: 'center', px: { xs: 1, sm: 0 } }}>
            <Typography variant="body2" sx={{
              color: isDarkMode ? '#ffffff' : 'white',
              opacity: 0.8,
              fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.875rem' }
            }}>
              Administrative access is by invitation only. Contact{' '}
              <Link
                href="mailto:admin@ecomplaint.edu"
                sx={{
                  color: isDarkMode ? '#ffffff' : 'white',
                  textDecoration: 'underline',
                  '&:hover': { opacity: 0.7 }
                }}
              >
                admin@ecomplaint.edu
              </Link>
              {' '}for access requests.
            </Typography>

            {/* Forgot Password link for Super Admin only */}
            {form.role === 'super_admin' && (
              <Button
                variant="text"
                onClick={handleOpenForgotPassword}
                sx={{
                  mt: 2,
                  color: isDarkMode ? '#60a5fa' : '#90caf9',
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
                startIcon={<LockReset />}
              >
                Forgot Super Admin Password?
              </Button>
            )}
          </Box>
        </Container>
      </Box>

      {/* Forgot Password Dialog for Super Admin */}
      <Dialog
        open={forgotPasswordOpen}
        onClose={handleCloseForgotPassword}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: isDarkMode ? '#1e293b' : '#fff',
            color: isDarkMode ? '#fff' : 'inherit'
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LockReset color="primary" />
          Super Admin Password Reset
        </DialogTitle>
        <DialogContent>
          {forgotError && (
            <Alert severity="error" sx={{ mb: 2 }}>{forgotError}</Alert>
          )}
          {forgotSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>{forgotSuccess}</Alert>
          )}

          {forgotStep === 1 && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Enter your super admin email to receive a password reset OTP on your recovery email.
              </Typography>
              <TextField
                fullWidth
                label="Super Admin Email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                disabled
                sx={{ mb: 2 }}
              />
            </Box>
          )}

          {forgotStep === 2 && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Enter the OTP sent to {maskedEmail} and your new password.
              </Typography>
              <TextField
                fullWidth
                label="OTP"
                value={forgotOtp}
                onChange={(e) => setForgotOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                type="password"
                label="New Password"
                value={forgotNewPassword}
                onChange={(e) => setForgotNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                sx={{ mb: 2 }}
                helperText="Password must be at least 8 characters"
              />
            </Box>
          )}

          {forgotStep === 3 && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h6" color="success.main">
                ✅ Password Reset Successful!
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                You can now login with your new password.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseForgotPassword} disabled={forgotLoading}>
            Cancel
          </Button>
          {forgotStep === 1 && (
            <Button
              onClick={handleSendOtp}
              variant="contained"
              disabled={forgotLoading}
              startIcon={forgotLoading ? <CircularProgress size={20} /> : null}
            >
              {forgotLoading ? 'Sending...' : 'Send OTP'}
            </Button>
          )}
          {forgotStep === 2 && (
            <Button
              onClick={handleResetPassword}
              variant="contained"
              disabled={forgotLoading || !forgotOtp || !forgotNewPassword}
              startIcon={forgotLoading ? <CircularProgress size={20} /> : null}
            >
              {forgotLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  )
}
