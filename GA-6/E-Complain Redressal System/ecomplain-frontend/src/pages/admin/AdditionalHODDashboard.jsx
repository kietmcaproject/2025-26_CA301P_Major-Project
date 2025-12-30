import React, { useState, useEffect } from 'react'
import { useAuth } from '../../auth/AuthContext.jsx'
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext.jsx'
import api from '../../lib/api.js'
import AdminNavbar from '../../components/AdminNavbar.jsx'
import * as XLSX from 'xlsx'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Tabs,
  Tab,
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
  Paper,
  Badge,
  Tooltip,
  Menu,
  MenuItem,
  CircularProgress
} from '@mui/material'
import {
  Assignment,
  TrendingUp,
  CheckCircle,
  Pending,
  Cancel,
  Add,
  Visibility,
  Comment,
  Forward,
  Person,
  Email,
  School,
  CalendarToday,
  Category,
  PriorityHigh,
  Description,
  FilterList,
  MoreVert,
  Refresh,
  Download,
  Delete,
  PictureAsPdf,
  Image as ImageIcon,
  InsertDriveFile,
  AttachFile,
  ZoomIn,
  Close,
  OpenInNew
} from '@mui/icons-material'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

export default function AdditionalHODDashboard() {
  const { user, setUser } = useAuth()
  const { isDarkMode } = useCustomTheme()

  const [activeTab, setActiveTab] = useState(0)
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [commentDialogOpen, setCommentDialogOpen] = useState(false)
  const [forwardDialogOpen, setForwardDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [comment, setComment] = useState('')
  const [forwardReason, setForwardReason] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [anchorEl, setAnchorEl] = useState(null)
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
      console.warn('[AdditionalHODDashboard] No PDF URL provided');
      return '';
    }

    // Check if it's already a full Cloudinary URL
    if (pdfUrl.includes('cloudinary.com')) {
      const proxyUrl = `/api/complaints/attachments/pdf?url=${encodeURIComponent(pdfUrl)}`;
      console.log('[AdditionalHODDashboard] Using Cloudinary PDF URL:', { original: pdfUrl, proxy: proxyUrl });
      return proxyUrl;
    }

    // Check if it's a relative URL or just a filename - this is the problem!
    if (pdfUrl.startsWith('/') || !pdfUrl.startsWith('http')) {
      console.error('[AdditionalHODDashboard] ERROR: Invalid PDF URL format:', pdfUrl);
      console.error('[AdditionalHODDashboard] Expected full Cloudinary URL. Attachment path from DB:', pdfUrl);
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

  // Fetch complaints assigned to this additional HOD (includes escalated ones)
  const fetchComplaints = async (statusFilter = 'all') => {
    try {
      setLoading(true)
      setError('') // Clear any previous errors

      const userId = user._id || user.id
      const statusParam = statusFilter === 'all' ? undefined :
        statusFilter === 'pending' ? 'Pending' :
          statusFilter === 'in progress' ? 'In Progress' :
            statusFilter === 'resolved' ? 'Resolved' :
              statusFilter === 'rejected' ? 'Rejected' :
                statusFilter === 'closed' ? 'Closed' : statusFilter

      // Fetch complaints currently assigned to additional HOD
      const { data: assignedData } = await api.get('/api/complaints', {
        params: {
          department: user.department,
          assignedTo: userId,
          status: statusParam,
          limit: 100
        }
      })

      // Fetch complaints originally assigned to this additional HOD (escalated ones)
      const { data: additionalHodAssignedData } = await api.get('/api/complaints', {
        params: {
          department: user.department,
          additionalHodAssigned: userId,
          status: statusParam,
          limit: 100
        }
      })

      // Merge and remove duplicates
      const assignedComplaints = assignedData.complaints || []
      const additionalHodComplaints = additionalHodAssignedData.complaints || []
      const complaintMap = new Map()

      assignedComplaints.forEach(c => complaintMap.set(c._id, c))
      additionalHodComplaints.forEach(c => {
        if (!complaintMap.has(c._id)) complaintMap.set(c._id, c)
      })

      setComplaints(Array.from(complaintMap.values()))
    } catch (err) {
      if (err.__CACHED__) {
        setComplaints(err.data?.complaints || [])
        return
      }
      console.error('Error fetching complaints:', err)

      if (err.response?.status === 401) {
        setError('Authentication failed. Please login again.')
      } else if (err.response?.status === 403) {
        setError('Access denied. You do not have permission to view these complaints.')
      } else if (err.response?.status === 404) {
        setError('No complaints found assigned to you.')
      } else if (err.code === 'NETWORK_ERROR' || !err.response) {
        setError('Network error. Please check your connection and try again.')
      } else {
        setError(`Failed to fetch complaints: ${err.response?.data?.message || err.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  // Fetch all complaints for analytics and completed tabs
  const fetchAllComplaints = async () => {
    try {
      setLoading(true)
      setError('')

      const userId = user._id || user.id

      // Fetch complaints currently assigned to additional HOD
      const { data: assignedData } = await api.get('/api/complaints', {
        params: {
          department: user.department,
          assignedTo: userId,
          limit: 100
        }
      })

      // Fetch resolved complaints that were originally assigned to this additional HOD
      // (even if they were resolved at dean level)
      const { data: additionalHodAssignedData } = await api.get('/api/complaints', {
        params: {
          department: user.department,
          additionalHodAssigned: userId,
          status: 'Resolved',
          limit: 100
        }
      })

      // Merge the two lists and remove duplicates
      const assignedComplaints = assignedData.complaints || []
      const additionalHodResolvedComplaints = additionalHodAssignedData.complaints || []

      // Create a map to avoid duplicates
      const complaintMap = new Map()

      // Add currently assigned complaints
      assignedComplaints.forEach(complaint => {
        complaintMap.set(complaint._id, complaint)
      })

      // Add resolved complaints originally assigned to additional HOD
      additionalHodResolvedComplaints.forEach(complaint => {
        if (!complaintMap.has(complaint._id)) {
          complaintMap.set(complaint._id, complaint)
        }
      })

      // Convert map back to array
      setComplaints(Array.from(complaintMap.values()))
    } catch (err) {
      console.error('Error fetching all complaints:', err)
      setError(`Failed to fetch complaints: ${err.response?.data?.message || err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)

    if (newValue === 0) {
      // Assigned Complaints tab - fetch with current filter
      fetchComplaints(filterStatus)
    } else if (newValue === 1) {
      // Completed tab - fetch all complaints to show resolved ones
      fetchAllComplaints()
    } else if (newValue === 2) {
      // Analytics tab - fetch all complaints for statistics
      fetchAllComplaints()
    }
  }

  useEffect(() => {
    if (user && (user._id || user.id)) {
      // Only fetch on initial load or when filter changes in tab 0
      if (activeTab === 0) {
        fetchComplaints(filterStatus)
      }
    } else {
      setError('User information not available. Please login again.')

      // Try to fetch user profile from backend
      const fetchUserProfile = async () => {
        try {
          const { data } = await api.get('/api/auth/me')
          if (data.success && data.user) {
            setUser(data.user)
          }
        } catch (err) {
          console.error('Failed to fetch user profile:', err)
        }
      }

      fetchUserProfile()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id, user?.id, filterStatus, activeTab])

  // Handle complaint status update
  const handleStatusUpdate = async (complaintId, newStatus) => {
    try {
      await api.put(`/api/complaints/${complaintId}`, {
        status: newStatus
      })
      // Refresh the appropriate data based on current tab
      if (activeTab === 0) {
        fetchComplaints(filterStatus)
      } else {
        fetchAllComplaints()
      }
    } catch (err) {
      console.error('Status update error:', err)
      setError('Failed to update complaint status: ' + (err.response?.data?.message || err.message))
    }
  }

  // Handle adding comment
  const handleAddComment = async () => {
    if (!comment.trim()) return

    // Prevent operations on rejected complaints
    if (selectedComplaint?.status?.toLowerCase() === 'rejected') {
      setError('Cannot add comments to rejected complaints')
      return
    }

    // Prevent operations on forwarded complaints
    const isForwarded = selectedComplaint?.workflow?.currentLevel === 'dean';
    if (isForwarded) {
      setError('Cannot add comments to forwarded complaints')
      return
    }

    try {
      await api.post(`/api/complaints/${selectedComplaint._id}/comments`, {
        comment: comment.trim(),
        isInternal: true // Additional HOD comments are internal
      })
      setComment('')
      setCommentDialogOpen(false)
      fetchComplaints()
    } catch (err) {
      console.error('Comment error:', err)
      setError('Failed to add comment: ' + (err.response?.data?.message || err.message))
    }
  }

  // Handle forwarding to Dean (escalation)
  const handleForward = async () => {
    // Prevent operations on rejected complaints
    if (selectedComplaint?.status?.toLowerCase() === 'rejected') {
      setError('Cannot forward rejected complaints')
      return
    }

    // Prevent operations on forwarded complaints
    const isForwarded = selectedComplaint?.workflow?.currentLevel === 'dean';
    if (isForwarded) {
      setError('Cannot forward already forwarded complaints')
      return
    }

    if (!forwardReason.trim()) {
      setError('Please provide a reason for forwarding the complaint')
      return
    }

    // Validate escalation reason length (minimum 10 characters as per backend)
    if (forwardReason.trim().length < 10) {
      setError('Escalation reason must be at least 10 characters long')
      return
    }

    try {
      console.log('[AdditionalHODDashboard] Escalating complaint:', {
        complaintId: selectedComplaint._id,
        escalationReason: forwardReason.trim()
      })

      // Use the dedicated escalate endpoint
      const response = await api.put(`/api/complaints/${selectedComplaint._id}/escalate`, {
        escalationReason: forwardReason.trim()
      })

      console.log('[AdditionalHODDashboard] Complaint escalated successfully:', response.data)

      setForwardReason('')
      setForwardDialogOpen(false)
      setError('') // Clear any previous errors

      // Refresh complaints list
      await fetchComplaints()

      // Show success message
      if (response.data?.message) {
        // You can add a toast notification here if you have one
        console.log('Success:', response.data.message)
      }
    } catch (err) {
      console.error('[AdditionalHODDashboard] Forward error:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Failed to forward complaint'
      setError(errorMessage)

      // Keep dialog open on error so user can fix and retry
      // setForwardDialogOpen(false) // Don't close on error
    }
  }

  // Handle deleting complaint
  const handleDelete = async () => {
    if (!selectedComplaint) return

    try {
      await api.delete(`/api/complaints/${selectedComplaint._id}`)
      setDeleteDialogOpen(false)
      setSelectedComplaint(null)
      if (activeTab === 0) {
        fetchComplaints(filterStatus)
      } else {
        fetchAllComplaints()
      }
      setError('')
    } catch (err) {
      console.error('Delete error:', err)
      setError('Failed to delete complaint: ' + (err.response?.data?.message || err.message))
      setDeleteDialogOpen(false)
    }
  }

  // Handle Excel export
  const handleExportToExcel = () => {
    try {
      // Create workbook
      const workbook = XLSX.utils.book_new()

      // Summary data
      const summaryData = [
        ['Additional HOD Summary Report'],
        ['Generated on:', new Date().toLocaleDateString()],
        ['Department:', user?.department || 'N/A'],
        ['Additional HOD:', `${user?.firstName} ${user?.lastName}`],
        [''],
        ['Statistics'],
        ['Total Assigned Complaints', stats.total],
        ['Pending', stats.pending],
        ['In Progress', stats.inProgress],
        ['Resolved', stats.resolved],
        ['Rejected', stats.rejected],
        ['Resolution Rate', `${stats.total > 0 ? ((stats.resolved / stats.total) * 100).toFixed(1) : 0}%`],
        [''],
        ['Category Distribution'],
        ...chartData.map(item => [item.name, item.value])
      ]

      // Create summary worksheet
      const summaryWS = XLSX.utils.aoa_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(workbook, summaryWS, 'Summary')

      // All complaints data
      if (complaints.length > 0) {
        const complaintsData = complaints.map(complaint => ({
          'Complaint ID': complaint._id,
          'Title': complaint.title,
          'Description': complaint.description,
          'Category': complaint.category,
          'Priority': complaint.priority,
          'Status': complaint.status,
          'Student Name': complaint.student ? `${complaint.student.firstName} ${complaint.student.lastName}` : 'N/A',
          'Student Email': complaint.student?.email || 'N/A',
          'Student Roll No': complaint.student?.rollNo || 'N/A',
          'Created Date': new Date(complaint.createdAt).toLocaleDateString(),
          'Updated Date': new Date(complaint.updatedAt).toLocaleDateString(),
          'Workflow Level': complaint.workflow?.currentLevel || 'N/A',
          'Forwarded': complaint.workflow?.escalatedAt ? 'Yes' : 'No',
          'Forward Reason': complaint.workflow?.escalationReason || 'N/A'
        }))

        const complaintsWS = XLSX.utils.json_to_sheet(complaintsData)
        XLSX.utils.book_append_sheet(workbook, complaintsWS, 'Assigned Complaints')
      }

      // Generate filename
      const filename = `AdditionalHOD_Report_${user?.department}_${new Date().toISOString().split('T')[0]}.xlsx`

      // Save file
      XLSX.writeFile(workbook, filename)

      // Show success message
      setError('')
      // You could add a success state here if needed
    } catch (err) {
      setError('Failed to export data to Excel')
      console.error('Export error:', err)
    }
  }

  // Get status color
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'warning'
      case 'in progress': return 'info'
      case 'resolved': return 'success'
      case 'rejected': return 'error'
      default: return 'default'
    }
  }

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'urgent': return 'error'
      case 'high': return 'warning'
      case 'medium': return 'info'
      case 'low': return 'success'
      default: return 'default'
    }
  }

  // Calculate statistics
  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status.toLowerCase() === 'pending').length,
    inProgress: complaints.filter(c => c.status.toLowerCase() === 'in progress').length,
    resolved: complaints.filter(c => c.status.toLowerCase() === 'resolved').length,
    rejected: complaints.filter(c => c.status.toLowerCase() === 'rejected').length
  }

  // Prepare chart data
  const categoryData = complaints.reduce((acc, complaint) => {
    acc[complaint.category] = (acc[complaint.category] || 0) + 1
    return acc
  }, {})

  const chartData = Object.entries(categoryData).map(([category, count]) => ({
    name: category,
    value: count
  }))

  const colors = ['#1976d2', '#f57c00', '#2e7d32', '#d32f2f', '#7b1fa2', '#00acc1']

  return (
    <>
      <AdminNavbar />
      <Container maxWidth="xl" sx={{ py: 2, pt: 2, px: { xs: 1, sm: 2, md: 3 } }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2', fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
            Additional HOD Dashboard
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1.2rem', md: '1.5rem' }, fontWeight: '500' }}>
            {user?.department || 'Unknown'} Department - Welcome, {user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User'}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Statistics Cards */}
        <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={6} md={2.4} sx={{ display: 'flex' }}>
            <Card sx={{
              borderRadius: { xs: '12px', md: '16px' },
              boxShadow: isDarkMode
                ? '0 4px 20px rgba(0, 0, 0, 0.4)'
                : '0 4px 12px rgba(0, 0, 0, 0.1)',
              bgcolor: isDarkMode ? 'rgba(30, 41, 59, 0.8)' : '#ffffff',
              border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : 'none',
              transition: 'all 0.3s ease',
              width: '100%',
              aspectRatio: '1',
              display: 'flex',
              flexDirection: 'column',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: isDarkMode
                  ? '0 8px 30px rgba(25, 118, 210, 0.3)'
                  : '0 8px 25px rgba(0, 0, 0, 0.15)'
              }
            }}>
              <CardContent sx={{
                textAlign: 'center',
                p: { xs: 1.5, sm: 2, md: 2.5 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                flexGrow: 1,
                height: '100%'
              }}>
                <Assignment sx={{ fontSize: { xs: 32, sm: 38, md: 48 }, color: isDarkMode ? '#60a5fa' : '#1976d2', mb: 1 }} />
                <Typography variant="h2" sx={{ fontWeight: 'bold', color: isDarkMode ? '#60a5fa' : '#1976d2', fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' } }}>
                  {stats.total}
                </Typography>
                <Typography variant="h6" sx={{ color: isDarkMode ? '#94a3b8' : 'text.secondary', fontSize: { xs: '0.7rem', sm: '0.85rem', md: '1rem' }, fontWeight: '600' }}>
                  Total Assigned
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={6} md={2.4} sx={{ display: 'flex' }}>
            <Card sx={{
              borderRadius: { xs: '12px', md: '16px' },
              boxShadow: isDarkMode
                ? '0 4px 20px rgba(0, 0, 0, 0.4)'
                : '0 4px 12px rgba(0, 0, 0, 0.1)',
              bgcolor: isDarkMode ? 'rgba(30, 41, 59, 0.8)' : '#ffffff',
              border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : 'none',
              transition: 'all 0.3s ease',
              width: '100%',
              aspectRatio: '1',
              display: 'flex',
              flexDirection: 'column',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: isDarkMode
                  ? '0 8px 30px rgba(245, 124, 0, 0.3)'
                  : '0 8px 25px rgba(0, 0, 0, 0.15)'
              }
            }}>
              <CardContent sx={{
                textAlign: 'center',
                p: { xs: 1.5, sm: 2, md: 2.5 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                flexGrow: 1,
                height: '100%'
              }}>
                <Pending sx={{ fontSize: { xs: 32, sm: 38, md: 48 }, color: isDarkMode ? '#fb923c' : '#f57c00', mb: 1 }} />
                <Typography variant="h2" sx={{ fontWeight: 'bold', color: isDarkMode ? '#fb923c' : '#f57c00', fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' } }}>
                  {stats.pending}
                </Typography>
                <Typography variant="h6" sx={{ color: isDarkMode ? '#94a3b8' : 'text.secondary', fontSize: { xs: '0.7rem', sm: '0.85rem', md: '1rem' }, fontWeight: '600' }}>
                  Pending
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={6} md={2.4} sx={{ display: 'flex' }}>
            <Card sx={{
              borderRadius: { xs: '12px', md: '16px' },
              boxShadow: isDarkMode
                ? '0 4px 20px rgba(0, 0, 0, 0.4)'
                : '0 4px 12px rgba(0, 0, 0, 0.1)',
              bgcolor: isDarkMode ? 'rgba(30, 41, 59, 0.8)' : '#ffffff',
              border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : 'none',
              transition: 'all 0.3s ease',
              width: '100%',
              aspectRatio: '1',
              display: 'flex',
              flexDirection: 'column',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: isDarkMode
                  ? '0 8px 30px rgba(0, 172, 193, 0.3)'
                  : '0 8px 25px rgba(0, 0, 0, 0.15)'
              }
            }}>
              <CardContent sx={{
                textAlign: 'center',
                p: { xs: 1.5, sm: 2, md: 2.5 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                flexGrow: 1,
                height: '100%'
              }}>
                <TrendingUp sx={{ fontSize: { xs: 32, sm: 38, md: 48 }, color: isDarkMode ? '#22d3d1' : '#00acc1', mb: 1 }} />
                <Typography variant="h2" sx={{ fontWeight: 'bold', color: isDarkMode ? '#22d3d1' : '#00acc1', fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' } }}>
                  {stats.inProgress}
                </Typography>
                <Typography variant="h6" sx={{ color: isDarkMode ? '#94a3b8' : 'text.secondary', fontSize: { xs: '0.7rem', sm: '0.85rem', md: '1rem' }, fontWeight: '600' }}>
                  In Progress
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={6} md={2.4} sx={{ display: 'flex' }}>
            <Card sx={{
              borderRadius: { xs: '12px', md: '16px' },
              boxShadow: isDarkMode
                ? '0 4px 20px rgba(0, 0, 0, 0.4)'
                : '0 4px 12px rgba(0, 0, 0, 0.1)',
              bgcolor: isDarkMode ? 'rgba(30, 41, 59, 0.8)' : '#ffffff',
              border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : 'none',
              transition: 'all 0.3s ease',
              width: '100%',
              aspectRatio: '1',
              display: 'flex',
              flexDirection: 'column',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: isDarkMode
                  ? '0 8px 30px rgba(34, 197, 94, 0.3)'
                  : '0 8px 25px rgba(0, 0, 0, 0.15)'
              }
            }}>
              <CardContent sx={{
                textAlign: 'center',
                p: { xs: 1.5, sm: 2, md: 2.5 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                flexGrow: 1,
                height: '100%'
              }}>
                <CheckCircle sx={{ fontSize: { xs: 32, sm: 38, md: 48 }, color: isDarkMode ? '#22c55e' : '#2e7d32', mb: 1 }} />
                <Typography variant="h2" sx={{ fontWeight: 'bold', color: isDarkMode ? '#22c55e' : '#2e7d32', fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' } }}>
                  {stats.resolved}
                </Typography>
                <Typography variant="h6" sx={{ color: isDarkMode ? '#94a3b8' : 'text.secondary', fontSize: { xs: '0.7rem', sm: '0.85rem', md: '1rem' }, fontWeight: '600' }}>
                  Resolved
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={6} md={2.4} sx={{ display: 'flex' }}>
            <Card sx={{
              borderRadius: { xs: '12px', md: '16px' },
              boxShadow: isDarkMode
                ? '0 4px 20px rgba(0, 0, 0, 0.4)'
                : '0 4px 12px rgba(0, 0, 0, 0.1)',
              bgcolor: isDarkMode ? 'rgba(30, 41, 59, 0.8)' : '#ffffff',
              border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : 'none',
              transition: 'all 0.3s ease',
              width: '100%',
              aspectRatio: '1',
              display: 'flex',
              flexDirection: 'column',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: isDarkMode
                  ? '0 8px 30px rgba(239, 68, 68, 0.3)'
                  : '0 8px 25px rgba(0, 0, 0, 0.15)'
              }
            }}>
              <CardContent sx={{
                textAlign: 'center',
                p: { xs: 1.5, sm: 2, md: 2.5 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                flexGrow: 1,
                height: '100%'
              }}>
                <Cancel sx={{ fontSize: { xs: 32, sm: 38, md: 48 }, color: isDarkMode ? '#ef4444' : '#d32f2f', mb: 1 }} />
                <Typography variant="h2" sx={{ fontWeight: 'bold', color: isDarkMode ? '#ef4444' : '#d32f2f', fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' } }}>
                  {stats.rejected}
                </Typography>
                <Typography variant="h6" sx={{ color: isDarkMode ? '#94a3b8' : 'text.secondary', fontSize: { xs: '0.7rem', sm: '0.85rem', md: '1rem' }, fontWeight: '600' }}>
                  Rejected
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                fontWeight: '600',
                minHeight: 48,
                minWidth: { xs: 'auto', sm: 120 },
                px: { xs: 1, sm: 2 }
              }
            }}
          >
            <Tab label="Assigned" />
            <Tab label="Completed" />
            <Tab label="Analytics" />
          </Tabs>
        </Box>

        {/* Tab Content */}
        {activeTab === 0 && (
          <Box>
            {/* Filter and Actions */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant={filterStatus === 'all' ? 'contained' : 'outlined'}
                  size="small"
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}
                  onClick={() => {
                    setFilterStatus('all')
                    fetchComplaints('all')
                  }}
                >
                  All ({stats.total})
                </Button>
                <Button
                  variant={filterStatus === 'pending' ? 'contained' : 'outlined'}
                  size="small"
                  color="warning"
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}
                  onClick={() => {
                    setFilterStatus('pending')
                    fetchComplaints('pending')
                  }}
                >
                  Pending ({stats.pending})
                </Button>
                <Button
                  variant={filterStatus === 'in progress' ? 'contained' : 'outlined'}
                  size="small"
                  color="info"
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}
                  onClick={() => {
                    setFilterStatus('in progress')
                    fetchComplaints('in progress')
                  }}
                >
                  In Progress ({stats.inProgress})
                </Button>
              </Box>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => {
                  if (activeTab === 0) {
                    fetchComplaints(filterStatus)
                  } else {
                    fetchAllComplaints()
                  }
                }}
              >
                Refresh
              </Button>
            </Box>

            {/* Complaints List */}
            <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
              <CardContent sx={{ p: 0 }}>
                {loading ? (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography>Loading complaints...</Typography>
                  </Box>
                ) : complaints.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Assignment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No complaints assigned
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      You don't have any complaints assigned to you at the moment.
                    </Typography>
                  </Box>
                ) : (
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
                            <Avatar sx={{ bgcolor: getStatusColor(complaint.status) + '.light' }}>
                              <Assignment />
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.3rem' }}>
                                  {complaint.title}
                                </Typography>
                                <Chip
                                  label={complaint.status}
                                  color={getStatusColor(complaint.status)}
                                  size="small"
                                  sx={{ fontSize: '0.8rem', fontWeight: '600' }}
                                />
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary', fontSize: '1rem', lineHeight: 1.6 }}>
                                  {complaint.description}
                                </Typography>

                                {/* Student Information */}
                                <Box sx={{ mb: 2, p: 2, backgroundColor: 'rgba(0, 0, 0, 0.02)', borderRadius: '8px' }}>
                                  <Typography variant="body2" sx={{ fontWeight: '600', mb: 1, color: '#1976d2' }}>
                                    Student Information:
                                  </Typography>
                                  <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Person sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                                      <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                                        {complaint.student ? `${complaint.student.firstName} ${complaint.student.lastName}` : 'N/A'}
                                      </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Email sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                                      <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                                        {complaint.student?.email || 'N/A'}
                                      </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <School sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                                      <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                                        {complaint.student?.rollNo || 'N/A'}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </Box>

                                {/* Complaint Details */}
                                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 1 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Category sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                                    <Chip
                                      label={complaint.category}
                                      size="small"
                                      variant="outlined"
                                      sx={{ fontSize: '0.8rem' }}
                                    />
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PriorityHigh sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                                    <Chip
                                      label={complaint.priority}
                                      color={getPriorityColor(complaint.priority)}
                                      size="small"
                                      variant="outlined"
                                      sx={{ fontSize: '0.8rem' }}
                                    />
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CalendarToday sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                      Created: {new Date(complaint.createdAt).toLocaleDateString()}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CalendarToday sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                      Updated: {new Date(complaint.updatedAt).toLocaleDateString()}
                                    </Typography>
                                  </Box>
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
                              {(() => {
                                const isForwarded = complaint.workflow?.currentLevel === 'dean';
                                const isRejected = complaint.status.toLowerCase() === 'rejected';
                                const isResolved = complaint.status.toLowerCase() === 'resolved' || complaint.status.toLowerCase() === 'closed';
                                const isDisabled = isForwarded || isRejected || isResolved;

                                return (
                                  <>
                                    <Tooltip title={
                                      isForwarded
                                        ? 'Cannot operate on forwarded complaints'
                                        : isResolved || isRejected
                                          ? 'Cannot comment on resolved/rejected complaints'
                                          : 'Add Comment'
                                    }>
                                      <span>
                                        <IconButton
                                          onClick={() => {
                                            setSelectedComplaint(complaint)
                                            setCommentDialogOpen(true)
                                          }}
                                          disabled={isDisabled}
                                        >
                                          <Comment />
                                        </IconButton>
                                      </span>
                                    </Tooltip>
                                    {/* Quick Resolve button */}
                                    {!isForwarded && !isResolved && !isRejected && (
                                      <Tooltip title="Mark as Resolved">
                                        <IconButton
                                          onClick={() => handleStatusUpdate(complaint._id, 'Resolved')}
                                          sx={{
                                            color: 'success.main',
                                            '&:hover': {
                                              backgroundColor: isDarkMode ? 'rgba(76, 175, 80, 0.1)' : 'rgba(76, 175, 80, 0.04)'
                                            }
                                          }}
                                        >
                                          <CheckCircle />
                                        </IconButton>
                                      </Tooltip>
                                    )}
                                    {/* Quick Reject button */}
                                    {!isForwarded && !isResolved && !isRejected && (
                                      <Tooltip title="Mark as Rejected">
                                        <IconButton
                                          onClick={() => handleStatusUpdate(complaint._id, 'Rejected')}
                                          sx={{
                                            color: 'error.main',
                                            '&:hover': {
                                              backgroundColor: isDarkMode ? 'rgba(244, 67, 54, 0.1)' : 'rgba(244, 67, 54, 0.04)'
                                            }
                                          }}
                                        >
                                          <Cancel />
                                        </IconButton>
                                      </Tooltip>
                                    )}
                                    {!isForwarded && (
                                      <>
                                        <Tooltip title={
                                          isResolved || isRejected
                                            ? 'Cannot forward resolved/rejected complaints'
                                            : 'Forward to Dean'
                                        }>
                                          <IconButton
                                            onClick={() => {
                                              setSelectedComplaint(complaint)
                                              setForwardDialogOpen(true)
                                            }}
                                            disabled={isResolved || isRejected}
                                          >
                                            <Forward />
                                          </IconButton>
                                        </Tooltip>
                                        <Tooltip title={
                                          isRejected
                                            ? 'No operations allowed on rejected complaints'
                                            : 'More Options'
                                        }>
                                          <span>
                                            <IconButton
                                              onClick={(e) => {
                                                setAnchorEl(e.currentTarget)
                                                setSelectedComplaint(complaint)
                                              }}
                                              disabled={isRejected}
                                            >
                                              <MoreVert />
                                            </IconButton>
                                          </span>
                                        </Tooltip>
                                      </>
                                    )}
                                    {isForwarded && (
                                      <Tooltip title="No operations allowed on forwarded complaints">
                                        <span>
                                          <IconButton disabled>
                                            <MoreVert />
                                          </IconButton>
                                        </span>
                                      </Tooltip>
                                    )}
                                  </>
                                );
                              })()}
                            </Box>
                          </ListItemSecondaryAction>
                        </ListItem>
                        {index < complaints.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Completed Tab */}
        {activeTab === 1 && (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3, fontSize: '1.8rem' }}>
              Completed Complaints
            </Typography>

            {complaints && complaints.filter(c => c.status.toLowerCase() === 'resolved').length > 0 ? (
              <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
                <CardContent sx={{ p: 0 }}>
                  <List>
                    {complaints
                      .filter(c => c.status.toLowerCase() === 'resolved')
                      .map((complaint, index) => (
                        <React.Fragment key={complaint._id}>
                          <ListItem
                            sx={{
                              py: 3,
                              px: 3,
                              pr: 10, // Add right padding to make room for the View Details button
                              alignItems: 'flex-start'
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 48, mt: 1 }}>
                              <Avatar sx={{ bgcolor: 'success.light' }}>
                                <CheckCircle sx={{ color: '#2e7d32' }} />
                              </Avatar>
                            </ListItemIcon>
                            <ListItemText
                              sx={{ pr: 2 }} // Add padding-right to prevent overlap
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                  <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.3rem' }}>
                                    {complaint.title}
                                  </Typography>
                                  <Chip
                                    label="Resolved"
                                    color="success"
                                    size="small"
                                    sx={{ fontSize: '0.8rem', fontWeight: '600' }}
                                  />
                                </Box>
                              }
                              secondary={
                                <Box sx={{ pr: 1 }}>
                                  <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary', fontSize: '1rem', lineHeight: 1.6 }}>
                                    {complaint.description}
                                  </Typography>

                                  {/* Student Information */}
                                  <Box sx={{ mb: 2, p: 2, backgroundColor: 'rgba(46, 125, 50, 0.05)', borderRadius: '8px', border: '1px solid rgba(46, 125, 50, 0.1)' }}>
                                    <Typography variant="body2" sx={{ fontWeight: '600', mb: 1, color: '#2e7d32' }}>
                                      Student Information:
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Person sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                                        <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                                          {complaint.student ? `${complaint.student.firstName} ${complaint.student.lastName}` : 'N/A'}
                                        </Typography>
                                      </Box>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Email sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                                        <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                                          {complaint.student?.email || 'N/A'}
                                        </Typography>
                                      </Box>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <School sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                                        <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                                          {complaint.student?.rollNo || 'N/A'}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </Box>

                                  {/* Complaint Details */}
                                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Category sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                                      <Chip
                                        label={complaint.category}
                                        size="small"
                                        variant="outlined"
                                        sx={{ fontSize: '0.8rem' }}
                                      />
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <PriorityHigh sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                                      <Chip
                                        label={complaint.priority}
                                        color={getPriorityColor(complaint.priority)}
                                        size="small"
                                        variant="outlined"
                                        sx={{ fontSize: '0.8rem' }}
                                      />
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <CalendarToday sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                        Created: {new Date(complaint.createdAt).toLocaleDateString()}
                                      </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <CheckCircle sx={{ fontSize: '1rem', color: '#2e7d32' }} />
                                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem', color: '#2e7d32', fontWeight: '600' }}>
                                        Resolved: {new Date(complaint.updatedAt).toLocaleDateString()}
                                      </Typography>
                                    </Box>
                                  </Box>

                                </Box>
                              }
                            />
                            <ListItemSecondaryAction sx={{ top: '50%', transform: 'translateY(-50%)', right: 16 }}>
                              <Tooltip title="View Details">
                                <IconButton
                                  onClick={() => {
                                    setSelectedComplaint(complaint)
                                    setViewDialogOpen(true)
                                  }}
                                  sx={{ color: '#1976d2' }}
                                >
                                  <Visibility />
                                </IconButton>
                              </Tooltip>
                            </ListItemSecondaryAction>
                          </ListItem>
                          {index < complaints.filter(c => c.status.toLowerCase() === 'resolved').length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                  </List>
                </CardContent>
              </Card>
            ) : (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <CheckCircle sx={{ fontSize: 80, color: 'text.secondary', mb: 3 }} />
                <Typography variant="h4" color="text.secondary" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  No completed complaints yet
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 4, fontSize: '1.2rem' }}>
                  Resolved complaints will appear here
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {activeTab === 2 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', fontSize: '1.8rem' }}>
                Additional HOD Analytics
              </Typography>
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={handleExportToExcel}
                sx={{ fontWeight: 'bold' }}
              >
                Export Report
              </Button>
            </Box>

            <Grid container spacing={4}>
              {/* Complaints by Category Pie Chart */}
              <Grid item xs={12} lg={4}>
                <Card sx={{
                  height: '550px',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 4 }}>
                    <Typography variant="h5" gutterBottom sx={{
                      fontWeight: 'bold',
                      color: isDarkMode ? '#ffffff' : '#1976d2',
                      fontSize: '1.5rem',
                      mb: 1
                    }}>
                      Complaints by Category
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontSize: '1rem' }}>
                      Distribution of complaints by category assigned to you
                    </Typography>
                    {chartData.length > 0 ? (
                      <Box sx={{ height: 380, mt: 2, flex: 1, overflow: 'hidden' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={chartData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              outerRadius={90}
                              fill="#8884d8"
                              dataKey="value"
                              labelStyle={{
                                fill: isDarkMode ? '#ffffff' : '#000000',
                                fontSize: '11px',
                                fontWeight: '500',
                                textAnchor: 'middle'
                              }}
                            >
                              {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip
                              formatter={(value, name) => [value, 'Complaints']}
                              labelFormatter={(label) => `Category: ${label}`}
                              contentStyle={{
                                backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
                                border: isDarkMode ? '1px solid #333' : '1px solid #ccc',
                                color: isDarkMode ? '#ffffff' : '#000000',
                              }}
                              cursor={{ fill: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}
                            />
                            <Legend
                              wrapperStyle={{
                                color: isDarkMode ? '#ffffff' : '#000000',
                                fontSize: '11px',
                                fontWeight: '500',
                                paddingTop: '5px',
                                paddingBottom: '5px'
                              }}
                              layout="horizontal"
                              verticalAlign="bottom"
                              align="center"
                              iconType="circle"
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 8, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="h6" color="text.secondary">No data available</Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Status Distribution */}
              <Grid item xs={12} lg={4}>
                <Card sx={{
                  height: '550px',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 4 }}>
                    <Typography variant="h5" gutterBottom sx={{
                      fontWeight: 'bold',
                      color: isDarkMode ? '#ffffff' : '#1976d2',
                      fontSize: '1.5rem',
                      mb: 1
                    }}>
                      Status Distribution
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontSize: '1rem' }}>
                      Current status breakdown of your assigned complaints
                    </Typography>
                    <Box sx={{ height: 380, mt: 2, flex: 1 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                          { name: 'Pending', value: stats.pending, color: '#f57c00' },
                          { name: 'In Progress', value: stats.inProgress, color: '#1976d2' },
                          { name: 'Resolved', value: stats.resolved, color: '#2e7d32' },
                          { name: 'Rejected', value: stats.rejected, color: '#d32f2f' }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#333' : '#e0e0e0'} />
                          <XAxis
                            dataKey="name"
                            tick={{
                              fill: isDarkMode ? '#ffffff' : '#000000',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}
                            axisLine={{ stroke: isDarkMode ? '#333' : '#e0e0e0' }}
                            tickLine={{ stroke: isDarkMode ? '#333' : '#e0e0e0' }}
                          />
                          <YAxis
                            tick={{
                              fill: isDarkMode ? '#ffffff' : '#000000',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}
                            axisLine={{ stroke: isDarkMode ? '#333' : '#e0e0e0' }}
                            tickLine={{ stroke: isDarkMode ? '#333' : '#e0e0e0' }}
                          />
                          <RechartsTooltip
                            contentStyle={{
                              backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
                              border: isDarkMode ? '1px solid #333' : '1px solid #ccc',
                              borderRadius: '8px',
                              color: isDarkMode ? '#ffffff' : '#000000',
                              boxShadow: isDarkMode ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 4px 12px rgba(0, 0, 0, 0.1)'
                            }}
                            cursor={{ fill: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}
                          />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {[
                              { name: 'Pending', value: stats.pending, color: '#f57c00' },
                              { name: 'In Progress', value: stats.inProgress, color: '#1976d2' },
                              { name: 'Resolved', value: stats.resolved, color: '#2e7d32' },
                              { name: 'Rejected', value: stats.rejected, color: '#d32f2f' }
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Additional HOD Performance Summary */}
              <Grid item xs={12} lg={4}>
                <Card sx={{
                  height: '550px',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 4 }}>
                    <Typography variant="h5" gutterBottom sx={{
                      fontWeight: 'bold',
                      color: isDarkMode ? '#ffffff' : '#1976d2',
                      fontSize: '1.5rem',
                      mb: 1
                    }}>
                      Performance Summary
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontSize: '1rem' }}>
                      Key performance metrics and resolution statistics
                    </Typography>
                    <Box sx={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      mt: 2
                    }}>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 4,
                        p: 3,
                        backgroundColor: isDarkMode ? 'rgba(25, 118, 210, 0.1)' : 'rgba(25, 118, 210, 0.05)',
                      }}>
                        <Box sx={{ flex: 1, textAlign: 'center' }}>
                          <Typography variant="h3" sx={{
                            fontWeight: 'bold',
                            color: isDarkMode ? '#ffffff' : '#1976d2',
                            mb: 1
                          }}>
                            {stats.total > 0 ? ((stats.resolved / stats.total) * 100).toFixed(1) : 0}%
                          </Typography>
                          <Typography variant="h6" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
                            Resolution Rate
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Box sx={{ flex: 1, textAlign: 'center', p: 2, backgroundColor: isDarkMode ? 'rgba(46, 125, 50, 0.1)' : 'rgba(46, 125, 50, 0.05)' }}>
                          <Typography variant="h4" sx={{
                            fontWeight: 'bold',
                            color: isDarkMode ? '#2e7d32' : '#2e7d32'
                          }}>
                            {stats.resolved}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                            Resolved
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1, textAlign: 'center', p: 2, backgroundColor: isDarkMode ? 'rgba(245, 124, 0, 0.1)' : 'rgba(245, 124, 0, 0.05)' }}>
                          <Typography variant="h4" sx={{
                            fontWeight: 'bold',
                            color: isDarkMode ? '#f57c00' : '#f57c00'
                          }}>
                            {stats.pending}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                            Pending
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1, textAlign: 'center', p: 2, backgroundColor: isDarkMode ? 'rgba(25, 118, 210, 0.1)' : 'rgba(25, 118, 210, 0.05)' }}>
                          <Typography variant="h4" sx={{
                            fontWeight: 'bold',
                            color: isDarkMode ? '#1976d2' : '#1976d2'
                          }}>
                            {stats.inProgress}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                            In Progress
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
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
                          Created Date
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {new Date(selectedComplaint.createdAt).toLocaleString()}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                {/* Workflow History / Forwarding Details Section */}
                {selectedComplaint.workflow && (selectedComplaint.workflow.currentLevel !== 'coordinator' || selectedComplaint.workflow.escalatedAt) && (
                  <>
                    <Divider sx={{ my: 2.5 }} />
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {/* Show forwarding path based on current level */}
                        {selectedComplaint.workflow.currentLevel === 'additional_hod' && (
                          <Paper
                            elevation={0}
                            sx={{
                              p: 2,
                              bgcolor: isDarkMode ? 'rgba(25, 118, 210, 0.15)' : 'rgba(25, 118, 210, 0.08)',
                              borderRadius: 1,
                              borderLeft: '4px solid',
                              borderColor: 'info.main',
                              transition: 'background-color 0.3s ease'
                            }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: 'text.primary' }}>
                              Forwarded from Coordinator to Additional HOD
                            </Typography>
                            {selectedComplaint.workflow.escalatedAt && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                Forwarded on: {new Date(selectedComplaint.workflow.escalatedAt).toLocaleString()}
                              </Typography>
                            )}
                          </Paper>
                        )}
                        {selectedComplaint.workflow.currentLevel === 'dean' && (
                          <>
                            {selectedComplaint.workflow.additionalHodAssigned ? (
                              <>
                                <Paper
                                  elevation={0}
                                  sx={{
                                    p: 2,
                                    bgcolor: isDarkMode ? 'rgba(25, 118, 210, 0.15)' : 'rgba(25, 118, 210, 0.08)',
                                    borderRadius: 1,
                                    borderLeft: '4px solid',
                                    borderColor: 'info.main',
                                    transition: 'background-color 0.3s ease'
                                  }}
                                >
                                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: 'text.primary' }}>
                                    Forwarded from Coordinator to Additional HOD
                                  </Typography>
                                </Paper>
                                <Paper
                                  elevation={0}
                                  sx={{
                                    p: 2,
                                    bgcolor: isDarkMode ? 'rgba(237, 108, 2, 0.15)' : 'rgba(237, 108, 2, 0.08)',
                                    borderRadius: 1,
                                    borderLeft: '4px solid',
                                    borderColor: 'warning.main',
                                    transition: 'background-color 0.3s ease'
                                  }}
                                >
                                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: 'text.primary' }}>
                                    Forwarded from Additional HOD to Dean
                                  </Typography>
                                  {selectedComplaint.workflow.escalatedAt && (
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                      Forwarded on: {new Date(selectedComplaint.workflow.escalatedAt).toLocaleString()}
                                    </Typography>
                                  )}
                                </Paper>
                              </>
                            ) : (
                              <Paper
                                elevation={0}
                                sx={{
                                  p: 2,
                                  bgcolor: isDarkMode ? 'rgba(25, 118, 210, 0.15)' : 'rgba(25, 118, 210, 0.08)',
                                  borderRadius: 1,
                                  borderLeft: '4px solid',
                                  borderColor: 'info.main',
                                  transition: 'background-color 0.3s ease'
                                }}
                              >
                                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: 'text.primary' }}>
                                  Forwarded from Coordinator to Dean
                                </Typography>
                                {selectedComplaint.workflow.escalatedAt && (
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                    Forwarded on: {new Date(selectedComplaint.workflow.escalatedAt).toLocaleString()}
                                  </Typography>
                                )}
                              </Paper>
                            )}
                          </>
                        )}
                      </Box>
                    </Box>
                  </>
                )}

                {/* Escalation Reason Section */}
                {selectedComplaint.workflow?.escalationReason && (
                  <>
                    <Divider sx={{ my: 2.5 }} />
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'text.primary', fontSize: '1.1rem' }}>
                        Escalation Reason
                      </Typography>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          bgcolor: 'warning.light',
                          borderRadius: 1,
                          borderLeft: '4px solid',
                          borderColor: 'warning.main'
                        }}
                      >
                        <Typography variant="body2" sx={{ color: 'text.primary', fontStyle: 'italic', fontWeight: 500 }}>
                          {selectedComplaint.workflow.escalationReason}
                        </Typography>
                      </Paper>
                    </Box>
                  </>
                )}

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
                                elevation={1}
                                sx={{
                                  p: 2,
                                  borderRadius: 2,
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: 1.5,
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  '&:hover': {
                                    boxShadow: 3,
                                    borderColor: 'primary.main'
                                  }
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                  {isPDF ? (
                                    <PictureAsPdf sx={{ color: '#d32f2f', fontSize: 36, mt: 0.5 }} />
                                  ) : isImage ? (
                                    <ImageIcon sx={{ color: '#1976d2', fontSize: 36, mt: 0.5 }} />
                                  ) : (
                                    <InsertDriveFile sx={{ color: '#666', fontSize: 36, mt: 0.5 }} />
                                  )}
                                  <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, wordBreak: 'break-word' }}>
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

        {/* Add Comment Dialog */}
        <Dialog open={commentDialogOpen} onClose={() => setCommentDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add Comment</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add your comment here..."
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCommentDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddComment} variant="contained">Add Comment</Button>
          </DialogActions>
        </Dialog>

        {/* Forward Dialog */}
        <Dialog open={forwardDialogOpen} onClose={() => {
          setForwardDialogOpen(false)
          setForwardReason('')
          setError('')
        }} maxWidth="sm" fullWidth>
          <DialogTitle>Forward to Dean</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Please provide a reason for forwarding this complaint to the Dean (minimum 10 characters):
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}
            <TextField
              fullWidth
              multiline
              rows={4}
              value={forwardReason}
              onChange={(e) => {
                setForwardReason(e.target.value)
                setError('') // Clear error when user types
              }}
              placeholder="Explain why this complaint needs Dean attention..."
              error={!!error && !error.includes('minimum')}
              helperText={forwardReason.trim().length > 0 && forwardReason.trim().length < 10
                ? `Minimum 10 characters required (${forwardReason.trim().length}/10)`
                : ''}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setForwardDialogOpen(false)
              setForwardReason('')
              setError('')
            }}>Cancel</Button>
            <Button
              onClick={handleForward}
              variant="contained"
              color="warning"
              disabled={!forwardReason.trim() || forwardReason.trim().length < 10}
            >
              Forward to Dean
            </Button>
          </DialogActions>
        </Dialog>

        {/* Status Update Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: {
              mt: 1.5,
              minWidth: 180,
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
              border: '1px solid',
              borderColor: 'divider'
            }
          }}
        >
          {(() => {
            const isForwarded = selectedComplaint?.workflow?.currentLevel === 'dean';
            const isRejected = selectedComplaint?.status?.toLowerCase() === 'rejected';

            if (isForwarded) {
              return (
                <MenuItem disabled>
                  No operations allowed on forwarded complaints
                </MenuItem>
              );
            }

            if (isRejected) {
              return (
                <MenuItem disabled>
                  No operations allowed on rejected complaints
                </MenuItem>
              );
            }

            return (
              <>
                <MenuItem onClick={() => {
                  handleStatusUpdate(selectedComplaint?._id, 'In Progress')
                  setAnchorEl(null)
                }}>
                  Mark as In Progress
                </MenuItem>
                <MenuItem onClick={() => {
                  handleStatusUpdate(selectedComplaint?._id, 'Resolved')
                  setAnchorEl(null)
                }}>
                  Mark as Resolved
                </MenuItem>
                <MenuItem onClick={() => {
                  handleStatusUpdate(selectedComplaint?._id, 'Rejected')
                  setAnchorEl(null)
                }}>
                  Mark as Rejected
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setDeleteDialogOpen(true)
                    setAnchorEl(null)
                  }}
                  sx={{ color: 'error.main' }}
                >
                  Delete Complaint
                </MenuItem>
              </>
            );
          })()}
        </Menu>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Delete Complaint</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this complaint? This action cannot be undone.
            </Typography>
            {selectedComplaint && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  {selectedComplaint.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ID: {selectedComplaint._id}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              color="error"
              variant="contained"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Forward to Dean Dialog - Duplicate removed, using the one above */}
      </Container>
    </>
  )
}
