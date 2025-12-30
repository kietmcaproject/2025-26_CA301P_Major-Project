import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../../auth/AuthContext.jsx'
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext.jsx'
import api from '../../lib/api.js'
import AdminNavbar from '../../components/AdminNavbar.jsx'
import axios from 'axios'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Avatar,
  Divider,
  Tooltip,
  CircularProgress,
  Grid,
  Paper
} from '@mui/material'
import {
  Assignment,
  CheckCircle,
  Visibility,
  Done,
  Refresh,
  School,
  CalendarToday,
  Category,
  PriorityHigh,
  Person,
  PictureAsPdf,
  Image as ImageIcon,
  InsertDriveFile,
  AttachFile,
  ZoomIn,
  Close,
  Download,
  OpenInNew
} from '@mui/icons-material'

export default function ExternalDepartmentDashboard() {
  const { user } = useAuth()
  const { isDarkMode } = useCustomTheme()

  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [acknowledgeDialogOpen, setAcknowledgeDialogOpen] = useState(false)
  const [acknowledgementComment, setAcknowledgementComment] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false)
  const [previewImageUrl, setPreviewImageUrl] = useState('')
  const [previewImageName, setPreviewImageName] = useState('')
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false)
  const [previewPdfUrl, setPreviewPdfUrl] = useState('')
  const [previewPdfName, setPreviewPdfName] = useState('')
  const [pdfBlobUrl, setPdfBlobUrl] = useState('')
  const [pdfLoading, setPdfLoading] = useState(true)

  // Helper function to get proxied image URL
  const getImageProxyUrl = (imageUrl) => {
    if (!imageUrl) return '';
    if (imageUrl.includes('cloudinary.com')) {
      return `/api/complaints/attachments/image?url=${encodeURIComponent(imageUrl)}`;
    }
    return imageUrl;
  }

  // Helper function to get proxied PDF URL
  const getPdfProxyUrl = (pdfUrl) => {
    if (!pdfUrl) {
      console.warn('[ExternalDepartmentDashboard] No PDF URL provided');
      return '';
    }

    // Check if it's already a full Cloudinary URL
    if (pdfUrl.includes('cloudinary.com')) {
      const proxyUrl = `/api/complaints/attachments/pdf?url=${encodeURIComponent(pdfUrl)}`;
      console.log('[ExternalDepartmentDashboard] Using Cloudinary PDF URL:', { original: pdfUrl, proxy: proxyUrl });
      return proxyUrl;
    }

    // Check if it's a relative URL or just a filename - this is the problem!
    if (pdfUrl.startsWith('/') || !pdfUrl.startsWith('http')) {
      console.error('[ExternalDepartmentDashboard] ERROR: Invalid PDF URL format:', pdfUrl);
      console.error('[ExternalDepartmentDashboard] Expected full Cloudinary URL. Attachment path from DB:', pdfUrl);
      return '';
    }

    return pdfUrl;
  }

  // Cleanup blob URL when component unmounts
  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, []);

  // Request cancellation ref
  const cancelTokenRef = useRef(null)

  // Get department name based on role and department field
  const getDepartmentName = () => {
    // Check for external department roles
    const externalRoles = ['accounts', 'librarian', 'maintenance', 'external']
    if (externalRoles.includes(user?.role) && user?.department) {
      // Capitalize first letter
      return user.department.charAt(0).toUpperCase() + user.department.slice(1)
    }
    // Fallback to user department if available
    if (user?.department) {
      return user.department.charAt(0).toUpperCase() + user.department.slice(1)
    }
    // Default fallback
    return 'Accounts'
  }

  const departmentName = getDepartmentName()

  // Fetch complaints forwarded to this external department
  const fetchComplaints = useCallback(async () => {
    // Cancel previous request if exists
    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancel('New request initiated')
    }

    cancelTokenRef.current = axios.CancelToken.source()

    try {
      setLoading(true)
      setError('')

      // Validate user and department before making request
      if (!user || !user.department) {
        setError('User department information is missing. Please log out and log in again.')
        setLoading(false)
        return
      }

      const { data } = await api.get('/api/complaints', {
        params: {
          limit: 1000 // Get all complaints forwarded to this external department
        },
        cancelToken: cancelTokenRef.current.token
      })

      // Backend now filters by externalForward.forwardedTo, so we just need to apply status filter
      const allComplaints = data.complaints || []

      // Apply status filter
      const filtered = filterStatus === 'all'
        ? allComplaints
        : filterStatus.toLowerCase() === 'resolved'
          ? allComplaints.filter(c =>
            c.status.toLowerCase() === 'resolved' || c.externalForward?.acknowledged === true
          )
          : allComplaints.filter(c =>
            c.status.toLowerCase() === filterStatus.toLowerCase()
          )

      setComplaints(filtered)
    } catch (err) {
      if (axios.isCancel(err)) {
        return // Ignore cancelled requests
      }
      console.error('Error fetching complaints:', err)
      console.error('User object:', user)
      console.error('Department name:', departmentName)
      if (err.__CACHED__) {
        const allComplaints = err.data?.complaints || []
        // Backend now filters by externalForward.forwardedTo, so we just need to apply status filter
        const filtered = filterStatus === 'all'
          ? allComplaints
          : filterStatus.toLowerCase() === 'resolved'
            ? allComplaints.filter(c =>
              c.status.toLowerCase() === 'resolved' || c.externalForward?.acknowledged === true
            )
            : allComplaints.filter(c =>
              c.status.toLowerCase() === filterStatus.toLowerCase()
            )
        setComplaints(filtered)
        setLoading(false)
        return
      }
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch complaints'
      setError(errorMessage)
      console.error('Error fetching complaints:', err)
      console.error('Error response:', err.response?.data)
    } finally {
      setLoading(false)
    }
  }, [filterStatus])

  useEffect(() => {
    if (user && user.department) {
      fetchComplaints()
    } else if (user && !user.department) {
      setError('User department not found. Please contact administrator.')
      setLoading(false)
    }

    // Cleanup: cancel pending requests on unmount
    return () => {
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel('Component unmounted')
      }
    }
  }, [user, fetchComplaints])

  // Handle acknowledging complaint
  const handleAcknowledge = async () => {
    if (!selectedComplaint) return

    try {
      await api.put(`/api/complaints/${selectedComplaint._id}/acknowledge-external`, {
        acknowledgementComment: acknowledgementComment.trim() || undefined
      })
      setAcknowledgeDialogOpen(false)
      setSelectedComplaint(null)
      setAcknowledgementComment('')
      fetchComplaints()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to acknowledge complaint')
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'warning'
      case 'in progress':
        return 'info'
      case 'resolved':
        return 'success'
      case 'rejected':
        return 'error'
      case 'closed':
        return 'default'
      default:
        return 'default'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return 'error'
      case 'high':
        return 'warning'
      case 'medium':
        return 'info'
      case 'low':
        return 'default'
      default:
        return 'default'
    }
  }

  // Get statistics
  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status.toLowerCase() === 'pending').length,
    inProgress: complaints.filter(c =>
      c.status.toLowerCase() === 'in progress' &&
      c.externalForward?.acknowledged !== true
    ).length,
    resolved: complaints.filter(c =>
      c.status.toLowerCase() === 'resolved' || c.externalForward?.acknowledged === true
    ).length
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: isDarkMode ? '#121212' : '#f5f5f5' }}>
      <AdminNavbar />
      <Container maxWidth="xl" sx={{ py: 2, pt: 2, px: { xs: 1, sm: 2, md: 3 } }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, fontSize: { xs: '1.3rem', sm: '1.75rem', md: '2.125rem' } }}>
            {departmentName} Dashboard
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Statistics Cards */}
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={6} md={4}>
            <Card sx={{
              borderRadius: { xs: '12px', md: '16px' },
              boxShadow: isDarkMode
                ? '0 4px 20px rgba(0, 0, 0, 0.4)'
                : '0 4px 12px rgba(0, 0, 0, 0.1)',
              bgcolor: isDarkMode ? 'rgba(30, 41, 59, 0.8)' : '#ffffff',
              border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : 'none',
              transition: 'all 0.3s ease',
              minHeight: { xs: '140px', sm: '160px', md: '180px' },
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: isDarkMode
                  ? '0 8px 30px rgba(25, 118, 210, 0.3)'
                  : '0 8px 25px rgba(0, 0, 0, 0.15)'
              }
            }}>
              <CardContent sx={{ textAlign: 'center', p: { xs: 2, sm: 2.5 } }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: isDarkMode ? '#60a5fa' : 'primary.main', fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' } }}>
                  {stats.total}
                </Typography>
                <Typography variant="body2" sx={{ color: isDarkMode ? '#94a3b8' : 'text.secondary', fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600 }}>
                  Total Complaints
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={6} md={4}>
            <Card sx={{
              borderRadius: { xs: '12px', md: '16px' },
              boxShadow: isDarkMode
                ? '0 4px 20px rgba(0, 0, 0, 0.4)'
                : '0 4px 12px rgba(0, 0, 0, 0.1)',
              bgcolor: isDarkMode ? 'rgba(30, 41, 59, 0.8)' : '#ffffff',
              border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : 'none',
              transition: 'all 0.3s ease',
              minHeight: { xs: '140px', sm: '160px', md: '180px' },
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: isDarkMode
                  ? '0 8px 30px rgba(0, 172, 193, 0.3)'
                  : '0 8px 25px rgba(0, 0, 0, 0.15)'
              }
            }}>
              <CardContent sx={{ textAlign: 'center', p: { xs: 2, sm: 2.5 } }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: isDarkMode ? '#22d3d1' : 'info.main', fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' } }}>
                  {stats.inProgress}
                </Typography>
                <Typography variant="body2" sx={{ color: isDarkMode ? '#94a3b8' : 'text.secondary', fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600 }}>
                  In Progress
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={6} md={4}>
            <Card sx={{
              borderRadius: { xs: '12px', md: '16px' },
              boxShadow: isDarkMode
                ? '0 4px 20px rgba(0, 0, 0, 0.4)'
                : '0 4px 12px rgba(0, 0, 0, 0.1)',
              bgcolor: isDarkMode ? 'rgba(30, 41, 59, 0.8)' : '#ffffff',
              border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : 'none',
              transition: 'all 0.3s ease',
              minHeight: { xs: '140px', sm: '160px', md: '180px' },
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: isDarkMode
                  ? '0 8px 30px rgba(34, 197, 94, 0.3)'
                  : '0 8px 25px rgba(0, 0, 0, 0.15)'
              }
            }}>
              <CardContent sx={{ textAlign: 'center', p: { xs: 2, sm: 2.5 } }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: isDarkMode ? '#22c55e' : 'success.main', fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' } }}>
                  {stats.resolved}
                </Typography>
                <Typography variant="body2" sx={{ color: isDarkMode ? '#94a3b8' : 'text.secondary', fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600 }}>
                  Resolved
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filter and Refresh */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant={filterStatus === 'all' ? 'contained' : 'outlined'}
              onClick={() => setFilterStatus('all')}
              size="small"
              sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}
            >
              All
            </Button>
            <Button
              variant={filterStatus === 'pending' ? 'contained' : 'outlined'}
              onClick={() => setFilterStatus('pending')}
              size="small"
              sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}
            >
              Pending
            </Button>
            <Button
              variant={filterStatus === 'in progress' ? 'contained' : 'outlined'}
              onClick={() => setFilterStatus('in progress')}
              size="small"
              sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}
            >
              In Progress
            </Button>
            <Button
              variant={filterStatus === 'resolved' ? 'contained' : 'outlined'}
              onClick={() => setFilterStatus('resolved')}
              size="small"
              sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}
            >
              Resolved
            </Button>
          </Box>
          <IconButton onClick={fetchComplaints} disabled={loading}>
            <Refresh />
          </IconButton>
        </Box>

        {/* Complaints List */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : complaints.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <Assignment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No complaints found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {filterStatus === 'all'
                  ? 'No complaints have been forwarded to you yet.'
                  : `No ${filterStatus} complaints found.`}
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent sx={{ p: 0 }}>
              <List>
                {complaints.map((complaint, index) => (
                  <React.Fragment key={complaint._id}>
                    <ListItem sx={{
                      py: { xs: 2, sm: 3 },
                      px: { xs: 1.5, sm: 3 },
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: 'flex-start',
                      position: 'relative'
                    }}>
                      <ListItemIcon sx={{ minWidth: { xs: 36, sm: 48 }, display: { xs: 'none', sm: 'flex' } }}>
                        <Avatar sx={{ bgcolor: complaint.externalForward?.acknowledged ? 'success.light' : 'warning.light' }}>
                          {complaint.externalForward?.acknowledged ? <CheckCircle /> : <Assignment />}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                            {complaint.title}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                              {complaint.description}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                              <Chip
                                label={complaint.status}
                                color={getStatusColor(complaint.status)}
                                size="small"
                              />
                              <Chip
                                label={complaint.priority}
                                color={getPriorityColor(complaint.priority)}
                                size="small"
                                variant="outlined"
                              />
                              <Chip
                                label={complaint.category}
                                size="small"
                                variant="outlined"
                              />
                              {complaint.externalForward?.acknowledged && (
                                <Chip
                                  icon={<CheckCircle />}
                                  label="Acknowledged"
                                  color="success"
                                  size="small"
                                />
                              )}
                              <Typography variant="caption" color="text.secondary">
                                Forwarded: {new Date(complaint.externalForward?.forwardedAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction sx={{
                        position: { xs: 'relative', sm: 'absolute' },
                        right: { xs: 0, sm: 16 },
                        top: { xs: 'auto', sm: '50%' },
                        transform: { xs: 'none', sm: 'translateY(-50%)' },
                        mt: { xs: 2, sm: 0 },
                        width: { xs: '100%', sm: 'auto' }
                      }}>
                        <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1 }, flexWrap: 'wrap', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                          <Tooltip title="View Details">
                            <IconButton
                              onClick={() => {
                                setSelectedComplaint(complaint)
                                setViewDialogOpen(true)
                              }}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          {!complaint.externalForward?.acknowledged && (
                            <Tooltip title="Acknowledge Complaint">
                              <IconButton
                                onClick={() => {
                                  setSelectedComplaint(complaint)
                                  setAcknowledgeDialogOpen(true)
                                }}
                                sx={{ color: 'success.main' }}
                              >
                                <Done />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < complaints.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        )}

        {/* View Complaint Dialog */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              maxHeight: '90vh'
            }
          }}
        >
          <DialogTitle sx={{ pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Assignment color="primary" />
              Complaint Details
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ pt: 3, pb: 2 }}>
            {selectedComplaint && (
              <Box>
                {/* Title Section */}
                <Box sx={{ mt: 2, mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 2 }}>
                    {selectedComplaint.title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, fontSize: '1rem' }}>
                    {selectedComplaint.description}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Complaint Details Grid */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2.5, color: 'text.primary', fontSize: '1.1rem' }}>
                    Complaint Information
                  </Typography>
                  <Grid container spacing={2.5}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 500 }}>
                          Status
                        </Typography>
                        <Chip label={selectedComplaint.status} color={getStatusColor(selectedComplaint.status)} size="small" />
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 500 }}>
                          Priority
                        </Typography>
                        <Chip label={selectedComplaint.priority} color={getPriorityColor(selectedComplaint.priority)} size="small" />
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 500 }}>
                          Category
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {selectedComplaint.category}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 500 }}>
                          Department
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {selectedComplaint.department}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                {/* Attachments Section */}
                {selectedComplaint.attachments && selectedComplaint.attachments.length > 0 && (
                  <>
                    <Divider sx={{ my: 2.5 }} />
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2.5, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1, fontSize: '1.1rem' }}>
                        <AttachFile fontSize="small" />
                        Attachments ({selectedComplaint.attachments.length})
                      </Typography>
                      <Grid container spacing={2.5}>
                        {selectedComplaint.attachments.map((attachment, index) => {
                          const isImage = attachment.path && /\.(jpg|jpeg|png|gif|webp)$/i.test(attachment.path);
                          const isPDF = attachment.path && /\.pdf$/i.test(attachment.path);
                          const fileName = attachment.originalName || attachment.filename || `attachment-${index + 1}`;

                          return (
                            <Grid item xs={12} sm={6} key={index}>
                              <Paper
                                elevation={2}
                                sx={{
                                  p: 2,
                                  borderRadius: 2,
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: 1,
                                  '&:hover': {
                                    boxShadow: 4
                                  }
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                  {isPDF ? (
                                    <PictureAsPdf sx={{ color: '#d32f2f', fontSize: 32 }} />
                                  ) : isImage ? (
                                    <ImageIcon sx={{ color: '#1976d2', fontSize: 32 }} />
                                  ) : (
                                    <InsertDriveFile sx={{ color: '#666', fontSize: 32 }} />
                                  )}
                                  <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {fileName}
                                    </Typography>
                                    {attachment.size && (
                                      <Typography variant="caption" color="text.secondary">
                                        {(attachment.size / 1024 / 1024).toFixed(2)} MB
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>

                                {isImage && attachment.path && (
                                  <Box
                                    sx={{
                                      width: '100%',
                                      height: 60,
                                      borderRadius: 1,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      border: '1px solid',
                                      borderColor: 'divider',
                                      backgroundColor: 'rgba(25, 118, 210, 0.08)'
                                    }}
                                  >
                                    <ImageIcon sx={{ color: '#1976d2', fontSize: 32 }} />
                                  </Box>
                                )}

                                {attachment.path && (
                                  <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                                    <Button
                                      size="small"
                                      variant={isImage ? "outlined" : "contained"}
                                      color={isImage ? "primary" : "primary"}
                                      startIcon={<Download />}
                                      onClick={() => {
                                        if (isPDF) {
                                          // For PDFs, use proxy URL
                                          const proxyUrl = getPdfProxyUrl(attachment.path);
                                          window.open(proxyUrl || attachment.path, '_blank');
                                        } else {
                                          // For other files, open directly
                                          window.open(attachment.path, '_blank');
                                        }
                                      }}
                                      fullWidth={!isImage}
                                      sx={isImage ? { flex: 1 } : {}}
                                    >
                                      {isImage ? 'Download' : isPDF ? 'Download PDF' : 'Download'}
                                    </Button>
                                  </Box>
                                )}
                              </Paper>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Box>
                  </>
                )}

                {/* External Forward Information */}
                {selectedComplaint.externalForward?.isForwarded && (
                  <>
                    <Divider sx={{ my: 3 }} />
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                        Forward Information
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 500 }}>
                              Forwarded To
                            </Typography>
                            <Chip label={selectedComplaint.externalForward.forwardedTo} color="info" size="small" />
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                              Forwarded on: {new Date(selectedComplaint.externalForward.forwardedAt).toLocaleString()}
                            </Typography>
                            {selectedComplaint.externalForward.forwardReason && (
                              <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic', color: 'info.main' }}>
                                Reason: {selectedComplaint.externalForward.forwardReason}
                              </Typography>
                            )}
                          </Box>
                        </Grid>
                        {selectedComplaint.externalForward?.acknowledged && (
                          <Grid item xs={12}>
                            <Box sx={{ mb: 2 }}>
                              <Chip
                                icon={<CheckCircle />}
                                label={`Acknowledged by ${selectedComplaint.externalForward.forwardedTo}`}
                                color="success"
                                size="small"
                                sx={{ mb: 1 }}
                              />
                              {selectedComplaint.externalForward.acknowledgementComment && (
                                <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic', color: 'success.main' }}>
                                  Acknowledgement: {selectedComplaint.externalForward.acknowledgementComment}
                                </Typography>
                              )}
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                Acknowledged on: {new Date(selectedComplaint.externalForward.acknowledgedAt).toLocaleString()}
                              </Typography>
                            </Box>
                          </Grid>
                        )}
                      </Grid>
                    </Box>
                  </>
                )}

                {/* Student Information */}
                {selectedComplaint.student && (
                  <>
                    <Divider sx={{ my: 2.5 }} />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2.5, color: 'text.primary', fontSize: '1.1rem' }}>
                        Student Information
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 500 }}>
                          Name
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {selectedComplaint.student.firstName} {selectedComplaint.student.lastName}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 500 }}>
                          Email
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {selectedComplaint.student.email}
                        </Typography>
                      </Box>
                    </Box>
                  </>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Image Preview Dialog */}
        <Dialog
          open={imagePreviewOpen}
          onClose={() => setImagePreviewOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '16px',
              overflow: 'hidden'
            }
          }}
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {previewImageName}
            </Typography>
            <IconButton onClick={() => setImagePreviewOpen(false)}>
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            {previewImageUrl && (
              <img
                src={getImageProxyUrl(previewImageUrl)}
                alt={previewImageName}
                style={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain'
                }}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => window.open(previewImageUrl, '_blank')} startIcon={<Download />}>
              Download
            </Button>
            <Button onClick={() => setImagePreviewOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* PDF Preview Dialog */}
        <Dialog
          open={pdfPreviewOpen}
          onClose={() => setPdfPreviewOpen(false)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '16px',
              overflow: 'hidden',
              maxHeight: '90vh'
            }
          }}
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
              <PictureAsPdf sx={{ color: '#d32f2f' }} />
              {previewPdfName}
            </Typography>
            <IconButton onClick={() => setPdfPreviewOpen(false)}>
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 500 }}>
            {previewPdfUrl ? (
              <Box sx={{ width: '100%', height: '75vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <iframe
                  src={`${getPdfProxyUrl(previewPdfUrl)}#toolbar=1`}
                  title={previewPdfName}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    flex: 1
                  }}
                  onLoad={() => {
                    setPdfLoading(false);
                  }}
                  onError={(e) => {
                    console.error('Error loading PDF in iframe:', e);
                    setPdfLoading(false);
                  }}
                />
                {pdfLoading && (
                  <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2
                  }}>
                    <CircularProgress />
                    <Typography variant="body1" color="text.secondary">
                      Loading PDF...
                    </Typography>
                  </Box>
                )}
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 8 }}>
                <Typography variant="body1" color="error">
                  Unable to load PDF. Please try downloading it instead.
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={async () => {
                try {
                  if (previewPdfUrl) {
                    setPdfLoading(true);
                    // Fetch through proxy and download
                    const response = await api.get('/api/complaints/attachments/pdf', {
                      params: { url: previewPdfUrl },
                      responseType: 'blob'
                    });
                    const blob = new Blob([response.data], { type: 'application/pdf' });
                    const blobUrl = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = blobUrl;
                    link.download = previewPdfName;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(blobUrl);
                    setPdfLoading(false);
                  }
                } catch (error) {
                  console.error('Error downloading PDF:', error);
                  setPdfLoading(false);
                  // Fallback to opening proxy URL in new tab
                  if (previewPdfUrl) {
                    window.open(getPdfProxyUrl(previewPdfUrl), '_blank');
                  }
                }
              }}
              startIcon={<Download />}
              disabled={!previewPdfUrl || pdfLoading}
            >
              Download
            </Button>
            <Button
              onClick={() => {
                if (previewPdfUrl) {
                  window.open(getPdfProxyUrl(previewPdfUrl), '_blank');
                }
              }}
              startIcon={<OpenInNew />}
              disabled={!previewPdfUrl}
            >
              Open in New Tab
            </Button>
            <Button onClick={() => setPdfPreviewOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Acknowledge Complaint Dialog */}
        <Dialog open={acknowledgeDialogOpen} onClose={() => setAcknowledgeDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Acknowledge Complaint</DialogTitle>
          <DialogContent>
            {selectedComplaint && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Complaint:</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {selectedComplaint.title}
                </Typography>
              </Box>
            )}
            <TextField
              fullWidth
              multiline
              rows={4}
              value={acknowledgementComment}
              onChange={(e) => setAcknowledgementComment(e.target.value)}
              placeholder="Optional: Add an acknowledgement comment..."
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setAcknowledgeDialogOpen(false)
              setAcknowledgementComment('')
            }}>Cancel</Button>
            <Button onClick={handleAcknowledge} variant="contained" color="success">
              Submit Acknowledgement
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  )
}

