import React, { useState, useEffect } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import api from '../../lib/api.js'
import { useAuth } from '../../auth/AuthContext.jsx'
import { useToast } from '../../contexts/ToastContext.jsx'
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Link,
  Grid,
  Card,
  CardContent,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Fade,
  Zoom,
  LinearProgress
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  Person,
  Email,
  School,
  Badge,
  Lock,
  AccountBalance,
  CheckCircle,
  Error,
  Info
} from '@mui/icons-material'

export default function StudentRegister() {
  const nav = useNavigate()
  const { setToken, setUser } = useAuth()
  const { showSuccess, showError } = useToast()
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    libraryId: '',
    rollNo: '',
    department: '',
    year: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [currentStep, setCurrentStep] = useState(0)
  const [formProgress, setFormProgress] = useState(0)

  // College email validation (also allows Gmail for testing)
  const validateCollegeEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9.-]+\.edu|gmail\.com)$/i
    return emailPattern.test(email)
  }

  // Calculate form progress
  const calculateProgress = () => {
    const totalFields = 9
    const filledFields = Object.values(form).filter(value => value.trim() !== '').length
    return Math.round((filledFields / totalFields) * 100)
  }

  // Update progress when form changes
  useEffect(() => {
    setFormProgress(calculateProgress())
  }, [form])

  // Get available years based on department
  const getAvailableYears = (department) => {
    const twoYearCourses = ['MCA', 'MBA']
    const fourYearCourses = ['CSE', 'Electronics', 'Mechanical', 'Civil', 'Electrical']

    if (twoYearCourses.includes(department)) {
      return [
        { value: '1', label: '1st Year' },
        { value: '2', label: '2nd Year' }
      ]
    } else if (fourYearCourses.includes(department)) {
      return [
        { value: '1', label: '1st Year' },
        { value: '2', label: '2nd Year' },
        { value: '3', label: '3rd Year' },
        { value: '4', label: '4th Year' }
      ]
    } else {
      // Default to 4 years if no department selected
      return [
        { value: '1', label: '1st Year' },
        { value: '2', label: '2nd Year' },
        { value: '3', label: '3rd Year' },
        { value: '4', label: '4th Year' }
      ]
    }
  }

  // Form validation
  const validateForm = () => {
    const newErrors = {}

    // Required fields validation
    if (!form.firstName.trim()) {
      newErrors.firstName = 'wrong credentials'
    }
    if (!form.lastName.trim()) {
      newErrors.lastName = 'wrong credentials'
    }

    // First name validation
    if (form.firstName && !/^[a-zA-Z]+$/.test(form.firstName.trim())) {
      newErrors.firstName = 'wrong credentials'
    }
    if (form.firstName && form.firstName.trim().length < 4) {
      newErrors.firstName = 'wrong credentials'
    }

    // Last name validation
    if (form.lastName && !/^[a-zA-Z]+$/.test(form.lastName.trim())) {
      newErrors.lastName = 'wrong credentials'
    }
    if (form.lastName && form.lastName.trim().length < 4) {
      newErrors.lastName = 'wrong credentials'
    }

    if (!form.email.trim()) {
      newErrors.email = 'wrong credentials'
    }
    if (!form.libraryId.trim()) {
      newErrors.libraryId = 'wrong credentials'
    }
    if (!form.rollNo.trim()) {
      newErrors.rollNo = 'wrong credentials'
    }
    if (!form.password) {
      newErrors.password = 'wrong credentials'
    }
    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'wrong credentials'
    }

    // Email validation
    if (form.email && !validateCollegeEmail(form.email)) {
      newErrors.email = 'wrong credentials'
    }

    // Password validation
    if (form.password && form.password.length < 8) {
      newErrors.password = 'wrong credentials'
    }

    // Library ID validation
    if (form.libraryId && !/^[a-zA-Z0-9]+$/.test(form.libraryId)) {
      newErrors.libraryId = 'wrong credentials'
    }
    if (form.libraryId && form.libraryId.length < 5) {
      newErrors.libraryId = 'wrong credentials'
    }

    // Roll Number validation
    if (form.rollNo && !/^\d+$/.test(form.rollNo)) {
      newErrors.rollNo = 'wrong credentials'
    }
    if (form.rollNo && form.rollNo.length < 10) {
      newErrors.rollNo = 'wrong credentials'
    }

    // Department validation
    if (!form.department) {
      newErrors.department = 'wrong credentials'
    }

    // Year validation
    if (!form.year) {
      newErrors.year = 'wrong credentials'
    }

    // Confirm password validation
    if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'wrong credentials'
    }


    setErrors(newErrors)
    return { isValid: Object.keys(newErrors).length === 0, errors: newErrors }
  }

  const handleInputChange = (field) => (e) => {
    let value = e.target.value

    // Allow all characters to be typed - validation will happen on submission
    // No filtering during typing

    setForm(prev => {
      const newForm = { ...prev, [field]: value }

      // Reset year when department changes
      if (field === 'department') {
        newForm.year = ''
      }

      return newForm
    })

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    const validation = validateForm()
    if (!validation.isValid) {
      setError('Please fix the errors below. Check all fields for mistakes.')
      // Scroll to first error field
      const firstErrorField = Object.keys(validation.errors)[0]
      if (firstErrorField) {
        // Try to find the input field by various methods
        setTimeout(() => {
          const fieldId = firstErrorField

          // Try multiple selectors to find the field
          let element = document.getElementById(fieldId) ||
            document.querySelector(`[name="${fieldId}"]`) ||
            document.querySelector(`input#${fieldId}`) ||
            document.querySelector(`textarea#${fieldId}`)

          // For Select fields, use labelId
          if (!element && (fieldId === 'department' || fieldId === 'year')) {
            const labelId = fieldId === 'department' ? 'department-label' : 'year-label'
            element = document.getElementById(labelId) ||
              document.querySelector(`[aria-labelledby*="${labelId}"]`)
          }

          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
            // For Select components, focus might not work, so we try to click
            if (element.focus) {
              element.focus()
            } else if (element.click) {
              element.click()
            }
          }
        }, 100)
      }
      return
    }

    setLoading(true)
    try {
      // Send OTP to email instead of directly registering
      const { data } = await api.post('/api/auth/send-otp', {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        libraryId: form.libraryId,
        rollNo: form.rollNo,
        department: form.department,
        year: form.year,
        password: form.password
      })

      showSuccess('OTP sent to your email! Please check your inbox.')
      setSuccess('OTP sent to your email! Redirecting to verification page...')

      // Redirect to OTP verification page with email as query parameter
      setTimeout(() => {
        nav(`/verify-otp?email=${encodeURIComponent(form.email)}`)
      }, 1500)
    } catch (err) {
      console.error('Registration error:', err)
      console.error('Error response:', err.response?.data)
      const errorMessage = err.response?.data?.message || err.message || 'Failed to send OTP. Please try again.'
      setError(errorMessage)
      showError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4
      }}
    >
      <Container maxWidth="md">
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
            Student Registration
          </Typography>
        </Box>

        <Card
          elevation={10}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: (theme) => theme.palette.mode === 'dark'
              ? '0 20px 40px rgba(0,0,0,0.3)'
              : '0 20px 40px rgba(0,0,0,0.1)',
            backgroundColor: (theme) => theme.palette.mode === 'dark'
              ? 'rgba(30, 30, 30, 0.9)'
              : 'white'
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                Create Your Account
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
              {/* Form Progress */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                    Form Progress: {formProgress}%
                  </Typography>
                  <Box sx={{ flexGrow: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={formProgress}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)'
                        }
                      }}
                    />
                  </Box>
                </Box>

                {/* Progress Steps */}
                <Stepper activeStep={currentStep} alternativeLabel>
                  <Step>
                    <StepLabel>Personal Info</StepLabel>
                  </Step>
                  <Step>
                    <StepLabel>Academic Details</StepLabel>
                  </Step>
                  <Step>
                    <StepLabel>Security Setup</StepLabel>
                  </Step>
                </Stepper>
              </Box>

              <Grid container spacing={3}>
                {/* Section 1: Personal Information */}
                <Grid item xs={12}>
                  <Fade in={true} timeout={800}>
                    <Paper
                      elevation={3}
                      sx={{
                        p: { xs: 2, sm: 3, md: 4 },
                        borderRadius: 3,
                        border: (theme) => theme.palette.mode === 'dark'
                          ? '2px solid rgba(25, 118, 210, 0.3)'
                          : '2px solid #e3f2fd',
                        backgroundColor: (theme) => theme.palette.mode === 'dark'
                          ? 'rgba(30, 30, 30, 0.8)'
                          : '#fafafa',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: '#1976d2',
                          boxShadow: '0 8px 25px rgba(25, 118, 210, 0.15)'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 4 }, flexWrap: 'wrap', gap: 1 }}>
                        <Box sx={{
                          p: 1.5,
                          borderRadius: '50%',
                          backgroundColor: '#e3f2fd',
                          mr: 2
                        }}>
                          <Person sx={{ color: '#1976d2', fontSize: 28 }} />
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold', mb: 0.5 }}>
                            Personal Information
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Tell us about yourself
                          </Typography>
                        </Box>
                        <Chip
                          label="Required"
                          size="small"
                          color="primary"
                          icon={<Info />}
                          sx={{ ml: 2 }}
                        />
                      </Box>

                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            name="firstName"
                            id="firstName"
                            label="First Name"
                            value={form.firstName}
                            onChange={handleInputChange('firstName')}
                            error={!!errors.firstName}
                            helperText={errors.firstName || "At least 4 alphabetic characters"}
                            required
                            autoComplete="given-name"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                backgroundColor: (theme) => theme.palette.mode === 'dark'
                                  ? 'rgba(60, 60, 60, 0.8)'
                                  : 'white',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.1)',
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#1976d2',
                                    borderWidth: '2px'
                                  }
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#1976d2',
                                  borderWidth: '2px'
                                }
                              }
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Person color={form.firstName ? "success" : "primary"} />
                                </InputAdornment>
                              ),
                              endAdornment: form.firstName && !errors.firstName && (
                                <InputAdornment position="end">
                                  <CheckCircle color="success" fontSize="small" />
                                </InputAdornment>
                              )
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            name="lastName"
                            id="lastName"
                            label="Last Name"
                            value={form.lastName}
                            onChange={handleInputChange('lastName')}
                            error={!!errors.lastName}
                            helperText={errors.lastName || "At least 4 alphabetic characters"}
                            required
                            autoComplete="family-name"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                backgroundColor: (theme) => theme.palette.mode === 'dark'
                                  ? 'rgba(60, 60, 60, 0.8)'
                                  : 'white',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.1)',
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#1976d2',
                                    borderWidth: '2px'
                                  }
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#1976d2',
                                  borderWidth: '2px'
                                }
                              }
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Person color={form.lastName ? "success" : "primary"} />
                                </InputAdornment>
                              ),
                              endAdornment: form.lastName && !errors.lastName && (
                                <InputAdornment position="end">
                                  <CheckCircle color="success" fontSize="small" />
                                </InputAdornment>
                              )
                            }}
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            name="email"
                            id="email"
                            label="College Email Address"
                            type="email"
                            value={form.email}
                            onChange={handleInputChange('email')}
                            error={!!errors.email}
                            helperText={errors.email || "Use your college email (e.g., student@university.edu)"}
                            required
                            autoComplete="email"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                backgroundColor: (theme) => theme.palette.mode === 'dark'
                                  ? 'rgba(60, 60, 60, 0.8)'
                                  : 'white',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.1)',
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#1976d2',
                                    borderWidth: '2px'
                                  }
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#1976d2',
                                  borderWidth: '2px'
                                }
                              }
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Email color={form.email && !errors.email ? "success" : "primary"} />
                                </InputAdornment>
                              ),
                              endAdornment: form.email && !errors.email && validateCollegeEmail(form.email) && (
                                <InputAdornment position="end">
                                  <CheckCircle color="success" fontSize="small" />
                                </InputAdornment>
                              )
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  </Fade>
                </Grid>

                {/* Section 2: Academic Information */}
                <Grid item xs={12}>
                  <Fade in={true} timeout={1000}>
                    <Paper
                      elevation={3}
                      sx={{
                        p: { xs: 2, sm: 3, md: 4 },
                        borderRadius: 3,
                        border: (theme) => theme.palette.mode === 'dark'
                          ? '2px solid rgba(76, 175, 80, 0.3)'
                          : '2px solid #e8f5e8',
                        backgroundColor: (theme) => theme.palette.mode === 'dark'
                          ? 'rgba(30, 30, 30, 0.8)'
                          : '#fafafa',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: '#4caf50',
                          boxShadow: '0 8px 25px rgba(76, 175, 80, 0.15)'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 4 }, flexWrap: 'wrap', gap: 1 }}>
                        <Box sx={{
                          p: 1.5,
                          borderRadius: '50%',
                          backgroundColor: '#e8f5e8',
                          mr: 2
                        }}>
                          <School sx={{ color: '#4caf50', fontSize: 28 }} />
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 'bold', mb: 0.5 }}>
                            Academic Information
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Your educational details
                          </Typography>
                        </Box>
                        <Chip
                          label="Required"
                          size="small"
                          color="success"
                          icon={<Info />}
                          sx={{ ml: 2 }}
                        />
                      </Box>

                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            name="libraryId"
                            id="libraryId"
                            label="Library ID"
                            value={form.libraryId}
                            onChange={handleInputChange('libraryId')}
                            error={!!errors.libraryId}
                            helperText={errors.libraryId || "Alphanumeric characters only"}
                            required
                            autoComplete="username"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                backgroundColor: (theme) => theme.palette.mode === 'dark'
                                  ? 'rgba(60, 60, 60, 0.8)'
                                  : 'white',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  boxShadow: (theme) => theme.palette.mode === 'dark'
                                    ? '0 4px 12px rgba(76, 175, 80, 0.2)'
                                    : '0 4px 12px rgba(76, 175, 80, 0.1)'
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#1976d2',
                                  borderWidth: '2px'
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#1976d2',
                                  borderWidth: '2px'
                                }
                              }
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Badge color={form.libraryId && !errors.libraryId ? "success" : "primary"} />
                                </InputAdornment>
                              ),
                              endAdornment: form.libraryId && !errors.libraryId && (
                                <InputAdornment position="end">
                                  <CheckCircle color="success" fontSize="small" />
                                </InputAdornment>
                              )
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            name="rollNo"
                            id="rollNo"
                            label="University Roll Number"
                            value={form.rollNo}
                            onChange={handleInputChange('rollNo')}
                            error={!!errors.rollNo}
                            helperText={errors.rollNo || "Numbers only"}
                            required
                            autoComplete="off"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                backgroundColor: (theme) => theme.palette.mode === 'dark'
                                  ? 'rgba(60, 60, 60, 0.8)'
                                  : 'white',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  boxShadow: (theme) => theme.palette.mode === 'dark'
                                    ? '0 4px 12px rgba(76, 175, 80, 0.2)'
                                    : '0 4px 12px rgba(76, 175, 80, 0.1)'
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#1976d2',
                                  borderWidth: '2px'
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#1976d2',
                                  borderWidth: '2px'
                                }
                              }
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <AccountBalance color={form.rollNo && !errors.rollNo ? "success" : "primary"} />
                                </InputAdornment>
                              ),
                              endAdornment: form.rollNo && !errors.rollNo && (
                                <InputAdornment position="end">
                                  <CheckCircle color="success" fontSize="small" />
                                </InputAdornment>
                              )
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth error={!!errors.department}>
                            <InputLabel id="department-label" shrink>Department</InputLabel>
                            <Select
                              labelId="department-label"
                              value={form.department}
                              label="Department"
                              onChange={handleInputChange('department')}
                              displayEmpty
                              renderValue={(selected) => {
                                if (!selected) {
                                  return <span style={{ color: '#999' }}>Select Department</span>;
                                }
                                return selected;
                              }}
                              sx={{
                                height: '56px',
                                backgroundColor: (theme) => theme.palette.mode === 'dark'
                                  ? 'rgba(60, 60, 60, 0.8)'
                                  : 'white',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  boxShadow: (theme) => theme.palette.mode === 'dark'
                                    ? '0 4px 12px rgba(76, 175, 80, 0.2)'
                                    : '0 4px 12px rgba(76, 175, 80, 0.1)'
                                },
                                '& .MuiSelect-select': {
                                  height: '56px',
                                  display: 'flex',
                                  alignItems: 'center'
                                }
                              }}
                            >
                              <MenuItem value="" disabled>
                                <em>Select Department</em>
                              </MenuItem>
                              <MenuItem value="MCA">MCA</MenuItem>
                              <MenuItem value="MBA">MBA</MenuItem>
                              <MenuItem value="CSE">CSE</MenuItem>
                              <MenuItem value="Electronics">Electronics</MenuItem>
                              <MenuItem value="Mechanical">Mechanical</MenuItem>
                              <MenuItem value="Civil">Civil</MenuItem>
                              <MenuItem value="Electrical">Electrical</MenuItem>
                            </Select>
                            {errors.department && (
                              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                                {errors.department}
                              </Typography>
                            )}
                          </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth error={!!errors.year}>
                            <InputLabel id="year-label" shrink>Year of Study</InputLabel>
                            <Select
                              labelId="year-label"
                              value={form.year}
                              label="Year of Study"
                              onChange={handleInputChange('year')}
                              displayEmpty
                              renderValue={(selected) => {
                                if (!selected) {
                                  return <span style={{ color: '#999' }}>Select Year of Study</span>;
                                }
                                const yearOption = getAvailableYears(form.department).find(y => y.value === selected);
                                return yearOption ? yearOption.label : selected;
                              }}
                              sx={{
                                height: '56px',
                                backgroundColor: (theme) => theme.palette.mode === 'dark'
                                  ? 'rgba(60, 60, 60, 0.8)'
                                  : 'white',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  boxShadow: (theme) => theme.palette.mode === 'dark'
                                    ? '0 4px 12px rgba(76, 175, 80, 0.2)'
                                    : '0 4px 12px rgba(76, 175, 80, 0.1)'
                                },
                                '& .MuiSelect-select': {
                                  height: '56px',
                                  display: 'flex',
                                  alignItems: 'center'
                                }
                              }}
                            >
                              <MenuItem value="" disabled>
                                <em>Select Year of Study</em>
                              </MenuItem>
                              {getAvailableYears(form.department).map(year => (
                                <MenuItem key={year.value} value={year.value}>
                                  {year.label}
                                </MenuItem>
                              ))}
                            </Select>
                            {errors.year && (
                              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                                {errors.year}
                              </Typography>
                            )}
                          </FormControl>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Fade>
                </Grid>

                {/* Section 3: Security */}
                <Grid item xs={12}>
                  <Fade in={true} timeout={1200}>
                    <Paper
                      elevation={3}
                      sx={{
                        p: { xs: 2, sm: 3, md: 4 },
                        borderRadius: 3,
                        border: (theme) => theme.palette.mode === 'dark'
                          ? '2px solid rgba(255, 152, 0, 0.3)'
                          : '2px solid #fff3e0',
                        backgroundColor: (theme) => theme.palette.mode === 'dark'
                          ? 'rgba(30, 30, 30, 0.8)'
                          : '#fafafa',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: '#ff9800',
                          boxShadow: '0 8px 25px rgba(255, 152, 0, 0.15)'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 4 }, flexWrap: 'wrap', gap: 1 }}>
                        <Box sx={{
                          p: 1.5,
                          borderRadius: '50%',
                          backgroundColor: '#fff3e0',
                          mr: 2
                        }}>
                          <Lock sx={{ color: '#ff9800', fontSize: 28 }} />
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" sx={{ color: '#ff9800', fontWeight: 'bold', mb: 0.5 }}>
                            Security Setup
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Create a secure password
                          </Typography>
                        </Box>
                        <Chip
                          label="Required"
                          size="small"
                          color="warning"
                          icon={<Info />}
                          sx={{ ml: 2 }}
                        />
                      </Box>

                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            name="password"
                            id="password"
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            value={form.password}
                            onChange={handleInputChange('password')}
                            error={!!errors.password}
                            helperText={errors.password || "Minimum 8 characters"}
                            required
                            autoComplete="new-password"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                backgroundColor: (theme) => theme.palette.mode === 'dark'
                                  ? 'rgba(60, 60, 60, 0.8)'
                                  : 'white',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  boxShadow: '0 4px 12px rgba(255, 152, 0, 0.1)',
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#1976d2',
                                    borderWidth: '2px'
                                  }
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#1976d2',
                                  borderWidth: '2px'
                                }
                              }
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Lock color={form.password && !errors.password ? "success" : "primary"} />
                                </InputAdornment>
                              ),
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() => setShowPassword(!showPassword)}
                                    edge="end"
                                    sx={{ mr: 1 }}
                                  >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                          {/* Password Strength Indicator */}
                          {form.password && (
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                Password Strength:
                                <Box component="span" sx={{
                                  ml: 1,
                                  color: form.password.length >= 8 ? '#4caf50' : '#ff9800',
                                  fontWeight: 'bold'
                                }}>
                                  {form.password.length >= 8 ? 'Strong' : 'Weak'}
                                </Box>
                              </Typography>
                            </Box>
                          )}
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            name="confirmPassword"
                            id="confirmPassword"
                            label="Confirm Password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={form.confirmPassword}
                            onChange={handleInputChange('confirmPassword')}
                            error={!!errors.confirmPassword}
                            helperText={errors.confirmPassword || "Re-enter your password"}
                            required
                            autoComplete="new-password"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                backgroundColor: (theme) => theme.palette.mode === 'dark'
                                  ? 'rgba(60, 60, 60, 0.8)'
                                  : 'white',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  boxShadow: '0 4px 12px rgba(255, 152, 0, 0.1)',
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#1976d2',
                                    borderWidth: '2px'
                                  }
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#1976d2',
                                  borderWidth: '2px'
                                }
                              }
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Lock color={form.confirmPassword && !errors.confirmPassword ? "success" : "primary"} />
                                </InputAdornment>
                              ),
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    edge="end"
                                    sx={{ mr: 1 }}
                                  >
                                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                          {/* Password Match Indicator */}
                          {form.confirmPassword && (
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                Password Match:
                                <Box component="span" sx={{
                                  ml: 1,
                                  color: form.confirmPassword === form.password ? '#4caf50' : '#f44336',
                                  fontWeight: 'bold'
                                }}>
                                  {form.confirmPassword === form.password ? '✓ Match' : '✗ No Match'}
                                </Box>
                              </Typography>
                            </Box>
                          )}
                        </Grid>
                      </Grid>
                    </Paper>
                  </Fade>
                </Grid>
              </Grid>

              {/* Submit Section */}
              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Zoom in={true} timeout={1000}>
                  <Paper
                    elevation={4}
                    sx={{
                      p: { xs: 2, sm: 3, md: 4 },
                      borderRadius: 3,
                      backgroundColor: (theme) => theme.palette.mode === 'dark'
                        ? 'rgba(30, 30, 30, 0.9)'
                        : '#f8f9fa',
                      border: (theme) => theme.palette.mode === 'dark'
                        ? '2px solid rgba(25, 118, 210, 0.3)'
                        : '2px solid #e3f2fd',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: '#1976d2',
                        boxShadow: '0 12px 40px rgba(25, 118, 210, 0.15)'
                      }
                    }}
                  >
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Ready to Create Your Account?
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        By creating an account, you agree to our Terms of Service and Privacy Policy
                      </Typography>
                    </Box>

                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={loading || formProgress < 100}
                      sx={{
                        px: 8,
                        py: 2,
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        background: formProgress === 100
                          ? 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)'
                          : 'linear-gradient(45deg, #9e9e9e 30%, #bdbdbd 90%)',
                        borderRadius: 3,
                        minWidth: 250,
                        '&:hover': {
                          background: formProgress === 100
                            ? 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)'
                            : 'linear-gradient(45deg, #9e9e9e 30%, #bdbdbd 90%)',
                          transform: formProgress === 100 ? 'translateY(-3px)' : 'none',
                          boxShadow: formProgress === 100
                            ? '0 12px 30px rgba(25, 118, 210, 0.4)'
                            : 'none'
                        },
                        '&:disabled': {
                          background: loading ? 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)' : '#ccc',
                          color: loading ? 'white' : undefined,
                          transform: 'none'
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      {loading ? '📧 Sending verification email...' :
                        formProgress === 100 ? 'Create Account' :
                          `Complete Form (${formProgress}%)`}
                    </Button>

                    {loading && (
                      <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
                          Please wait, this may take 15-30 seconds...
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          We're sending a verification code to your email
                        </Typography>
                      </Box>
                    )}

                    {formProgress < 100 && !loading && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Please fill all required fields to continue
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Zoom>
              </Box>

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <Link
                    component={RouterLink}
                    to="/login"
                    sx={{
                      fontWeight: 'bold',
                      color: '#1976d2',
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    Sign In Here
                  </Link>
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}
