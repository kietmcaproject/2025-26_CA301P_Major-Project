import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/api.js'
import { useAuth } from '../../auth/AuthContext.jsx'
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext.jsx'
import { useTheme } from '@mui/material/styles'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Tab,
  Tabs,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  CircularProgress,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import {
  BarChart,
  List as ListIcon,
  Add,
  TrendingUp,
  CheckCircle,
  Pending,
  Cancel,
  Assignment,
  Person,
  Email,
  School,
  CalendarToday,
  PriorityHigh,
  Category,
  Description,
  Refresh,
  Send,
  Edit,
  Close,
  CameraAlt,
  Delete,
  Upload,
  Visibility,
  ZoomIn,
  AttachFile,
  PictureAsPdf,
  InsertDriveFile,
  Image as ImageIcon
} from '@mui/icons-material'

export default function StudentDashboard() {
  const navigate = useNavigate()
  const { user, setToken, setUser } = useAuth()
  const { isDarkMode } = useCustomTheme()
  const theme = useTheme()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  // New complaint form state
  const [complaintForm, setComplaintForm] = useState({
    title: '',
    category: '',
    priority: 'Medium',
    description: '',
    isPublic: false,
    anonymous: false
  })

  // Form validation errors
  const [formErrors, setFormErrors] = useState({
    title: '',
    category: '',
    description: ''
  })

  // Edit complaint state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingComplaint, setEditingComplaint] = useState(null)
  const [editForm, setEditForm] = useState({
    title: '',
    category: '',
    priority: 'Medium',
    description: ''
  })
  const [updating, setUpdating] = useState(false)

  // Profile picture state
  const [uploadingPicture, setUploadingPicture] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [imageViewDialogOpen, setImageViewDialogOpen] = useState(false)

  // Complaint attachment state
  const [selectedFiles, setSelectedFiles] = useState([])
  const [uploadingFiles, setUploadingFiles] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      // Force fresh data by bypassing cache with timestamp and noCache flag
      const { data } = await api.get('/api/dashboard', {
        params: { _t: Date.now(), noCache: true }
      })
      setData(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  // Real-time validation
  const validateField = (field, value) => {
    const newErrors = { ...formErrors }

    switch (field) {
      case 'title':
        if (!value.trim()) {
          newErrors.title = 'Title is required'
        } else if (value.trim().length < 5) {
          newErrors.title = `Title must be at least 5 characters (${value.trim().length}/5)`
        } else {
          newErrors.title = ''
        }
        break
      case 'category':
        if (!value) {
          newErrors.category = 'Category is required'
        } else {
          newErrors.category = ''
        }
        break
      case 'description':
        if (!value.trim()) {
          newErrors.description = 'Description is required'
        } else if (value.trim().length < 10) {
          newErrors.description = `Description must be at least 10 characters (${value.trim().length}/10)`
        } else {
          newErrors.description = ''
        }
        break
      default:
        break
    }

    setFormErrors(newErrors)
  }

  // Check if form is valid
  const isFormValid = () => {
    return (
      complaintForm.title.trim().length >= 5 &&
      complaintForm.category &&
      complaintForm.description.trim().length >= 10 &&
      complaintForm.priority &&
      !formErrors.title &&
      !formErrors.category &&
      !formErrors.description
    )
  }

  // Complaint attachment file handling functions
  const handleComplaintFileSelect = (e) => {
    const files = Array.from(e.target.files || [])

    // Validate file count (max 5 files)
    if (selectedFiles.length + files.length > 5) {
      setError('Maximum 5 files allowed. Please remove some files before adding new ones.')
      return
    }

    // Validate file types and sizes
    const validFiles = []
    const maxSize = 10 * 1024 * 1024 // 10MB

    files.forEach(file => {
      const validTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/zip', 'application/x-zip-compressed'
      ]

      if (!validTypes.includes(file.type)) {
        setError(`${file.name}: File type not allowed. Allowed types: images (JPG, PNG, GIF, WebP), PDF, Word documents, text files, and ZIP files.`)
        return
      }

      if (file.size > maxSize) {
        setError(`${file.name}: File size too large. Maximum 10MB per file.`)
        return
      }

      validFiles.push(file)
    })

    if (validFiles.length > 0) {
      setSelectedFiles([...selectedFiles, ...validFiles])
      setError('')
    }
  }

  const handleFileRemove = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
  }

  const uploadAttachments = async (complaintId) => {
    if (selectedFiles.length === 0) return

    setUploadingFiles(true)
    try {
      const formData = new FormData()
      selectedFiles.forEach(file => {
        formData.append('attachments', file)
      })

      await api.post(`/api/complaints/${complaintId}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      setSelectedFiles([])
    } catch (err) {
      console.error('Error uploading attachments:', err)
      throw err
    } finally {
      setUploadingFiles(false)
    }
  }

  const handleComplaintSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('') // Clear any previous errors

    // Validate all fields
    validateField('title', complaintForm.title)
    validateField('category', complaintForm.category)
    validateField('description', complaintForm.description)

    // Check if form is valid
    if (!isFormValid()) {
      setError('Please fill all required fields correctly')
      setSubmitting(false)
      return
    }

    try {
      console.log('Submitting complaint:', complaintForm) // Debug log
      const response = await api.post('/api/complaints', complaintForm)
      console.log('Complaint submitted successfully:', response.data) // Debug log

      const complaintId = response.data.complaint._id

      // Upload attachments if any files are selected
      if (selectedFiles.length > 0) {
        await uploadAttachments(complaintId)
      }

      setComplaintForm({ title: '', category: '', priority: 'Medium', description: '', isPublic: false, anonymous: false })
      setFormErrors({ title: '', category: '', description: '' })
      setSelectedFiles([])
      await loadDashboardData() // Refresh data
      setActiveTab(0) // Switch to Overview tab
    } catch (err) {
      console.error('Complaint submission error:', err.response?.data) // Debug log
      const errorMessage = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Failed to submit complaint'
      setError(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'resolved': return 'success'
      case 'pending': return 'warning'
      case 'rejected': return 'error'
      default: return 'default'
    }
  }

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'resolved': return <CheckCircle />
      case 'pending': return <Pending />
      case 'rejected': return <Cancel />
      default: return <Assignment />
    }
  }

  const handleEditClick = (complaint) => {
    // Double-check if complaint can be edited before opening dialog
    if (!canEditComplaint(complaint)) {
      setError('Cannot edit complaint. It has been forwarded to higher authority and is under review.')
      return
    }

    setEditingComplaint(complaint)
    setEditForm({
      title: complaint.title,
      category: complaint.category,
      priority: complaint.priority,
      description: complaint.description
    })
    setError('') // Clear any previous errors
    setEditDialogOpen(true)
  }

  const handleEditClose = () => {
    setEditDialogOpen(false)
    setEditingComplaint(null)
    setEditForm({
      title: '',
      category: '',
      priority: 'Medium',
      description: ''
    })
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!editingComplaint) return

    // Double-check if complaint can still be edited before submitting
    if (!canEditComplaint(editingComplaint)) {
      setError('Cannot edit complaint. It has been forwarded to higher authority and is under review.')
      setUpdating(false)
      return
    }

    setUpdating(true)
    setError('')

    // Validation
    if (!editForm.title.trim() || editForm.title.trim().length < 5) {
      setError('Title must be at least 5 characters long')
      setUpdating(false)
      return
    }

    if (!editForm.category) {
      setError('Category is required')
      setUpdating(false)
      return
    }

    if (!editForm.description.trim() || editForm.description.trim().length < 10) {
      setError('Description must be at least 10 characters long')
      setUpdating(false)
      return
    }

    try {
      await api.put(`/api/complaints/${editingComplaint._id}`, editForm)
      await loadDashboardData() // Refresh data
      handleEditClose()
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Failed to update complaint'
      setError(errorMessage)
    } finally {
      setUpdating(false)
    }
  }

  const canEditComplaint = (complaint) => {
    if (!complaint) return false

    // Students cannot edit complaints that have been forwarded to Dean or Additional HOD
    // Handle both object and string formats for workflow
    const workflow = complaint.workflow || {}
    const workflowLevel = workflow.currentLevel || complaint.workflow?.currentLevel || ''

    // Check if complaint has been forwarded to higher authority
    if (workflowLevel === 'dean' || workflowLevel === 'additional_hod') {
      return false
    }

    // Students can only edit complaints that are Pending or In Progress and still at coordinator level
    const status = complaint.status || ''
    const isPendingOrInProgress = status === 'Pending' || status === 'In Progress' || status.toLowerCase() === 'pending' || status.toLowerCase() === 'in progress'

    // Allow editing only if at coordinator level (or no workflow level set, which means coordinator)
    const isAtCoordinatorLevel = !workflowLevel || workflowLevel === 'coordinator' || workflowLevel === ''

    return isPendingOrInProgress && isAtCoordinatorLevel
  }

  // Profile picture handlers
  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB')
        return
      }
      setSelectedFile(file)
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadPicture = async () => {
    if (!selectedFile) {
      setError('Please select an image file')
      return
    }

    setUploadingPicture(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('profilePicture', selectedFile)

      // For file uploads, we need to remove the default Content-Type header
      // so axios can set it automatically with the correct boundary
      const response = await api.post('/api/profile/upload-picture', formData, {
        headers: {
          'Content-Type': undefined // Remove default Content-Type to let axios set multipart/form-data with boundary
        }
      })

      if (response.data.success) {
        console.log('Upload successful, profile picture URL:', response.data.profilePicture);
        // Update the student data immediately with the new profile picture
        if (data && data.student) {
          setData({
            ...data,
            student: {
              ...data.student,
              profilePicture: response.data.profilePicture
            }
          })
        }
        // Also refresh dashboard data to ensure consistency
        await loadDashboardData()
        // Notify navbar to refresh profile picture
        window.dispatchEvent(new Event('profilePictureUpdated'))
        setPreviewImage(null)
        setSelectedFile(null)
        // Reset file inputs
        const fileInputTop = document.getElementById('profile-picture-input-top')
        const fileInputBottom = document.getElementById('profile-picture-input')
        if (fileInputTop) fileInputTop.value = ''
        if (fileInputBottom) fileInputBottom.value = ''
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload profile picture')
    } finally {
      setUploadingPicture(false)
    }
  }

  const handleDeletePicture = async () => {
    if (!window.confirm('Are you sure you want to delete your profile picture?')) {
      return
    }

    setUploadingPicture(true)
    setError('')

    try {
      await api.delete('/api/profile/delete-picture')
      await loadDashboardData()
      // Notify navbar to refresh profile picture
      window.dispatchEvent(new Event('profilePictureUpdated'))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete profile picture')
    } finally {
      setUploadingPicture(false)
    }
  }

  const cancelUpload = () => {
    setPreviewImage(null)
    setSelectedFile(null)
    const fileInputTop = document.getElementById('profile-picture-input-top')
    const fileInputBottom = document.getElementById('profile-picture-input')
    if (fileInputTop) fileInputTop.value = ''
    if (fileInputBottom) fileInputBottom.value = ''
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{
        width: '100vw',
        margin: 0,
        padding: 0,
        py: 4,
        px: { xs: 2, sm: 4, md: 6, lg: 8, xl: 12 }
      }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  if (!data) return null

  const { student, stats, complaints } = data

  return (
    <Box sx={{
      minHeight: '100vh',
      background: isDarkMode
        ? 'linear-gradient(135deg, #121212 0%, #1e1e1e 100%)'
        : 'linear-gradient(135deg, #f5f7fa 0%, #e8f0f8 100%)',
      width: '100vw',
      margin: 0,
      padding: 0,
      color: theme.palette.text.primary
    }}>
      <Box sx={{
        width: '100%',
        py: 2,
        pt: 2,
        px: { xs: 2, sm: 3, md: 4, lg: 6, xl: 8 }
      }}>
        {/* Header Section with Profile Picture - Side by Side */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 4,
          gap: 3,
          flexWrap: { xs: 'wrap', md: 'nowrap' }
        }}>
          {/* Dashboard Title Section - Left Side */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h3" gutterBottom sx={{
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '2.5rem',
              mb: 1
            }}>
              Student Dashboard
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontSize: '1.1rem', fontWeight: '400' }}>
              {student.department} Department • Welcome, {student.firstName} {student.lastName}
            </Typography>
          </Box>

          {/* Profile Picture Section - Right Side */}
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flexShrink: 0,
            minWidth: { xs: '100%', md: 'auto' }
          }}>
            <Box sx={{ position: 'relative', mb: 1 }}>
              <Box
                onClick={() => {
                  if (student.profilePicture || previewImage) {
                    setImageViewDialogOpen(true)
                  }
                }}
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '3px solid #1976d2',
                  boxShadow: '0 4px 20px rgba(25, 118, 210, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.palette.mode === 'dark' ? '#2a2a2a' : '#f5f5f5',
                  cursor: (student.profilePicture || previewImage) ? 'pointer' : 'default',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: (student.profilePicture || previewImage) ? 'scale(1.05)' : 'none',
                    boxShadow: (student.profilePicture || previewImage) ? '0 6px 25px rgba(25, 118, 210, 0.4)' : '0 4px 20px rgba(25, 118, 210, 0.3)'
                  }
                }}
              >
                {student.profilePicture || previewImage ? (
                  <img
                    src={previewImage || student.profilePicture}
                    alt="Profile"
                    onError={(e) => {
                      console.error('Error loading profile picture:', student.profilePicture);
                      e.target.style.display = 'none';
                    }}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <Person sx={{ fontSize: 50, color: '#1976d2', opacity: 0.5 }} />
                )}
              </Box>
              {!previewImage && (
                <IconButton
                  component="label"
                  sx={{
                    position: 'absolute',
                    bottom: -5,
                    right: -5,
                    backgroundColor: '#1976d2',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#1565c0'
                    },
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                    width: 32,
                    height: 32
                  }}
                  disabled={uploadingPicture}
                >
                  <CameraAlt sx={{ fontSize: 18 }} />
                  <input
                    id="profile-picture-input-top"
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleFileSelect}
                  />
                </IconButton>
              )}
            </Box>
            {previewImage && (
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={uploadingPicture ? <CircularProgress size={16} color="inherit" /> : <Upload />}
                  onClick={handleUploadPicture}
                  disabled={uploadingPicture}
                  sx={{
                    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                    borderRadius: '6px',
                    textTransform: 'none',
                    fontWeight: '600',
                    fontSize: '0.75rem',
                    px: 1.5,
                    py: 0.5
                  }}
                >
                  {uploadingPicture ? 'Uploading...' : 'Upload'}
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={cancelUpload}
                  disabled={uploadingPicture}
                  sx={{
                    borderRadius: '6px',
                    textTransform: 'none',
                    fontWeight: '600',
                    fontSize: '0.75rem',
                    px: 1.5,
                    py: 0.5
                  }}
                >
                  Cancel
                </Button>
              </Box>
            )}
            {student.profilePicture && !previewImage && (
              <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Visibility />}
                  onClick={() => setImageViewDialogOpen(true)}
                  sx={{
                    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                    borderRadius: '6px',
                    textTransform: 'none',
                    fontWeight: '600',
                    fontSize: '0.7rem',
                    px: 1,
                    py: 0.3
                  }}
                >
                  View
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<Delete />}
                  onClick={handleDeletePicture}
                  disabled={uploadingPicture}
                  sx={{
                    borderRadius: '6px',
                    textTransform: 'none',
                    fontWeight: '600',
                    fontSize: '0.7rem',
                    px: 1,
                    py: 0.3
                  }}
                >
                  Remove
                </Button>
              </Box>
            )}
          </Box>
        </Box>

        {/* Tabs */}
        <Box sx={{
          borderBottom: 2,
          borderColor: 'divider',
          mb: 4,
          backgroundColor: theme.palette.background.paper,
          borderRadius: 0,
          px: { xs: 2, sm: 3, md: 4, lg: 6, xl: 8 },
          boxShadow: isDarkMode ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.05)'
        }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: '600',
                minHeight: 56,
                px: 3,
                '&.Mui-selected': {
                  color: '#1976d2'
                }
              },
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0'
              }
            }}
          >
            <Tab label="Overview" />
            <Tab label="My Complaints" />
            <Tab label="New Complaint" />
            <Tab label="Analytics" />
          </Tabs>
        </Box>

        {/* Tab Content */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Overview Tab */}
        {activeTab === 0 && (
          <Box>
            {/* Student Info */}
            <Paper sx={{
              py: 4,
              px: { xs: 2, sm: 3, md: 4, lg: 6, xl: 8 },
              mb: 3,
              borderRadius: 0,
              boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 4px 20px rgba(0, 0, 0, 0.08)',
              background: isDarkMode
                ? 'linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              border: isDarkMode
                ? '1px solid rgba(25, 118, 210, 0.3)'
                : '1px solid rgba(25, 118, 210, 0.1)'
            }}>
              <Typography variant="h6" gutterBottom sx={{
                fontWeight: 'bold',
                mb: 3,
                color: '#1976d2',
                fontSize: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Person sx={{ fontSize: 28 }} />
                Student Information
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    borderRadius: '10px',
                    backgroundColor: isDarkMode
                      ? 'rgba(25, 118, 210, 0.15)'
                      : 'rgba(25, 118, 210, 0.05)',
                    border: isDarkMode
                      ? '1px solid rgba(25, 118, 210, 0.3)'
                      : '1px solid rgba(25, 118, 210, 0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: isDarkMode
                        ? 'rgba(25, 118, 210, 0.25)'
                        : 'rgba(25, 118, 210, 0.08)',
                      transform: 'translateY(-2px)',
                      boxShadow: isDarkMode
                        ? '0 4px 12px rgba(25, 118, 210, 0.3)'
                        : '0 4px 12px rgba(25, 118, 210, 0.15)'
                    }
                  }}>
                    <Person sx={{ mr: 2, color: '#1976d2', fontSize: 32 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: '500' }}>
                        Full Name
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: '600', color: theme.palette.text.primary }}>
                        {student.firstName} {student.lastName}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    borderRadius: '10px',
                    backgroundColor: isDarkMode
                      ? 'rgba(25, 118, 210, 0.15)'
                      : 'rgba(25, 118, 210, 0.05)',
                    border: isDarkMode
                      ? '1px solid rgba(25, 118, 210, 0.3)'
                      : '1px solid rgba(25, 118, 210, 0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: isDarkMode
                        ? 'rgba(25, 118, 210, 0.25)'
                        : 'rgba(25, 118, 210, 0.08)',
                      transform: 'translateY(-2px)',
                      boxShadow: isDarkMode
                        ? '0 4px 12px rgba(25, 118, 210, 0.3)'
                        : '0 4px 12px rgba(25, 118, 210, 0.15)'
                    }
                  }}>
                    <Email sx={{ mr: 2, color: '#1976d2', fontSize: 32 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: '500' }}>
                        Email Address
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: '600', color: theme.palette.text.primary }}>
                        {student.email}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    borderRadius: '10px',
                    backgroundColor: isDarkMode
                      ? 'rgba(25, 118, 210, 0.15)'
                      : 'rgba(25, 118, 210, 0.05)',
                    border: isDarkMode
                      ? '1px solid rgba(25, 118, 210, 0.3)'
                      : '1px solid rgba(25, 118, 210, 0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: isDarkMode
                        ? 'rgba(25, 118, 210, 0.25)'
                        : 'rgba(25, 118, 210, 0.08)',
                      transform: 'translateY(-2px)',
                      boxShadow: isDarkMode
                        ? '0 4px 12px rgba(25, 118, 210, 0.3)'
                        : '0 4px 12px rgba(25, 118, 210, 0.15)'
                    }
                  }}>
                    <School sx={{ mr: 2, color: '#1976d2', fontSize: 32 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: '500' }}>
                        Department
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: '600', color: theme.palette.text.primary }}>
                        {student.department}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    borderRadius: '10px',
                    backgroundColor: isDarkMode
                      ? 'rgba(25, 118, 210, 0.15)'
                      : 'rgba(25, 118, 210, 0.05)',
                    border: isDarkMode
                      ? '1px solid rgba(25, 118, 210, 0.3)'
                      : '1px solid rgba(25, 118, 210, 0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: isDarkMode
                        ? 'rgba(25, 118, 210, 0.25)'
                        : 'rgba(25, 118, 210, 0.08)',
                      transform: 'translateY(-2px)',
                      boxShadow: isDarkMode
                        ? '0 4px 12px rgba(25, 118, 210, 0.3)'
                        : '0 4px 12px rgba(25, 118, 210, 0.15)'
                    }
                  }}>
                    <Assignment sx={{ mr: 2, color: '#1976d2', fontSize: 32 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: '500' }}>
                        Library ID
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: '600', color: theme.palette.text.primary }}>
                        {student.libraryId}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Recent Complaints */}
            <Paper sx={{
              py: 4,
              px: { xs: 2, sm: 3, md: 4, lg: 6, xl: 8 },
              borderRadius: 0,
              boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 4px 20px rgba(0, 0, 0, 0.08)',
              background: isDarkMode
                ? 'linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              border: isDarkMode
                ? '1px solid rgba(25, 118, 210, 0.3)'
                : '1px solid rgba(25, 118, 210, 0.1)'
            }}>
              <Typography variant="h6" gutterBottom sx={{
                fontWeight: 'bold',
                mb: 3,
                color: '#1976d2',
                fontSize: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Assignment sx={{ fontSize: 28 }} />
                Recent Complaints
              </Typography>
              {complaints && complaints.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {complaints.slice(0, 5).map((complaint) => (
                    <Paper
                      key={complaint._id}
                      sx={{
                        p: 2.5,
                        borderRadius: '12px',
                        backgroundColor: theme.palette.background.paper,
                        boxShadow: isDarkMode ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.12)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 2.5
                      }}
                    >
                      {/* Status Icon Square */}
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: '8px',
                          backgroundColor:
                            complaint.status.toLowerCase() === 'pending'
                              ? '#f57c00'
                              : complaint.status.toLowerCase() === 'resolved'
                                ? '#2e7d32'
                                : complaint.status.toLowerCase() === 'rejected'
                                  ? '#d32f2f'
                                  : '#1976d2',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          '& svg': {
                            color: 'white',
                            fontSize: 28
                          }
                        }}
                      >
                        {getStatusIcon(complaint.status)}
                      </Box>

                      {/* Content */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 'bold',
                            color: theme.palette.text.primary,
                            mb: 0.5,
                            fontSize: '1rem'
                          }}
                        >
                          {complaint.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: theme.palette.text.secondary,
                            mb: 1.5,
                            fontSize: '0.875rem',
                            lineHeight: 1.5
                          }}
                        >
                          {complaint.description.length > 60
                            ? `${complaint.description.substring(0, 60)}...`
                            : complaint.description}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                            <Chip
                              label={complaint.status}
                              size="small"
                              sx={{
                                backgroundColor:
                                  complaint.status.toLowerCase() === 'pending'
                                    ? '#f57c00'
                                    : complaint.status.toLowerCase() === 'resolved'
                                      ? '#2e7d32'
                                      : complaint.status.toLowerCase() === 'rejected'
                                        ? '#d32f2f'
                                        : '#1976d2',
                                color: 'white',
                                fontWeight: '500',
                                fontSize: '0.75rem',
                                height: '24px'
                              }}
                            />
                            <Chip
                              label={complaint.category}
                              size="small"
                              variant="outlined"
                              sx={{
                                borderColor: theme.palette.divider,
                                color: theme.palette.text.secondary,
                                backgroundColor: theme.palette.mode === 'dark' ? '#2a2a2a' : '#f5f5f5',
                                fontWeight: '400',
                                fontSize: '0.75rem',
                                height: '24px'
                              }}
                            />
                          </Box>
                          {canEditComplaint(complaint) && (
                            <IconButton
                              size="small"
                              onClick={() => handleEditClick(complaint)}
                              sx={{
                                color: '#1976d2',
                                '&:hover': {
                                  backgroundColor: 'rgba(25, 118, 210, 0.1)'
                                }
                              }}
                              title="Edit Complaint"
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Assignment sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.3 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontWeight: '500' }}>
                    No complaints yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Create your first complaint to get started!
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
        )}

        {/* My Complaints Tab */}
        {activeTab === 1 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', fontSize: '1.8rem' }}>
                My Complaints
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={loadDashboardData}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: '600'
                }}
              >
                Refresh
              </Button>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : complaints && complaints.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {complaints.map((complaint) => (
                  <Paper
                    key={complaint._id}
                    sx={{
                      p: 2.5,
                      borderRadius: '12px',
                      backgroundColor: theme.palette.background.paper,
                      boxShadow: isDarkMode ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.12)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 2.5
                    }}
                  >
                    {/* Status Icon Square */}
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '8px',
                        backgroundColor:
                          complaint.status.toLowerCase() === 'pending'
                            ? '#f57c00'
                            : complaint.status.toLowerCase() === 'resolved'
                              ? '#2e7d32'
                              : complaint.status.toLowerCase() === 'rejected'
                                ? '#d32f2f'
                                : '#1976d2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        '& svg': {
                          color: 'white',
                          fontSize: 28
                        }
                      }}
                    >
                      {getStatusIcon(complaint.status)}
                    </Box>

                    {/* Content */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 'bold',
                          color: theme.palette.text.primary,
                          mb: 0.5,
                          fontSize: '1rem'
                        }}
                      >
                        {complaint.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: theme.palette.text.secondary,
                          mb: 1.5,
                          fontSize: '0.875rem',
                          lineHeight: 1.5
                        }}
                      >
                        {complaint.description.length > 80
                          ? `${complaint.description.substring(0, 80)}...`
                          : complaint.description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                        <Chip
                          label={complaint.status}
                          size="small"
                          sx={{
                            backgroundColor:
                              complaint.status.toLowerCase() === 'pending'
                                ? '#f57c00'
                                : complaint.status.toLowerCase() === 'resolved'
                                  ? '#2e7d32'
                                  : complaint.status.toLowerCase() === 'rejected'
                                    ? '#d32f2f'
                                    : '#1976d2',
                            color: 'white',
                            fontWeight: '500',
                            fontSize: '0.75rem',
                            height: '24px'
                          }}
                        />
                        <Chip
                          label={complaint.category}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderColor: theme.palette.divider,
                            color: theme.palette.text.secondary,
                            backgroundColor: theme.palette.mode === 'dark' ? '#2a2a2a' : '#f5f5f5',
                            fontWeight: '400',
                            fontSize: '0.75rem',
                            height: '24px'
                          }}
                        />
                        {canEditComplaint(complaint) && (
                          <IconButton
                            size="small"
                            onClick={() => handleEditClick(complaint)}
                            sx={{
                              ml: 'auto',
                              color: '#1976d2',
                              '&:hover': {
                                backgroundColor: 'rgba(25, 118, 210, 0.1)'
                              }
                            }}
                            title="Edit Complaint"
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </Box>
            ) : (
              <Paper sx={{
                py: 6,
                px: { xs: 2, sm: 3, md: 4, lg: 6, xl: 8 },
                textAlign: 'center',
                borderRadius: 0,
                boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 4px 20px rgba(0, 0, 0, 0.08)',
                background: isDarkMode
                  ? 'linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%)'
                  : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
              }}>
                <Assignment sx={{ fontSize: 80, color: 'text.secondary', mb: 3, opacity: 0.3 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontWeight: '600', mb: 1 }}>
                  No complaints found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Start by creating your first complaint!
                </Typography>
              </Paper>
            )}
          </Box>
        )}

        {/* New Complaint Tab */}
        {activeTab === 2 && (
          <Box>
            {/* Form Card */}
            <Card sx={{
              borderRadius: 0,
              boxShadow: isDarkMode
                ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                : '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: isDarkMode
                ? '1px solid rgba(25, 118, 210, 0.3)'
                : '1px solid rgba(25, 118, 210, 0.1)',
              overflow: 'hidden',
              backgroundColor: isDarkMode
                ? 'rgba(30, 30, 30, 0.8)'
                : '#fafafa',
              position: 'relative',
              minHeight: '100vh',
              paddingBottom: '80px'
            }}>
              <CardContent sx={{ p: { xs: 2, sm: 3, md: 4, lg: 6, xl: 8 } }}>
                <Box component="form" onSubmit={handleComplaintSubmit}>
                  {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {error}
                    </Alert>
                  )}
                  <Grid container spacing={3}>
                    {/* Row 1: Title, Category, Priority - 3 cards in equal spacing */}
                    {/* Title Field */}
                    <Grid item xs={12} md={4}>
                      <Box sx={{
                        mb: 2,
                        p: 3,
                        height: '100%',
                        backgroundColor: isDarkMode
                          ? 'rgba(45, 45, 45, 0.8)'
                          : theme.palette.background.paper,
                        borderRadius: '12px',
                        border: isDarkMode
                          ? '1px solid rgba(255, 255, 255, 0.1)'
                          : '1px solid rgba(0, 0, 0, 0.05)',
                        boxShadow: isDarkMode
                          ? '0 2px 8px rgba(0, 0, 0, 0.3)'
                          : '0 2px 8px rgba(0, 0, 0, 0.05)'
                      }}>
                        <Typography variant="h6" sx={{ fontWeight: '600', color: '#1976d2', mb: 1 }}>
                          <Assignment sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Complaint Title
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Provide a clear, concise title for your complaint
                        </Typography>
                        <TextField
                          fullWidth
                          required
                          label="Complaint Title *"
                          value={complaintForm.title}
                          onChange={(e) => {
                            setComplaintForm({ ...complaintForm, title: e.target.value })
                            validateField('title', e.target.value)
                          }}
                          error={!!formErrors.title}
                          helperText={formErrors.title || (complaintForm.title.trim() ? `${complaintForm.title.trim().length}/5 characters minimum` : 'Minimum 5 characters required')}
                          placeholder="e.g., Library computer not working, Hostel water issue, etc."
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              fontSize: '1.1rem',
                              backgroundColor: isDarkMode
                                ? 'rgba(60, 60, 60, 0.8)'
                                : theme.palette.background.paper,
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
                        />
                      </Box>
                    </Grid>

                    {/* Category Field */}
                    <Grid item xs={12} md={4}>
                      <Box sx={{
                        mb: 2,
                        p: 3,
                        height: '100%',
                        backgroundColor: isDarkMode
                          ? 'rgba(45, 45, 45, 0.8)'
                          : theme.palette.background.paper,
                        borderRadius: '12px',
                        border: isDarkMode
                          ? '1px solid rgba(255, 255, 255, 0.1)'
                          : '1px solid rgba(0, 0, 0, 0.05)',
                        boxShadow: isDarkMode
                          ? '0 2px 8px rgba(0, 0, 0, 0.3)'
                          : '0 2px 8px rgba(0, 0, 0, 0.05)'
                      }}>
                        <Typography variant="h6" sx={{ fontWeight: '600', color: '#1976d2', mb: 1 }}>
                          <Category sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Category
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Select the most relevant category
                        </Typography>
                        <FormControl
                          fullWidth
                          required
                          error={!!formErrors.category}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              fontSize: '1.1rem',
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
                        >
                          <InputLabel>Choose Category</InputLabel>
                          <Select
                            value={complaintForm.category}
                            label="Choose Category *"
                            onChange={(e) => {
                              setComplaintForm({ ...complaintForm, category: e.target.value })
                              validateField('category', e.target.value)
                            }}
                          >
                            <MenuItem value="Academic">📚 Academic</MenuItem>
                            <MenuItem value="Administration">🏢 Administration</MenuItem>
                            <MenuItem value="Infrastructure">🏗️ Infrastructure</MenuItem>
                            <MenuItem value="Library">📖 Library</MenuItem>
                            <MenuItem value="Hostel">🏠 Hostel</MenuItem>
                            <MenuItem value="Cafeteria">🍽️ Cafeteria</MenuItem>
                            <MenuItem value="Transport">🚌 Transport</MenuItem>
                            <MenuItem value="Faculty">👨‍🏫 Faculty</MenuItem>
                            <MenuItem value="Examination">📝 Examination</MenuItem>
                            <MenuItem value="Fee">💰 Fee</MenuItem>
                            <MenuItem value="Other">📋 Other</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </Grid>

                    {/* Priority Field */}
                    <Grid item xs={12} md={4}>
                      <Box sx={{
                        mb: 2,
                        p: 3,
                        height: '100%',
                        backgroundColor: isDarkMode
                          ? 'rgba(45, 45, 45, 0.8)'
                          : theme.palette.background.paper,
                        borderRadius: '12px',
                        border: isDarkMode
                          ? '1px solid rgba(255, 255, 255, 0.1)'
                          : '1px solid rgba(0, 0, 0, 0.05)',
                        boxShadow: isDarkMode
                          ? '0 2px 8px rgba(0, 0, 0, 0.3)'
                          : '0 2px 8px rgba(0, 0, 0, 0.05)'
                      }}>
                        <Typography variant="h6" sx={{ fontWeight: '600', color: '#1976d2', mb: 1 }}>
                          <PriorityHigh sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Priority Level
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          How urgent is this issue?
                        </Typography>
                        <FormControl
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              fontSize: '1.1rem',
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
                        >
                          <InputLabel>Select Priority</InputLabel>
                          <Select
                            value={complaintForm.priority}
                            label="Select Priority *"
                            onChange={(e) => setComplaintForm({ ...complaintForm, priority: e.target.value })}
                          >
                            <MenuItem value="Low">🟢 Low - Can wait</MenuItem>
                            <MenuItem value="Medium">🟡 Medium - Normal priority</MenuItem>
                            <MenuItem value="High">🟠 High - Important</MenuItem>
                            <MenuItem value="Urgent">🔴 Urgent - Immediate attention</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </Grid>

                    {/* Row 2: Description and File Attachments - 2 cards in equal spacing */}
                    {/* Description Field */}
                    <Grid item xs={12} md={6}>
                      <Box sx={{
                        mb: 2,
                        p: 3,
                        height: '100%',
                        backgroundColor: isDarkMode
                          ? 'rgba(45, 45, 45, 0.8)'
                          : theme.palette.background.paper,
                        borderRadius: '12px',
                        border: isDarkMode
                          ? '1px solid rgba(255, 255, 255, 0.1)'
                          : '1px solid rgba(0, 0, 0, 0.05)',
                        boxShadow: isDarkMode
                          ? '0 2px 8px rgba(0, 0, 0, 0.3)'
                          : '0 2px 8px rgba(0, 0, 0, 0.05)'
                      }}>
                        <Typography variant="h6" sx={{ fontWeight: '600', color: '#1976d2', mb: 1 }}>
                          <Description sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Detailed Description
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Provide as much detail as possible to help us understand and resolve your issue
                        </Typography>
                        <TextField
                          fullWidth
                          required
                          label="Detailed Description *"
                          multiline
                          rows={5}
                          value={complaintForm.description}
                          onChange={(e) => {
                            setComplaintForm({ ...complaintForm, description: e.target.value })
                            validateField('description', e.target.value)
                          }}
                          error={!!formErrors.description}
                          helperText={formErrors.description || (complaintForm.description.trim() ? `${complaintForm.description.trim().length}/10 characters minimum` : 'Minimum 10 characters required')}
                          placeholder="Please describe your issue in detail. Include when it occurred, what you were trying to do, and any error messages you might have seen..."
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              fontSize: '1.1rem',
                              backgroundColor: isDarkMode
                                ? 'rgba(60, 60, 60, 0.8)'
                                : theme.palette.background.paper,
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
                        />
                      </Box>
                    </Grid>

                    {/* File Attachments Section */}
                    <Grid item xs={12} md={6}>
                      <Box sx={{
                        mb: 2,
                        p: 3,
                        height: '100%',
                        backgroundColor: isDarkMode
                          ? 'rgba(45, 45, 45, 0.8)'
                          : theme.palette.background.paper,
                        borderRadius: '12px',
                        border: isDarkMode
                          ? '1px solid rgba(255, 255, 255, 0.1)'
                          : '1px solid rgba(0, 0, 0, 0.05)',
                        boxShadow: isDarkMode
                          ? '0 2px 8px rgba(0, 0, 0, 0.3)'
                          : '0 2px 8px rgba(0, 0, 0, 0.05)'
                      }}>
                        <Typography variant="h6" sx={{ fontWeight: '600', color: '#1976d2', mb: 1 }}>
                          <AttachFile sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Attach
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Upload PDF or JPG files as proof/evidence for your complaint (Max 5 files, 10MB per file)
                        </Typography>

                        {/* File Input */}
                        <Box sx={{ mb: 2 }}>
                          <input
                            accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.txt,.zip"
                            style={{ display: 'none' }}
                            id="complaint-file-input"
                            multiple
                            type="file"
                            onChange={handleComplaintFileSelect}
                            disabled={submitting || uploadingFiles}
                          />
                          <label htmlFor="complaint-file-input">
                            <Button
                              variant="outlined"
                              component="span"
                              startIcon={<Upload />}
                              disabled={submitting || uploadingFiles || selectedFiles.length >= 5}
                              sx={{
                                borderRadius: '8px',
                                textTransform: 'none',
                                borderColor: '#1976d2',
                                color: '#1976d2',
                                '&:hover': {
                                  borderColor: '#1565c0',
                                  backgroundColor: 'rgba(25, 118, 210, 0.08)'
                                }
                              }}
                            >
                              Select Files
                            </Button>
                          </label>
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 2, display: 'inline-block' }}>
                            {selectedFiles.length}/5 files selected
                          </Typography>
                        </Box>

                        {/* Selected Files List */}
                        {selectedFiles.length > 0 && (
                          <Box>
                            <Typography variant="body2" sx={{ mb: 1, fontWeight: '500' }}>
                              Selected Files:
                            </Typography>
                            <List sx={{ bgcolor: isDarkMode ? 'rgba(60, 60, 60, 0.5)' : 'rgba(0, 0, 0, 0.02)', borderRadius: '8px', p: 1 }}>
                              {selectedFiles.map((file, index) => (
                                <ListItem
                                  key={index}
                                  sx={{
                                    border: '1px solid',
                                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                                    borderRadius: '8px',
                                    mb: 1,
                                    bgcolor: isDarkMode ? 'rgba(45, 45, 45, 0.8)' : theme.palette.background.paper
                                  }}
                                  secondaryAction={
                                    <IconButton
                                      edge="end"
                                      onClick={() => handleFileRemove(index)}
                                      disabled={submitting || uploadingFiles}
                                      sx={{ color: 'error.main' }}
                                    >
                                      <Delete />
                                    </IconButton>
                                  }
                                >
                                  <ListItemIcon>
                                    {file.type === 'application/pdf' ? (
                                      <PictureAsPdf sx={{ color: '#d32f2f' }} />
                                    ) : file.type.startsWith('image/') ? (
                                      <ImageIcon sx={{ color: '#1976d2' }} />
                                    ) : (
                                      <InsertDriveFile sx={{ color: '#666' }} />
                                    )}
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={file.name}
                                    secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        )}
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Submit Button - Inside Form */}
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    mt: 4,
                    pr: 2
                  }}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={submitting || uploadingFiles || !isFormValid()}
                      startIcon={(submitting || uploadingFiles) ? <CircularProgress size={20} color="inherit" /> : <Send />}
                      sx={{
                        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                        borderRadius: '12px',
                        px: 6,
                        py: 2,
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        textTransform: 'none',
                        boxShadow: '0 4px 16px rgba(25, 118, 210, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                          boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                          transform: 'translateY(-2px)'
                        },
                        '&:disabled': {
                          background: 'rgba(0, 0, 0, 0.12)',
                          color: 'rgba(0, 0, 0, 0.26)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {uploadingFiles
                        ? 'Uploading Files...'
                        : submitting
                          ? 'Submitting Complaint...'
                          : 'Submit Complaint'}
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Analytics Tab */}
        {activeTab === 3 && (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              Analytics
            </Typography>

            {complaints && complaints.length > 0 ? (
              <Grid container spacing={4}>
                {/* Pie Chart Section */}
                <Grid item xs={12} lg={8}>
                  <Card sx={{
                    borderRadius: 0,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    height: '100%'
                  }}>
                    <CardContent sx={{ p: { xs: 2, sm: 3, md: 4, lg: 6, xl: 8 } }}>
                      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 4, color: '#1976d2' }}>
                        <TrendingUp sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Complaint Categories Distribution
                      </Typography>

                      <Grid container spacing={4} alignItems="center">
                        {/* Pie Chart */}
                        <Grid item xs={12} md={6}>
                          <Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {(() => {
                              const categoryCounts = complaints.reduce((acc, complaint) => {
                                acc[complaint.category] = (acc[complaint.category] || 0) + 1;
                                return acc;
                              }, {});

                              const colors = [
                                '#1976d2', '#f57c00', '#2e7d32', '#d32f2f',
                                '#7b1fa2', '#00acc1', '#ff9800', '#795548',
                                '#607d8b', '#9c27b0', '#ff5722', '#4caf50'
                              ];

                              const data = Object.entries(categoryCounts).map(([category, count], index) => ({
                                name: category,
                                value: count,
                                color: colors[index % colors.length]
                              }));

                              const CustomTooltip = ({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0];
                                  const total = complaints.length;
                                  const percentage = ((data.value / total) * 100).toFixed(1);
                                  return (
                                    <Box sx={{
                                      backgroundColor: isDarkMode
                                        ? 'rgba(60, 60, 60, 0.8)'
                                        : 'white',
                                      border: '1px solid #ccc',
                                      borderRadius: '8px',
                                      p: 2,
                                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                                    }}>
                                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: data.payload.color }}>
                                        {data.name}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        Count: {data.value}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        Percentage: {percentage}%
                                      </Typography>
                                    </Box>
                                  );
                                }
                                return null;
                              };

                              if (data.length === 0) {
                                return (
                                  <Box sx={{ textAlign: 'center', p: 4 }}>
                                    <Typography variant="h6" color="text.secondary">
                                      No data available for chart
                                    </Typography>
                                  </Box>
                                );
                              }

                              return (
                                <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                    <Pie
                                      data={data}
                                      cx="50%"
                                      cy="50%"
                                      labelLine={false}
                                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                      outerRadius={120}
                                      fill="#8884d8"
                                      dataKey="value"
                                    >
                                      {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                      ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                  </PieChart>
                                </ResponsiveContainer>
                              );
                            })()}
                          </Box>
                        </Grid>

                        {/* Enhanced Legend */}
                        <Grid item xs={12} md={6}>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: '#1976d2' }}>
                              Category Breakdown
                            </Typography>
                            {(() => {
                              const categoryCounts = complaints.reduce((acc, complaint) => {
                                acc[complaint.category] = (acc[complaint.category] || 0) + 1;
                                return acc;
                              }, {});

                              const colors = [
                                '#1976d2', '#f57c00', '#2e7d32', '#d32f2f',
                                '#7b1fa2', '#00acc1', '#ff9800', '#795548',
                                '#607d8b', '#9c27b0', '#ff5722', '#4caf50'
                              ];

                              return Object.entries(categoryCounts)
                                .sort(([, a], [, b]) => b - a) // Sort by count descending
                                .map(([category, count], index) => {
                                  const percentage = ((count / complaints.length) * 100).toFixed(1);
                                  return (
                                    <Box key={category} sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      mb: 2,
                                      p: 2,
                                      borderRadius: '12px',
                                      backgroundColor: 'rgba(0, 0, 0, 0.02)',
                                      border: '1px solid rgba(0, 0, 0, 0.05)',
                                      transition: 'all 0.2s ease',
                                      '&:hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.05)',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                                      }
                                    }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                        <Box sx={{
                                          width: 20,
                                          height: 20,
                                          borderRadius: '50%',
                                          backgroundColor: colors[index % colors.length],
                                          mr: 2,
                                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                                        }} />
                                        <Box>
                                          <Typography variant="body1" sx={{ fontWeight: '600', mb: 0.5 }}>
                                            {category}
                                          </Typography>
                                          <Typography variant="caption" color="text.secondary">
                                            {count} complaint{count !== 1 ? 's' : ''}
                                          </Typography>
                                        </Box>
                                      </Box>
                                      <Box sx={{ textAlign: 'right' }}>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: colors[index % colors.length] }}>
                                          {percentage}%
                                        </Typography>
                                      </Box>
                                    </Box>
                                  );
                                });
                            })()}
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Statistics Summary */}
                <Grid item xs={12} lg={4}>
                  <Card sx={{
                    borderRadius: 0,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    height: '100%'
                  }}>
                    <CardContent sx={{ p: { xs: 2, sm: 3, md: 4, lg: 6, xl: 8 } }}>
                      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 4, color: '#1976d2' }}>
                        <BarChart sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Summary Statistics
                      </Typography>

                      <Grid container spacing={3}>
                        <Grid item xs={6}>
                          <Box sx={{
                            textAlign: 'center',
                            p: 2,
                            borderRadius: '12px',
                            backgroundColor: 'rgba(25, 118, 210, 0.05)',
                            border: '1px solid rgba(25, 118, 210, 0.1)'
                          }}>
                            <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 1 }}>
                              {complaints.length}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: '500' }}>
                              Total Filed
                            </Typography>
                          </Box>
                        </Grid>

                        <Grid item xs={6}>
                          <Box sx={{
                            textAlign: 'center',
                            p: 2,
                            borderRadius: '12px',
                            backgroundColor: 'rgba(46, 125, 50, 0.05)',
                            border: '1px solid rgba(46, 125, 50, 0.1)'
                          }}>
                            <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#2e7d32', mb: 1 }}>
                              {complaints.filter(c => c.status.toLowerCase() === 'resolved').length}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: '500' }}>
                              Resolved
                            </Typography>
                          </Box>
                        </Grid>

                        <Grid item xs={6}>
                          <Box sx={{
                            textAlign: 'center',
                            p: 2,
                            borderRadius: '12px',
                            backgroundColor: 'rgba(245, 124, 0, 0.05)',
                            border: '1px solid rgba(245, 124, 0, 0.1)'
                          }}>
                            <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#f57c00', mb: 1 }}>
                              {complaints.filter(c => c.status.toLowerCase() === 'pending').length}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: '500' }}>
                              Pending
                            </Typography>
                          </Box>
                        </Grid>

                        <Grid item xs={6}>
                          <Box sx={{
                            textAlign: 'center',
                            p: 2,
                            borderRadius: '12px',
                            backgroundColor: 'rgba(211, 47, 47, 0.05)',
                            border: '1px solid rgba(211, 47, 47, 0.1)'
                          }}>
                            <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#d32f2f', mb: 1 }}>
                              {complaints.filter(c => c.status.toLowerCase() === 'rejected').length}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: '500' }}>
                              Rejected
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      {/* Additional Insights */}
                      <Box sx={{ mt: 4, p: 3, backgroundColor: 'rgba(0, 0, 0, 0.02)', borderRadius: '12px' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1976d2' }}>
                          Quick Insights
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Most Common Category:
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: '600' }}>
                            {(() => {
                              const categoryCounts = complaints.reduce((acc, complaint) => {
                                acc[complaint.category] = (acc[complaint.category] || 0) + 1;
                                return acc;
                              }, {});
                              const mostCommon = Object.entries(categoryCounts).reduce((a, b) => a[1] > b[1] ? a : b);
                              return mostCommon[0];
                            })()}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Resolution Rate:
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: '600', color: '#2e7d32' }}>
                            {complaints.length > 0 ?
                              ((complaints.filter(c => c.status.toLowerCase() === 'resolved').length / complaints.length) * 100).toFixed(1)
                              : 0}%
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <TrendingUp sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Analytics Available
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Submit some complaints to see analytics and insights
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setActiveTab(2)}
                  sx={{
                    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                    borderRadius: '8px',
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: '600',
                    textTransform: 'none',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)'
                    }
                  }}
                >
                  Submit Your First Complaint
                </Button>
              </Box>
            )}
          </Box>
        )}

        {/* Edit Complaint Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={handleEditClose}
          maxWidth="md"
          fullWidth
          scroll="paper"
          sx={{
            zIndex: 9999,
            '& .MuiBackdrop-root': {
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 9998
            },
            '& .MuiPopover-root': {
              zIndex: '10001 !important'
            },
            '& .MuiMenu-paper': {
              zIndex: '10001 !important'
            }
          }}
          PaperProps={{
            sx: {
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 9999,
              position: 'relative',
              overflow: 'visible'
            }
          }}
        >
          <DialogTitle sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pb: 2,
            borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
            flexShrink: 0
          }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
              Edit Complaint
            </Typography>
            <IconButton onClick={handleEditClose} size="small">
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{
            pt: 4,
            pb: 2,
            flex: '1 1 auto',
            overflowY: 'auto',
            overflowX: 'visible',
            minHeight: 0,
            position: 'relative',
            '& .MuiInputLabel-root': {
              position: 'relative',
              transform: 'none',
              marginBottom: '8px',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: 'text.secondary'
            },
            '& .MuiInputLabel-shrink': {
              transform: 'none'
            }
          }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            <Box component="form" onSubmit={handleEditSubmit} sx={{ width: '100%' }}>
              <Grid container spacing={3}>
                {/* Title Field */}
                <Grid item xs={12}>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: '500', color: 'text.secondary' }}>
                      Complaint Title *
                    </Typography>
                    <TextField
                      fullWidth
                      required
                      label=""
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      placeholder="e.g., Library computer not working, Hostel water issue, etc."
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
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
                    />
                  </Box>
                </Grid>

                {/* Category and Priority Row */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: '500', color: 'text.secondary' }}>
                      Category *
                    </Typography>
                    <FormControl fullWidth required>
                      <InputLabel sx={{ display: 'none' }}>Category *</InputLabel>
                      <Select
                        value={editForm.category}
                        label=""
                        displayEmpty
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                        MenuProps={{
                          disablePortal: false,
                          disableScrollLock: true,
                          PaperProps: {
                            sx: {
                              maxHeight: 300,
                              zIndex: 10001,
                              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                              borderRadius: '12px',
                              mt: 1,
                              position: 'absolute',
                              overflow: 'visible'
                            }
                          },
                          anchorOrigin: {
                            vertical: 'bottom',
                            horizontal: 'left',
                          },
                          transformOrigin: {
                            vertical: 'top',
                            horizontal: 'left',
                          },
                          style: {
                            zIndex: 10001
                          }
                        }}
                        sx={{
                          borderRadius: '12px',
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#1976d2',
                            borderWidth: '2px'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#1976d2',
                            borderWidth: '2px'
                          }
                        }}
                      >
                        <MenuItem value="Academic">📚 Academic</MenuItem>
                        <MenuItem value="Administration">🏢 Administration</MenuItem>
                        <MenuItem value="Infrastructure">🏗️ Infrastructure</MenuItem>
                        <MenuItem value="Library">📖 Library</MenuItem>
                        <MenuItem value="Hostel">🏠 Hostel</MenuItem>
                        <MenuItem value="Cafeteria">🍽️ Cafeteria</MenuItem>
                        <MenuItem value="Transport">🚌 Transport</MenuItem>
                        <MenuItem value="Faculty">👨‍🏫 Faculty</MenuItem>
                        <MenuItem value="Examination">📝 Examination</MenuItem>
                        <MenuItem value="Fee">💰 Fee</MenuItem>
                        <MenuItem value="Other">📋 Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: '500', color: 'text.secondary' }}>
                      Priority *
                    </Typography>
                    <FormControl fullWidth>
                      <InputLabel sx={{ display: 'none' }}>Priority *</InputLabel>
                      <Select
                        value={editForm.priority}
                        label=""
                        displayEmpty
                        onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                        MenuProps={{
                          disablePortal: false,
                          disableScrollLock: true,
                          PaperProps: {
                            sx: {
                              maxHeight: 300,
                              zIndex: 10001,
                              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                              borderRadius: '12px',
                              mt: 1,
                              position: 'absolute',
                              overflow: 'visible'
                            }
                          },
                          anchorOrigin: {
                            vertical: 'bottom',
                            horizontal: 'left',
                          },
                          transformOrigin: {
                            vertical: 'top',
                            horizontal: 'left',
                          },
                          style: {
                            zIndex: 10001
                          }
                        }}
                        sx={{
                          borderRadius: '12px',
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#1976d2',
                            borderWidth: '2px'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#1976d2',
                            borderWidth: '2px'
                          }
                        }}
                      >
                        <MenuItem value="Low">🟢 Low - Can wait</MenuItem>
                        <MenuItem value="Medium">🟡 Medium - Normal priority</MenuItem>
                        <MenuItem value="High">🟠 High - Important</MenuItem>
                        <MenuItem value="Urgent">🔴 Urgent - Immediate attention</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>

                {/* Description Field */}
                <Grid item xs={12}>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: '500', color: 'text.secondary' }}>
                      Detailed Description *
                    </Typography>
                    <TextField
                      fullWidth
                      required
                      label=""
                      multiline
                      rows={5}
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      placeholder="Please describe your issue in detail..."
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
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
                    />
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions sx={{
            p: 3,
            pt: 2,
            borderTop: '1px solid rgba(0, 0, 0, 0.1)',
            flexShrink: 0
          }}>
            <Button
              onClick={handleEditClose}
              variant="outlined"
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: '600',
                px: 3
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditSubmit}
              variant="contained"
              disabled={updating}
              startIcon={updating ? <CircularProgress size={20} color="inherit" /> : <Send />}
              sx={{
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: '600',
                px: 4,
                '&:hover': {
                  background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)'
                }
              }}
            >
              {updating ? 'Updating...' : 'Update Complaint'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Image View Dialog */}
        <Dialog
          open={imageViewDialogOpen}
          onClose={() => setImageViewDialogOpen(false)}
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: '16px',
              overflow: 'hidden',
              maxWidth: '600px',
              width: '90%'
            }
          }}
        >
          <DialogTitle sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pb: 2,
            borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
              Profile Picture
            </Typography>
            <IconButton
              onClick={() => setImageViewDialogOpen(false)}
              size="small"
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.05)'
                }
              }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{
            padding: { xs: '24px', sm: '32px', md: '40px' },
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5',
            minHeight: { xs: '350px', sm: '400px', md: '450px' },
            maxHeight: '70vh',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            {(student.profilePicture || previewImage) ? (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: isDarkMode ? '0 8px 32px rgba(0, 0, 0, 0.5)' : '0 8px 32px rgba(0, 0, 0, 0.2)',
                  backgroundColor: theme.palette.background.paper,
                  padding: { xs: '24px', sm: '32px', md: '40px' },
                  boxSizing: 'border-box'
                }}
              >
                <img
                  src={previewImage || student.profilePicture}
                  alt="Profile Picture Full View"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    display: 'block'
                  }}
                  onError={(e) => {
                    console.error('Error loading profile picture:', student.profilePicture);
                  }}
                />
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Person sx={{ fontSize: 80, color: '#1976d2', opacity: 0.3, mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No profile picture available
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{
            p: 2,
            pt: 1,
            borderTop: '1px solid rgba(0, 0, 0, 0.1)',
            justifyContent: 'center'
          }}>
            <Button
              onClick={() => setImageViewDialogOpen(false)}
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: '600',
                px: 4
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  )
}
