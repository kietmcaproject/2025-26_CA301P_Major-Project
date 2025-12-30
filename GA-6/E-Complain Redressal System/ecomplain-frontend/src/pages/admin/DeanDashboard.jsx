import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useAuth } from '../../auth/AuthContext.jsx'
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext.jsx'
import api from '../../lib/api.js'
import axios from 'axios'
import AdminNavbar from '../../components/AdminNavbar.jsx'
import * as XLSX from 'xlsx'
import { motion, AnimatePresence } from 'framer-motion'
import { staggerContainer, staggerItem, tabContent } from '../../utils/AnimationConfig.jsx'
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
  FormControl,
  InputLabel,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  Email,
  School,
  CalendarToday,
  Category,
  PriorityHigh,
  Description,
  FilterList,
  MoreVert,
  Refresh,
  SupervisorAccount,
  Forward,
  Assessment,
  Download,
  Done,
  PictureAsPdf,
  Image as ImageIcon,
  InsertDriveFile,
  AttachFile,
  ZoomIn,
  Close,
  OpenInNew
} from '@mui/icons-material'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts'

// Create motion components
const MotionBox = motion.create(Box)
const MotionCard = motion.create(Card)
const MotionGrid = motion.create(Grid)

export default function DeanDashboard() {
  const { user } = useAuth()
  const { isDarkMode } = useCustomTheme()

  const [activeTab, setActiveTab] = useState(0)
  const [complaints, setComplaints] = useState([])
  const [escalatedComplaints, setEscalatedComplaints] = useState([])
  const [allComplaints, setAllComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [commentDialogOpen, setCommentDialogOpen] = useState(false)
  const [externalForwardDialogOpen, setExternalForwardDialogOpen] = useState(false)
  const [comment, setComment] = useState('')
  const [forwardReason, setForwardReason] = useState('')
  const [selectedExternalDepartment, setSelectedExternalDepartment] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false)
  const [previewImageUrl, setPreviewImageUrl] = useState('')
  const [previewImageName, setPreviewImageName] = useState('')
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false)
  const [previewPdfUrl, setPreviewPdfUrl] = useState('')
  const [previewPdfName, setPreviewPdfName] = useState('')
  const [pdfBlobUrl, setPdfBlobUrl] = useState('')
  const [pdfLoading, setPdfLoading] = useState(true)
  const [anchorEl, setAnchorEl] = useState(null)
  const [closeDialogOpen, setCloseDialogOpen] = useState(false)

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
      console.warn('[DeanDashboard] No PDF URL provided');
      return '';
    }

    // Check if it's already a full Cloudinary URL
    if (pdfUrl.includes('cloudinary.com')) {
      const proxyUrl = `/api/complaints/attachments/pdf?url=${encodeURIComponent(pdfUrl)}`;
      console.log('[DeanDashboard] Using Cloudinary PDF URL:', { original: pdfUrl, proxy: proxyUrl });
      return proxyUrl;
    }

    // Check if it's a relative URL or just a filename - this is the problem!
    if (pdfUrl.startsWith('/') || !pdfUrl.startsWith('http')) {
      console.error('[DeanDashboard] ERROR: Invalid PDF URL format:', pdfUrl);
      console.error('[DeanDashboard] Expected full Cloudinary URL. Attachment path from DB:', pdfUrl);
      return '';
    }

    return pdfUrl;
  }

  const [closeComment, setCloseComment] = useState('')

  // Cleanup blob URL when component unmounts
  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, []);
  useEffect(() => {
    if (pdfPreviewOpen && previewPdfUrl) {
      // Cleanup previous blob URL if exists
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
        setPdfBlobUrl('');
      }

      const fetchPdf = async () => {
        try {
          setPdfLoading(true);
          const response = await api.get('/api/complaints/attachments/pdf', {
            params: { url: previewPdfUrl },
            responseType: 'blob'
          });
          const blob = new Blob([response.data], { type: 'application/pdf' });
          const blobUrl = URL.createObjectURL(blob);
          setPdfBlobUrl(blobUrl);
          setPdfLoading(false);
        } catch (error) {
          console.error('Error fetching PDF:', error);
          setPdfLoading(false);
        }
      };
      fetchPdf();
    } else if (!pdfPreviewOpen) {
      // Cleanup when dialog closes
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
        setPdfBlobUrl('');
      }
      setPdfLoading(false);
    }

    // Cleanup blob URL when component unmounts
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [pdfPreviewOpen, previewPdfUrl]);

  // Request cancellation ref
  const cancelTokenRef = useRef(null)

  // Fetch all complaints for the department with request cancellation
  const fetchComplaints = useCallback(async () => {
    // Cancel previous request if exists
    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancel('New request initiated')
    }

    cancelTokenRef.current = axios.CancelToken.source()

    try {
      setLoading(true)
      const { data } = await api.get('/api/complaints', {
        params: {
          department: user.department,
          limit: 100
        },
        cancelToken: cancelTokenRef.current.token
      })
      const departmentComplaints = data.complaints || []
      setAllComplaints(departmentComplaints)

      // Dean Level Complaints: complaints that are at Dean level OR escalated to Dean OR forwarded to external by Dean
      const deanLevelComplaints = departmentComplaints.filter(c =>
        c.workflow?.currentLevel === 'dean' ||
        (c.workflow?.escalatedAt && c.workflow?.currentLevel === 'dean') ||
        c.workflow?.deanAssigned ||
        c.externalForward?.isForwarded // Include complaints forwarded to external departments
      )
      setComplaints(deanLevelComplaints)

      // Escalated Complaints: complaints that have been escalated (regardless of current level)
      const escalatedComplaints = departmentComplaints.filter(c =>
        c.workflow?.escalatedAt && c.workflow?.escalatedBy
      )
      setEscalatedComplaints(escalatedComplaints)
    } catch (err) {
      if (axios.isCancel(err)) {
        return // Ignore cancelled requests
      }
      if (err.__CACHED__) {
        // Handle cached response
        const departmentComplaints = err.data?.complaints || []
        setAllComplaints(departmentComplaints)
        const deanLevelComplaints = departmentComplaints.filter(c =>
          c.workflow?.currentLevel === 'dean' ||
          (c.workflow?.escalatedAt && c.workflow?.currentLevel === 'dean') ||
          c.workflow?.deanAssigned ||
          c.externalForward?.isForwarded
        )
        setComplaints(deanLevelComplaints)
        const escalatedComplaints = departmentComplaints.filter(c =>
          c.workflow?.escalatedAt && c.workflow?.escalatedBy
        )
        setEscalatedComplaints(escalatedComplaints)
        setLoading(false)
        return
      }
      setError('Failed to fetch complaints')
      console.error('Error fetching complaints:', err)
    } finally {
      setLoading(false)
    }
  }, [user.department])

  useEffect(() => {
    if (user) {
      fetchComplaints()
    }

    // Cleanup: cancel pending requests on unmount
    return () => {
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel('Component unmounted')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.department])

  // Handle complaint status update
  const handleStatusUpdate = async (complaintId, newStatus) => {
    try {
      await api.put(`/api/complaints/${complaintId}`, {
        status: newStatus
      })
      fetchComplaints()
    } catch (err) {
      setError('Failed to update complaint status')
    }
  }

  // Handle forwarding complaint to external department
  const handleForwardToExternal = async () => {
    if (!selectedComplaint || !selectedExternalDepartment) {
      setError('Please select a department to forward the complaint to')
      return
    }

    // Prevent operations on rejected complaints
    if (selectedComplaint?.status?.toLowerCase() === 'rejected') {
      setError('Cannot forward rejected complaints')
      return
    }

    // Prevent operations on already forwarded complaints
    const isForwarded = selectedComplaint?.externalForward?.isForwarded;
    if (isForwarded) {
      setError('Cannot forward already forwarded complaints')
      return
    }

    try {
      await api.put(`/api/complaints/${selectedComplaint._id}/forward-external`, {
        forwardedTo: selectedExternalDepartment,
        forwardReason: forwardReason.trim() || undefined
      })
      setExternalForwardDialogOpen(false)
      setSelectedComplaint(null)
      setForwardReason('')
      setSelectedExternalDepartment('')
      fetchComplaints()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to forward complaint to external department')
    }
  }

  // Handle closing complaint after external acknowledgement
  const handleCloseExternalComplaint = async () => {
    if (!selectedComplaint) return

    try {
      await api.put(`/api/complaints/${selectedComplaint._id}/close-external`, {
        closeComment: closeComment.trim() || undefined
      })
      setCloseDialogOpen(false)
      setSelectedComplaint(null)
      setCloseComment('')
      fetchComplaints()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to close complaint')
    }
  }

  const handleExportToExcel = () => {
    try {
      // Create workbook
      const workbook = XLSX.utils.book_new()

      // Summary data
      const summaryData = [
        ['Department Summary Report'],
        ['Generated on:', new Date().toLocaleDateString()],
        ['Department:', user?.department || 'N/A'],
        ['Dean:', `${user?.firstName} ${user?.lastName}`],
        [''],
        ['Statistics'],
        ['Total Complaints', stats.total],
        ['Pending', stats.pending],
        ['In Progress', stats.inProgress],
        ['Resolved', stats.resolved],
        ['Rejected', stats.rejected],
        ['Forwarded', stats.escalated],
        ['Dean Level', stats.deanLevel],
        ['Resolution Rate', `${stats.total > 0 ? ((stats.resolved / stats.total) * 100).toFixed(1) : 0}%`],
        [''],
        ['Category Distribution'],
        ...chartData.map(item => [item.name, item.value])
      ]

      // Create summary worksheet
      const summaryWS = XLSX.utils.aoa_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(workbook, summaryWS, 'Summary')

      // All complaints data
      if (allComplaints.length > 0) {
        const complaintsData = allComplaints.map(complaint => ({
          'Complaint ID': complaint._id,
          'Title': complaint.title,
          'Description': complaint.description,
          'Category': complaint.category,
          'Priority': complaint.priority,
          'Status': complaint.status,
          'Student Name': complaint.student ? `${complaint.student.firstName} ${complaint.student.lastName}` : 'N/A',
          'Student Email': complaint.student?.email || 'N/A',
          'Student Roll No': complaint.student?.rollNo || 'N/A',
          'Assigned To': complaint.assignedTo ? `${complaint.assignedTo.firstName} ${complaint.assignedTo.lastName}` : 'Unassigned',
          'Created Date': new Date(complaint.createdAt).toLocaleDateString(),
          'Updated Date': new Date(complaint.updatedAt).toLocaleDateString(),
          'Workflow Level': complaint.workflow?.currentLevel || 'N/A',
          'Forwarded By': complaint.workflow?.escalatedBy ? 'Yes' : 'No',
          'Forwarding Reason': complaint.workflow?.escalationReason || 'N/A'
        }))

        const complaintsWS = XLSX.utils.json_to_sheet(complaintsData)
        XLSX.utils.book_append_sheet(workbook, complaintsWS, 'All Complaints')
      }

      // Generate filename
      const filename = `Dean_Report_${user?.department}_${new Date().toISOString().split('T')[0]}.xlsx`

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

  // Handle adding comment
  const handleAddComment = async () => {
    if (!comment.trim()) return

    // Prevent operations on rejected complaints
    if (selectedComplaint?.status?.toLowerCase() === 'rejected') {
      setError('Cannot add comments to rejected complaints')
      return
    }

    // Prevent operations on forwarded complaints
    const isForwarded = selectedComplaint?.externalForward?.isForwarded;
    if (isForwarded) {
      setError('Cannot add comments to forwarded complaints')
      return
    }

    try {
      await api.post(`/api/complaints/${selectedComplaint._id}/comments`, {
        comment: comment.trim(),
        isInternal: false
      })
      setComment('')
      setCommentDialogOpen(false)
      fetchComplaints()
    } catch (err) {
      setError('Failed to add comment')
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

  // Calculate statistics with memoization
  const stats = useMemo(() => ({
    total: allComplaints.length,
    pending: allComplaints.filter(c => c.status.toLowerCase() === 'pending').length,
    inProgress: allComplaints.filter(c => c.status.toLowerCase() === 'in progress').length,
    resolved: allComplaints.filter(c =>
      c.status.toLowerCase() === 'resolved' || c.status.toLowerCase() === 'closed'
    ).length,
    rejected: allComplaints.filter(c => c.status.toLowerCase() === 'rejected').length,
    escalated: escalatedComplaints.length,
    deanLevel: complaints.length
  }), [allComplaints, escalatedComplaints, complaints])

  // Prepare chart data with memoization
  const chartData = useMemo(() => {
    const categoryData = allComplaints.reduce((acc, complaint) => {
      acc[complaint.category] = (acc[complaint.category] || 0) + 1
      return acc
    }, {})

    return Object.entries(categoryData).map(([category, count]) => ({
      name: category,
      value: count
    }))
  }, [allComplaints])

  const colors = ['#1976d2', '#f57c00', '#2e7d32', '#d32f2f', '#7b1fa2', '#00acc1']



  return (
    <>
      <AdminNavbar />
      <Container maxWidth="xl" sx={{ py: 2, pt: 2, px: { xs: 1, sm: 2, md: 3 } }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2', fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
            Dean Dashboard
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1.2rem', md: '1.5rem' }, fontWeight: '500' }}>
            {user?.department} Department - Welcome, {user?.firstName} {user?.lastName}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Statistics Cards */}
        <MotionGrid
          container
          spacing={{ xs: 1.5, sm: 2, md: 3 }}
          sx={{ mb: 4 }}
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          <Grid item xs={6} sm={6} md={2.4} sx={{ display: 'flex' }} component={motion.div} variants={staggerItem}>
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
                  Total Complaints
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
                <Forward sx={{ fontSize: { xs: 32, sm: 38, md: 48 }, color: isDarkMode ? '#fb923c' : '#f57c00', mb: 1 }} />
                <Typography variant="h2" sx={{ fontWeight: 'bold', color: isDarkMode ? '#fb923c' : '#f57c00', fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' } }}>
                  {stats.escalated}
                </Typography>
                <Typography variant="h6" sx={{ color: isDarkMode ? '#94a3b8' : 'text.secondary', fontSize: { xs: '0.7rem', sm: '0.85rem', md: '1rem' }, fontWeight: '600' }}>
                  Forwarded
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
        </MotionGrid>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1.1rem' },
                fontWeight: '600',
                minHeight: { xs: 48, sm: 56 },
                minWidth: { xs: 'auto', sm: 100 },
                px: { xs: 1, sm: 2 },
                color: isDarkMode ? '#b0b0b0' : '#666666',
                transition: 'all 0.3s ease',
                '&.Mui-selected': {
                  color: '#1976d2',
                  fontWeight: '700',
                  backgroundColor: isDarkMode ? 'rgba(25, 118, 210, 0.1)' : 'rgba(25, 118, 210, 0.08)',
                  borderRadius: '8px 8px 0 0'
                },
                '&:hover': {
                  color: '#1976d2',
                  backgroundColor: isDarkMode ? 'rgba(25, 118, 210, 0.05)' : 'rgba(25, 118, 210, 0.04)',
                  borderRadius: '8px 8px 0 0'
                }
              },
              '& .MuiTabs-indicator': {
                height: 4,
                backgroundColor: '#1976d2',
                borderRadius: '2px 2px 0 0'
              }
            }}
          >
            <Tab label="Dean" />
            <Tab label="Forwarded" />
            <Tab label="All" />
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
                  onClick={() => setFilterStatus('all')}
                >
                  All ({complaints.filter(c => c.status.toLowerCase() !== 'resolved' && c.status.toLowerCase() !== 'closed').length})
                </Button>
                <Button
                  variant={filterStatus === 'pending' ? 'contained' : 'outlined'}
                  size="small"
                  color="warning"
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}
                  onClick={() => setFilterStatus('pending')}
                >
                  Pending ({complaints.filter(c => c.status.toLowerCase() === 'pending').length})
                </Button>
              </Box>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchComplaints}
              >
                Refresh
              </Button>
            </Box>

            {/* Dean Level Complaints */}
            <Card>
              <CardContent sx={{ p: 0 }}>
                {loading ? (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography>Loading complaints...</Typography>
                  </Box>
                ) : complaints.filter(c => c.status.toLowerCase() !== 'resolved' && c.status.toLowerCase() !== 'closed').length === 0 ? (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <SupervisorAccount sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No pending Dean level complaints
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      All Dean level complaints have been resolved. Check the Completed tab to view resolved complaints.
                    </Typography>
                  </Box>
                ) : (() => {
                  const filteredComplaints = complaints
                    .filter(complaint => complaint.status.toLowerCase() !== 'resolved' && complaint.status.toLowerCase() !== 'closed')
                    .filter(complaint => {
                      if (filterStatus === 'all') return true
                      if (filterStatus === 'pending') return complaint.status.toLowerCase() === 'pending'
                      return true
                    })

                  return (
                    <List>
                      {filteredComplaints.map((complaint, index) => (
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
                                <SupervisorAccount />
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
                                    {complaint.workflow?.escalatedAt && (
                                      <Chip
                                        label="Forwarded"
                                        color="warning"
                                        size="small"
                                        variant="outlined"
                                      />
                                    )}
                                    {complaint.externalForward?.isForwarded && (
                                      <Chip
                                        label={`Forwarded to ${complaint.externalForward.forwardedTo}`}
                                        color="info"
                                        size="small"
                                        variant="outlined"
                                      />
                                    )}
                                    {complaint.externalForward?.acknowledged && (
                                      <Chip
                                        icon={<CheckCircle />}
                                        label={`Acknowledged by ${complaint.externalForward.forwardedTo}`}
                                        color="success"
                                        size="small"
                                      />
                                    )}
                                    <Typography variant="caption" color="text.secondary">
                                      {new Date(complaint.createdAt).toLocaleDateString()}
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
                                    sx={{
                                      '&:focus': {
                                        outline: 'none',
                                        boxShadow: 'none'
                                      },
                                      '&:hover': {
                                        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)'
                                      }
                                    }}
                                  >
                                    <Visibility />
                                  </IconButton>
                                </Tooltip>
                                {(() => {
                                  const isForwarded = complaint.externalForward?.isForwarded;
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
                                            sx={{
                                              '&:focus': {
                                                outline: 'none',
                                                boxShadow: 'none'
                                              },
                                              '&:hover': {
                                                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)'
                                              }
                                            }}
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
                                              '&:focus': {
                                                outline: 'none',
                                                boxShadow: 'none'
                                              },
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
                                              '&:focus': {
                                                outline: 'none',
                                                boxShadow: 'none'
                                              },
                                              '&:hover': {
                                                backgroundColor: isDarkMode ? 'rgba(244, 67, 54, 0.1)' : 'rgba(244, 67, 54, 0.04)'
                                              }
                                            }}
                                          >
                                            <Cancel />
                                          </IconButton>
                                        </Tooltip>
                                      )}
                                      {/* Show Forward to External button for all complaints */}
                                      {!isForwarded && (
                                        <Tooltip title={
                                          isResolved || isRejected
                                            ? 'Cannot forward resolved/rejected complaints'
                                            : 'Forward to External Department'
                                        }>
                                          <IconButton
                                            onClick={() => {
                                              setSelectedComplaint(complaint)
                                              setSelectedExternalDepartment('')
                                              setForwardReason('')
                                              setExternalForwardDialogOpen(true)
                                            }}
                                            disabled={isResolved || isRejected}
                                            sx={{
                                              '&:focus': {
                                                outline: 'none',
                                                boxShadow: 'none'
                                              },
                                              '&:hover': {
                                                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)'
                                              }
                                            }}
                                          >
                                            <Forward />
                                          </IconButton>
                                        </Tooltip>
                                      )}
                                      {/* Show Close button when external department has acknowledged */}
                                      {complaint.externalForward?.isForwarded &&
                                        complaint.externalForward?.acknowledged &&
                                        complaint.status.toLowerCase() !== 'closed' && (
                                          <Tooltip title="Close Complaint">
                                            <IconButton
                                              onClick={() => {
                                                setSelectedComplaint(complaint)
                                                setCloseDialogOpen(true)
                                              }}
                                              sx={{
                                                color: 'success.main',
                                                '&:focus': {
                                                  outline: 'none',
                                                  boxShadow: 'none'
                                                },
                                                '&:hover': {
                                                  backgroundColor: isDarkMode ? 'rgba(76, 175, 80, 0.1)' : 'rgba(76, 175, 80, 0.04)'
                                                }
                                              }}
                                            >
                                              <Done />
                                            </IconButton>
                                          </Tooltip>
                                        )}
                                      <Tooltip title={
                                        isForwarded
                                          ? 'No operations allowed on forwarded complaints'
                                          : isRejected
                                            ? 'No operations allowed on rejected complaints'
                                            : 'More Options'
                                      }>
                                        <span>
                                          <IconButton
                                            onClick={(e) => {
                                              setAnchorEl(e.currentTarget)
                                              setSelectedComplaint(complaint)
                                            }}
                                            disabled={isForwarded || isRejected}
                                            sx={{
                                              '&:focus': {
                                                outline: 'none',
                                                boxShadow: 'none'
                                              },
                                              '&:hover': {
                                                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)'
                                              }
                                            }}
                                          >
                                            <MoreVert />
                                          </IconButton>
                                        </span>
                                      </Tooltip>
                                    </>
                                  );
                                })()}
                              </Box>
                            </ListItemSecondaryAction>
                          </ListItem>
                          {index < filteredComplaints.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  )
                })()}
              </CardContent>
            </Card>
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              Forwarded Complaints
            </Typography>
            <Card>
              <CardContent sx={{ p: 0 }}>
                {escalatedComplaints.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Forward sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No forwarded complaints
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      All complaints are being handled at the appropriate level.
                    </Typography>
                  </Box>
                ) : (
                  <List>
                    {escalatedComplaints.map((complaint, index) => (
                      <React.Fragment key={complaint._id}>
                        <ListItem sx={{
                          py: { xs: 2, sm: 3 },
                          px: { xs: 1.5, sm: 3 },
                          flexDirection: { xs: 'column', sm: 'row' },
                          alignItems: 'flex-start',
                          position: 'relative'
                        }}>
                          <ListItemIcon sx={{ minWidth: { xs: 36, sm: 48 }, display: { xs: 'none', sm: 'flex' } }}>
                            <Avatar sx={{ bgcolor: 'warning.light' }}>
                              <Forward />
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
                                {complaint.workflow?.escalationReason && (
                                  <Typography variant="body2" sx={{ mb: 1, fontStyle: 'italic', color: 'warning.main' }}>
                                    Escalation Reason: {complaint.workflow.escalationReason}
                                  </Typography>
                                )}
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
                                    label="Forwarded"
                                    color="warning"
                                    size="small"
                                    variant="outlined"
                                  />
                                  {complaint.externalForward?.isForwarded && (
                                    <Chip
                                      label={`Forwarded to ${complaint.externalForward.forwardedTo}`}
                                      color="info"
                                      size="small"
                                      variant="outlined"
                                    />
                                  )}
                                  {complaint.externalForward?.acknowledged && (
                                    <Chip
                                      icon={<CheckCircle />}
                                      label={`Acknowledged by ${complaint.externalForward.forwardedTo}`}
                                      color="success"
                                      size="small"
                                    />
                                  )}
                                  <Typography variant="caption" color="text.secondary">
                                    Forwarded: {new Date(complaint.workflow?.escalatedAt).toLocaleDateString()}
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
                                  sx={{
                                    '&:focus': {
                                      outline: 'none',
                                      boxShadow: 'none'
                                    },
                                    '&:hover': {
                                      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)'
                                    }
                                  }}
                                >
                                  <Visibility />
                                </IconButton>
                              </Tooltip>
                              {(() => {
                                const isForwardedExternal = complaint.externalForward?.isForwarded;
                                const isRejected = complaint.status.toLowerCase() === 'rejected';
                                const isResolved = complaint.status.toLowerCase() === 'resolved' || complaint.status.toLowerCase() === 'closed';
                                const isDisabled = isForwardedExternal || isRejected || isResolved;

                                return (
                                  <>
                                    {/* Add Comment button */}
                                    <Tooltip title={
                                      isForwardedExternal
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
                                          sx={{
                                            '&:focus': {
                                              outline: 'none',
                                              boxShadow: 'none'
                                            },
                                            '&:hover': {
                                              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)'
                                            }
                                          }}
                                        >
                                          <Comment />
                                        </IconButton>
                                      </span>
                                    </Tooltip>
                                    {/* Quick Resolve button */}
                                    {!isForwardedExternal && !isResolved && !isRejected && (
                                      <Tooltip title="Mark as Resolved">
                                        <IconButton
                                          onClick={() => handleStatusUpdate(complaint._id, 'Resolved')}
                                          sx={{
                                            color: 'success.main',
                                            '&:focus': {
                                              outline: 'none',
                                              boxShadow: 'none'
                                            },
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
                                    {!isForwardedExternal && !isResolved && !isRejected && (
                                      <Tooltip title="Mark as Rejected">
                                        <IconButton
                                          onClick={() => handleStatusUpdate(complaint._id, 'Rejected')}
                                          sx={{
                                            color: 'error.main',
                                            '&:focus': {
                                              outline: 'none',
                                              boxShadow: 'none'
                                            },
                                            '&:hover': {
                                              backgroundColor: isDarkMode ? 'rgba(244, 67, 54, 0.1)' : 'rgba(244, 67, 54, 0.04)'
                                            }
                                          }}
                                        >
                                          <Cancel />
                                        </IconButton>
                                      </Tooltip>
                                    )}
                                    {/* Show Forward to External button for all complaints */}
                                    {!isForwardedExternal && (
                                      <Tooltip title={
                                        isResolved || isRejected
                                          ? 'Cannot forward resolved/rejected complaints'
                                          : 'Forward to External Department'
                                      }>
                                        <span>
                                          <IconButton
                                            onClick={() => {
                                              setSelectedComplaint(complaint)
                                              setSelectedExternalDepartment('')
                                              setForwardReason('')
                                              setExternalForwardDialogOpen(true)
                                            }}
                                            disabled={isResolved || isRejected}
                                            sx={{
                                              '&:focus': {
                                                outline: 'none',
                                                boxShadow: 'none'
                                              },
                                              '&:hover': {
                                                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)'
                                              }
                                            }}
                                          >
                                            <Forward />
                                          </IconButton>
                                        </span>
                                      </Tooltip>
                                    )}
                                    {/* Show Close button when external department has acknowledged */}
                                    {complaint.externalForward?.isForwarded &&
                                      complaint.externalForward?.acknowledged &&
                                      complaint.status.toLowerCase() !== 'closed' && (
                                        <Tooltip title="Close Complaint">
                                          <IconButton
                                            onClick={() => {
                                              setSelectedComplaint(complaint)
                                              setCloseDialogOpen(true)
                                            }}
                                            sx={{
                                              color: 'success.main',
                                              '&:focus': {
                                                outline: 'none',
                                                boxShadow: 'none'
                                              },
                                              '&:hover': {
                                                backgroundColor: isDarkMode ? 'rgba(76, 175, 80, 0.1)' : 'rgba(76, 175, 80, 0.04)'
                                              }
                                            }}
                                          >
                                            <Done />
                                          </IconButton>
                                        </Tooltip>
                                      )}
                                  </>
                                );
                              })()}
                            </Box>
                          </ListItemSecondaryAction>
                        </ListItem>
                        {index < escalatedComplaints.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Box>
        )}

        {activeTab === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              All Department Complaints
            </Typography>
            <TableContainer component={Card}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Student</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Assigned To</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allComplaints.map((complaint) => (
                    <TableRow key={complaint._id}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {complaint.title}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {complaint.student?.firstName} {complaint.student?.lastName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={complaint.category} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={complaint.priority}
                          size="small"
                          color={getPriorityColor(complaint.priority)}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={complaint.status}
                          size="small"
                          color={getStatusColor(complaint.status)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {complaint.assignedTo ?
                            `${complaint.assignedTo.firstName} ${complaint.assignedTo.lastName}` :
                            'Unassigned'
                          }
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(complaint.createdAt).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {(() => {
                            const isForwardedExternal = complaint.externalForward?.isForwarded;
                            const isRejected = complaint.status.toLowerCase() === 'rejected';
                            const isResolved = complaint.status.toLowerCase() === 'resolved' || complaint.status.toLowerCase() === 'closed';
                            const isDisabled = isForwardedExternal || isRejected || isResolved;

                            return (
                              <>
                                {/* View button */}
                                <Tooltip title="View Details">
                                  <IconButton
                                    onClick={() => {
                                      setSelectedComplaint(complaint)
                                      setViewDialogOpen(true)
                                    }}
                                    size="small"
                                    sx={{
                                      '&:focus': {
                                        outline: 'none',
                                        boxShadow: 'none'
                                      },
                                      '&:hover': {
                                        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)'
                                      }
                                    }}
                                  >
                                    <Visibility />
                                  </IconButton>
                                </Tooltip>
                                {/* Add Comment button */}
                                <Tooltip title={
                                  isForwardedExternal
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
                                      size="small"
                                      sx={{
                                        '&:focus': {
                                          outline: 'none',
                                          boxShadow: 'none'
                                        },
                                        '&:hover': {
                                          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)'
                                        }
                                      }}
                                    >
                                      <Comment />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                                {/* Quick Resolve button */}
                                {!isForwardedExternal && !isResolved && !isRejected && (
                                  <Tooltip title="Mark as Resolved">
                                    <IconButton
                                      onClick={() => handleStatusUpdate(complaint._id, 'Resolved')}
                                      size="small"
                                      sx={{
                                        color: 'success.main',
                                        '&:focus': {
                                          outline: 'none',
                                          boxShadow: 'none'
                                        },
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
                                {!isForwardedExternal && !isResolved && !isRejected && (
                                  <Tooltip title="Mark as Rejected">
                                    <IconButton
                                      onClick={() => handleStatusUpdate(complaint._id, 'Rejected')}
                                      size="small"
                                      sx={{
                                        color: 'error.main',
                                        '&:focus': {
                                          outline: 'none',
                                          boxShadow: 'none'
                                        },
                                        '&:hover': {
                                          backgroundColor: isDarkMode ? 'rgba(244, 67, 54, 0.1)' : 'rgba(244, 67, 54, 0.04)'
                                        }
                                      }}
                                    >
                                      <Cancel />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                {/* Show Forward to External button */}
                                {!isForwardedExternal && (
                                  <Tooltip title={
                                    isResolved || isRejected
                                      ? 'Cannot forward resolved/rejected complaints'
                                      : 'Forward to External Department'
                                  }>
                                    <span>
                                      <IconButton
                                        onClick={() => {
                                          setSelectedComplaint(complaint)
                                          setSelectedExternalDepartment('')
                                          setForwardReason('')
                                          setExternalForwardDialogOpen(true)
                                        }}
                                        disabled={isResolved || isRejected}
                                        size="small"
                                        sx={{
                                          '&:focus': {
                                            outline: 'none',
                                            boxShadow: 'none'
                                          },
                                          '&:hover': {
                                            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)'
                                          }
                                        }}
                                      >
                                        <Forward />
                                      </IconButton>
                                    </span>
                                  </Tooltip>
                                )}
                                {/* Show Close button when external department has acknowledged */}
                                {complaint.externalForward?.isForwarded &&
                                  complaint.externalForward?.acknowledged &&
                                  complaint.status.toLowerCase() !== 'closed' && (
                                    <Tooltip title="Close Complaint">
                                      <IconButton
                                        onClick={() => {
                                          setSelectedComplaint(complaint)
                                          setCloseDialogOpen(true)
                                        }}
                                        size="small"
                                        sx={{
                                          color: 'success.main',
                                          '&:focus': {
                                            outline: 'none',
                                            boxShadow: 'none'
                                          },
                                          '&:hover': {
                                            backgroundColor: isDarkMode ? 'rgba(76, 175, 80, 0.1)' : 'rgba(76, 175, 80, 0.04)'
                                          }
                                        }}
                                      >
                                        <Done />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                              </>
                            );
                          })()}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Completed Tab */}
        {activeTab === 3 && (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3, fontSize: '1.8rem' }}>
              Completed Complaints
            </Typography>

            {allComplaints && allComplaints.filter(c => c.status.toLowerCase() === 'resolved' || c.status.toLowerCase() === 'closed').length > 0 ? (
              <TableContainer component={Card}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Title</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Student</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Priority</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Resolved Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {allComplaints
                      .filter(c => c.status.toLowerCase() === 'resolved' || c.status.toLowerCase() === 'closed')
                      .map((complaint) => (
                        <TableRow key={complaint._id} sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}>
                          <TableCell sx={{ fontSize: '1rem' }}>
                            <Typography variant="body1" sx={{ fontWeight: '600' }}>
                              {complaint.title}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ fontSize: '1rem' }}>
                            <Typography variant="body2">
                              {complaint.student ? `${complaint.student.firstName} ${complaint.student.lastName}` : 'N/A'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {complaint.student?.rollNo || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ fontSize: '1rem' }}>
                            <Chip
                              label={complaint.category}
                              size="small"
                              sx={{ fontSize: '0.8rem' }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontSize: '1rem' }}>
                            <Chip
                              label={complaint.priority}
                              size="small"
                              color={complaint.priority === 'High' ? 'error' : complaint.priority === 'Medium' ? 'warning' : 'default'}
                              sx={{ fontSize: '0.8rem' }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontSize: '1rem' }}>
                            <Chip
                              label="Resolved"
                              color="success"
                              size="small"
                              sx={{ fontSize: '0.8rem' }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontSize: '1rem' }}>
                            {new Date(complaint.updatedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <IconButton
                              onClick={() => {
                                setSelectedComplaint(complaint)
                                setViewDialogOpen(true)
                              }}
                              sx={{
                                color: '#1976d2',
                                '&:focus': {
                                  outline: 'none',
                                  boxShadow: 'none'
                                },
                                '&:hover': {
                                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)'
                                }
                              }}
                            >
                              <Visibility />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
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

        {activeTab === 4 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', fontSize: '1.8rem' }}>
                Department Analytics
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
                      Distribution of complaints by category in {user?.department} department
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
                      Current status breakdown of all complaints
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

              {/* Department Performance Summary */}
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
                      Department Performance
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
                            {stats.escalated}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                            Forwarded
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
                            <Grid item xs={12} sm={6} md={4} key={index}>
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

                {/* External Forward Information */}
                {selectedComplaint.externalForward?.isForwarded && (
                  <>
                    <Divider sx={{ my: 2.5 }} />
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'text.primary', fontSize: '1.1rem' }}>
                        Forward Information
                      </Typography>
                      <Grid container spacing={2.5}>
                        <Grid item xs={12}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 500 }}>
                              Forwarded To
                            </Typography>
                            <Chip
                              label={selectedComplaint.externalForward.forwardedTo}
                              color="info"
                              size="small"
                              sx={{ mb: 1 }}
                            />
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

        {/* Forward to External Department Dialog */}
        <Dialog open={externalForwardDialogOpen} onClose={() => {
          setExternalForwardDialogOpen(false)
          setSelectedExternalDepartment('')
          setForwardReason('')
        }} maxWidth="sm" fullWidth>
          <DialogTitle>
            Forward to External Department
          </DialogTitle>
          <DialogContent>
            <Alert severity="info" sx={{ mb: 2 }}>
              Select the external department to forward this complaint to for handling.
            </Alert>
            <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
              <InputLabel>Select Department</InputLabel>
              <Select
                value={selectedExternalDepartment}
                label="Select Department"
                onChange={(e) => setSelectedExternalDepartment(e.target.value)}
                required
              >
                <MenuItem value="Librarian">Librarian</MenuItem>
                <MenuItem value="Accounts">Accounts</MenuItem>
                <MenuItem value="Maintenance">Maintenance</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={forwardReason}
              onChange={(e) => setForwardReason(e.target.value)}
              placeholder="Optional: Add a reason for forwarding this complaint..."
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setExternalForwardDialogOpen(false)
              setSelectedExternalDepartment('')
              setForwardReason('')
            }}>Cancel</Button>
            <Button
              onClick={handleForwardToExternal}
              variant="contained"
              color="primary"
              disabled={!selectedExternalDepartment}
            >
              Forward to {selectedExternalDepartment || 'Department'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Close External Complaint Dialog */}
        <Dialog open={closeDialogOpen} onClose={() => setCloseDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Close Complaint
          </DialogTitle>
          <DialogContent>
            <Alert severity="success" sx={{ mb: 2 }}>
              This complaint has been acknowledged by {selectedComplaint?.externalForward?.forwardedTo} Department.
              You can now close this complaint.
            </Alert>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={closeComment}
              onChange={(e) => setCloseComment(e.target.value)}
              placeholder="Optional: Add a closing comment..."
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setCloseDialogOpen(false)
              setCloseComment('')
            }}>Cancel</Button>
            <Button onClick={handleCloseExternalComplaint} variant="contained" color="success">
              Close Complaint
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
            const isForwarded = selectedComplaint?.externalForward?.isForwarded;
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
              </>
            );
          })()}
        </Menu>
      </Container>
    </>
  )
}
