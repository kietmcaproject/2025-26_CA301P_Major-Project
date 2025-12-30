import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Avatar,
  Tooltip,
  Pagination,
  InputAdornment
} from '@mui/material'
import {
  Dashboard,
  People,
  AdminPanelSettings,
  Assignment,
  Analytics,
  Add,
  Edit,
  Delete,
  Visibility,
  Search,
  Refresh,
  TrendingUp,
  School,
  CheckCircle,
  Pending,
  Cancel,
  PersonAdd,
  BarChart,
  PieChart,
  Timeline,
  LockReset,
  VpnKey
} from '@mui/icons-material'
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts'
import { useAuth } from '../../auth/AuthContext.jsx'
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext.jsx'
import AdminNavbar from '../../components/AdminNavbar.jsx'
import api from '../../lib/api.js'
import * as XLSX from 'xlsx'

function SuperAdminDashboard() {
  const { user, logout } = useAuth()
  const { isDarkMode } = useCustomTheme()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Overview data
  const [overview, setOverview] = useState({
    totalStudents: 0,
    totalAdmins: 0,
    totalComplaints: 0,
    recentComplaints: 0
  })
  const [complaintsByStatus, setComplaintsByStatus] = useState([])
  const [complaintsByDepartment, setComplaintsByDepartment] = useState([])
  const [adminDistribution, setAdminDistribution] = useState([])

  // Students data
  const [students, setStudents] = useState([])
  const [studentsPage, setStudentsPage] = useState(1)
  const [studentsTotalPages, setStudentsTotalPages] = useState(1)
  const [studentsSearch, setStudentsSearch] = useState('')

  // Admins data
  const [admins, setAdmins] = useState([])
  const [adminDialogOpen, setAdminDialogOpen] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState(null)
  const [adminForm, setAdminForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'coordinator',
    department: ''
  })
  const [adminPasswordResetDialog, setAdminPasswordResetDialog] = useState(false)
  const [adminPasswordReset, setAdminPasswordReset] = useState({ id: null, newPassword: '' })

  // Students data - dialogs
  const [studentDialogOpen, setStudentDialogOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [studentForm, setStudentForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    libraryId: '',
    rollNo: '',
    department: '',
    year: '',
    password: ''
  })
  const [studentPasswordResetDialog, setStudentPasswordResetDialog] = useState(false)
  const [studentPasswordReset, setStudentPasswordReset] = useState({ id: null, newPassword: '' })

  // Complaints data
  const [complaints, setComplaints] = useState([])
  const [complaintsPage, setComplaintsPage] = useState(1)
  const [complaintsTotalPages, setComplaintsTotalPages] = useState(1)
  const [complaintsFilter, setComplaintsFilter] = useState({
    status: '',
    department: '',
    category: ''
  })
  const [complaintDialogOpen, setComplaintDialogOpen] = useState(false)
  const [editingComplaint, setEditingComplaint] = useState(null)
  const [complaintForm, setComplaintForm] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'Medium',
    status: 'Pending'
  })

  // Analytics data
  const [analytics, setAnalytics] = useState({
    monthlyTrends: [],
    resolutionTime: {},
    departmentPerformance: []
  })

  // Load dashboard data
  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const [overviewRes, studentsRes, adminsRes, complaintsRes, analyticsRes] = await Promise.all([
        api.get('/api/super-admin/overview'),
        api.get('/api/super-admin/students'),
        api.get('/api/super-admin/admins'),
        api.get('/api/super-admin/complaints'),
        api.get('/api/super-admin/analytics')
      ])

      setOverview(overviewRes.data.data.overview)
      setComplaintsByStatus(overviewRes.data.data.complaintsByStatus)
      setComplaintsByDepartment(overviewRes.data.data.complaintsByDepartment)
      setAdminDistribution(overviewRes.data.data.adminDistribution)

      setStudents(studentsRes.data.data.students)
      setStudentsTotalPages(studentsRes.data.data.pagination.totalPages)

      setAdmins(adminsRes.data.data.admins)

      setComplaints(complaintsRes.data.data.complaints)
      setComplaintsTotalPages(complaintsRes.data.data.pagination.totalPages)

      setAnalytics(analyticsRes.data.data)

      setError('')
    } catch (err) {
      setError('Failed to load dashboard data')
      console.error('Error loading dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  useEffect(() => {
    if (activeTab === 1) {
      loadStudents()
    }
  }, [studentsPage, studentsSearch, activeTab])

  useEffect(() => {
    if (activeTab === 3) {
      loadComplaints()
    }
  }, [complaintsPage, complaintsFilter, activeTab])

  const loadStudents = async () => {
    try {
      const { data } = await api.get('/api/super-admin/students', {
        params: {
          page: studentsPage,
          search: studentsSearch,
          limit: 10
        }
      })
      setStudents(data.data.students)
      setStudentsTotalPages(data.data.pagination.totalPages)
    } catch (err) {
      setError('Failed to load students')
    }
  }

  const loadComplaints = async () => {
    try {
      const { data } = await api.get('/api/super-admin/complaints', {
        params: {
          page: complaintsPage,
          status: complaintsFilter.status || undefined,
          department: complaintsFilter.department || undefined,
          category: complaintsFilter.category || undefined,
          limit: 10
        }
      })
      setComplaints(data.data.complaints)
      setComplaintsTotalPages(data.data.pagination.totalPages)
    } catch (err) {
      setError('Failed to load complaints')
    }
  }

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  // Handle admin form submission
  const handleAdminSubmit = async () => {
    try {
      if (editingAdmin) {
        // Remove empty password from update payload to avoid validation errors
        const updatePayload = { ...adminForm }
        if (!updatePayload.password || updatePayload.password.trim() === '') {
          delete updatePayload.password
        }
        await api.put(`/api/super-admin/admins/${editingAdmin._id}`, updatePayload)
        setSuccess('Admin updated successfully')
      } else {
        await api.post('/api/super-admin/admins', adminForm)
        setSuccess('Admin created successfully')
      }

      setAdminDialogOpen(false)
      setEditingAdmin(null)
      setAdminForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'coordinator',
        department: ''
      })
      loadDashboardData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save admin')
    }
  }

  // Handle admin deletion
  const handleDeleteAdmin = async (adminId) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      try {
        await api.delete(`/api/super-admin/admins/${adminId}`)
        setSuccess('Admin deleted successfully')
        loadDashboardData()
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete admin')
      }
    }
  }

  // Handle admin password reset
  const handleAdminPasswordReset = async () => {
    if (!adminPasswordReset.newPassword || adminPasswordReset.newPassword.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }
    try {
      await api.put(`/api/super-admin/admins/${adminPasswordReset.id}/reset-password`, {
        newPassword: adminPasswordReset.newPassword
      })
      setSuccess('Admin password reset successfully')
      setAdminPasswordResetDialog(false)
      setAdminPasswordReset({ id: null, newPassword: '' })
      loadDashboardData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset admin password')
    }
  }

  // Handle student form submission
  const handleStudentSubmit = async () => {
    try {
      if (editingStudent) {
        // Remove empty password from update payload to avoid validation errors
        const updatePayload = { ...studentForm }
        if (!updatePayload.password || updatePayload.password.trim() === '') {
          delete updatePayload.password
        }
        await api.put(`/api/super-admin/students/${editingStudent._id}`, updatePayload)
        setSuccess('Student updated successfully')
      } else {
        await api.post('/api/super-admin/students', studentForm)
        setSuccess('Student created successfully')
      }
      setStudentDialogOpen(false)
      setEditingStudent(null)
      setStudentForm({
        firstName: '',
        lastName: '',
        email: '',
        libraryId: '',
        rollNo: '',
        department: '',
        year: '',
        password: ''
      })
      loadStudents()
      loadDashboardData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save student')
    }
  }

  // Handle student deletion
  const handleDeleteStudent = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await api.delete(`/api/super-admin/students/${studentId}`)
        setSuccess('Student deleted successfully')
        loadStudents()
        loadDashboardData()
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete student')
      }
    }
  }

  // Handle student password reset
  const handleStudentPasswordReset = async () => {
    if (!studentPasswordReset.newPassword || studentPasswordReset.newPassword.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }
    try {
      await api.put(`/api/super-admin/students/${studentPasswordReset.id}/reset-password`, {
        newPassword: studentPasswordReset.newPassword
      })
      setSuccess('Student password reset successfully')
      setStudentPasswordResetDialog(false)
      setStudentPasswordReset({ id: null, newPassword: '' })
      loadStudents()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset student password')
    }
  }

  // Handle complaint form submission
  const handleComplaintSubmit = async () => {
    try {
      await api.put(`/api/super-admin/complaints/${editingComplaint._id}`, complaintForm)
      setSuccess('Complaint updated successfully')
      setComplaintDialogOpen(false)
      setEditingComplaint(null)
      setComplaintForm({
        title: '',
        description: '',
        category: '',
        priority: 'Medium',
        status: 'Pending'
      })
      loadComplaints()
      loadDashboardData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update complaint')
    }
  }

  // Handle complaint deletion
  const handleDeleteComplaint = async (complaintId) => {
    if (window.confirm('Are you sure you want to delete this complaint?')) {
      try {
        await api.delete(`/api/super-admin/complaints/${complaintId}`)
        setSuccess('Complaint deleted successfully')
        loadComplaints()
        loadDashboardData()
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete complaint')
      }
    }
  }

  // Handle export to Excel
  const handleExportToExcel = () => {
    try {
      const workbook = XLSX.utils.book_new()

      // Overview data
      const overviewData = [
        ['System Overview Report'],
        ['Generated on:', new Date().toLocaleDateString()],
        ['Generated by:', `${user?.firstName} ${user?.lastName}`],
        [''],
        ['Total Students:', overview.totalStudents],
        ['Total Admins:', overview.totalAdmins],
        ['Total Complaints:', overview.totalComplaints],
        ['Recent Complaints (7 days):', overview.recentComplaints],
        [''],
        ['Complaints by Status:'],
        ...complaintsByStatus.map(item => [item._id, item.count]),
        [''],
        ['Complaints by Department:'],
        ...complaintsByDepartment.map(item => [item._id, item.count]),
        [''],
        ['Admin Distribution:'],
        ...adminDistribution.map(item => [item._id, item.count])
      ]

      const overviewWS = XLSX.utils.aoa_to_sheet(overviewData)
      XLSX.utils.book_append_sheet(workbook, overviewWS, 'System Overview')

      // All complaints data
      if (complaints.length > 0) {
        const complaintsData = complaints.map(complaint => ({
          'Complaint ID': complaint._id,
          'Title': complaint.title,
          'Description': complaint.description,
          'Status': complaint.status,
          'Category': complaint.category,
          'Priority': complaint.priority,
          'Student Name': complaint.student ? `${complaint.student.firstName} ${complaint.student.lastName}` : 'N/A',
          'Student Email': complaint.student?.email || 'N/A',
          'Student Department': complaint.student?.department || 'N/A',
          'Assigned To': complaint.assignedTo ? `${complaint.assignedTo.firstName} ${complaint.assignedTo.lastName}` : 'N/A',
          'Created Date': new Date(complaint.createdAt).toLocaleDateString(),
          'Updated Date': new Date(complaint.updatedAt).toLocaleDateString()
        }))

        const complaintsWS = XLSX.utils.json_to_sheet(complaintsData)
        XLSX.utils.book_append_sheet(workbook, complaintsWS, 'All Complaints')
      }

      const filename = `SuperAdmin_Report_${new Date().toISOString().split('T')[0]}.xlsx`
      XLSX.writeFile(workbook, filename)
      setSuccess('Report exported successfully')
    } catch (err) {
      setError('Failed to export report')
      console.error('Export error:', err)
    }
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'resolved': return 'success'
      case 'in progress': return 'warning'
      case 'pending': return 'info'
      case 'rejected': return 'error'
      default: return 'default'
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'super_admin': return 'error'
      case 'hod': return 'primary'
      case 'additional_hod': return 'secondary'
      case 'dean': return 'warning'
      case 'coordinator': return 'info'
      case 'accounts': return 'success'
      case 'librarian': return 'secondary'
      case 'maintenance': return 'default'
      case 'external': return 'primary'
      default: return 'default'
    }
  }

  const getDepartmentColor = (index) => {
    const colors = [
      '#1976d2', // Blue
      '#2e7d32', // Green
      '#d32f2f', // Red
      '#f57c00', // Orange
      '#7b1fa2', // Purple
      '#00acc1', // Cyan
      '#5d4037', // Brown
      '#e91e63', // Pink
      '#795548', // Dark Brown
      '#607d8b'  // Blue Grey
    ]
    return colors[index % colors.length]
  }

  return (
    <>
      <AdminNavbar />
      <Container maxWidth="xl" sx={{ pt: { xs: 1, sm: 1.5, md: 2 }, pb: { xs: 2, sm: 3, md: 4 }, mt: { xs: 6, sm: 7 }, px: { xs: 1, sm: 2, md: 3 } }}>
        {/* Header */}
        <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2', fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
            Super Admin Dashboard
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1.2rem', md: '1.5rem' }, fontWeight: '500' }}>
            System-wide Management & Analytics
          </Typography>
        </Box>

        {/* Error/Success Messages */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Statistics Cards */}
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={6} md={3}>
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
              <CardContent sx={{ textAlign: 'center', p: { xs: 2, sm: 2.5, md: 3 } }}>
                <School sx={{ fontSize: { xs: 40, sm: 52, md: 64 }, color: isDarkMode ? '#22c55e' : '#2e7d32', mb: 2 }} />
                <Typography variant="h2" sx={{ fontWeight: 'bold', color: isDarkMode ? '#22c55e' : '#2e7d32', fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' } }}>
                  {overview.totalStudents}
                </Typography>
                <Typography variant="h6" sx={{ color: isDarkMode ? '#94a3b8' : 'text.secondary', fontSize: { xs: '0.75rem', sm: '1rem', md: '1.2rem' }, fontWeight: '600' }}>
                  Total Students
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={6} md={3}>
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
                  ? '0 8px 30px rgba(239, 68, 68, 0.3)'
                  : '0 8px 25px rgba(0, 0, 0, 0.15)'
              }
            }}>
              <CardContent sx={{ textAlign: 'center', p: { xs: 2, sm: 2.5, md: 3 } }}>
                <AdminPanelSettings sx={{ fontSize: { xs: 40, sm: 52, md: 64 }, color: isDarkMode ? '#ef4444' : '#d32f2f', mb: 2 }} />
                <Typography variant="h2" sx={{ fontWeight: 'bold', color: isDarkMode ? '#ef4444' : '#d32f2f', fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' } }}>
                  {overview.totalAdmins}
                </Typography>
                <Typography variant="h6" sx={{ color: isDarkMode ? '#94a3b8' : 'text.secondary', fontSize: { xs: '0.75rem', sm: '1rem', md: '1.2rem' }, fontWeight: '600' }}>
                  Total Admins
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={6} md={3}>
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
              <CardContent sx={{ textAlign: 'center', p: { xs: 2, sm: 2.5, md: 3 } }}>
                <Assignment sx={{ fontSize: { xs: 40, sm: 52, md: 64 }, color: isDarkMode ? '#60a5fa' : '#1976d2', mb: 2 }} />
                <Typography variant="h2" sx={{ fontWeight: 'bold', color: isDarkMode ? '#60a5fa' : '#1976d2', fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' } }}>
                  {overview.totalComplaints}
                </Typography>
                <Typography variant="h6" sx={{ color: isDarkMode ? '#94a3b8' : 'text.secondary', fontSize: { xs: '0.75rem', sm: '1rem', md: '1.2rem' }, fontWeight: '600' }}>
                  Total Complaints
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={6} md={3}>
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
                  ? '0 8px 30px rgba(245, 124, 0, 0.3)'
                  : '0 8px 25px rgba(0, 0, 0, 0.15)'
              }
            }}>
              <CardContent sx={{ textAlign: 'center', p: { xs: 2, sm: 2.5, md: 3 } }}>
                <TrendingUp sx={{ fontSize: { xs: 40, sm: 52, md: 64 }, color: isDarkMode ? '#fb923c' : '#f57c00', mb: 2 }} />
                <Typography variant="h2" sx={{ fontWeight: 'bold', color: isDarkMode ? '#fb923c' : '#f57c00', fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' } }}>
                  {overview.recentComplaints}
                </Typography>
                <Typography variant="h6" sx={{ color: isDarkMode ? '#94a3b8' : 'text.secondary', fontSize: { xs: '0.75rem', sm: '1rem', md: '1.2rem' }, fontWeight: '600' }}>
                  Recent (7 days)
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
                fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                fontWeight: '600',
                minHeight: 48,
                minWidth: { xs: 'auto', sm: 100 },
                px: { xs: 1, sm: 2 }
              }
            }}
          >
            <Tab label="Overview" />
            <Tab label="Students" />
            <Tab label="Admins" />
            <Tab label="Complaints" />
            <Tab label="Analytics" />
          </Tabs>
        </Box>

        {/* Tab Content */}
        {activeTab === 0 && (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3, fontSize: '1.8rem' }}>
              System Overview
            </Typography>

            <Grid container spacing={4}>
              {/* Complaints by Status */}
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                      Complaints by Status
                    </Typography>
                    {complaintsByStatus.map((item, index) => (
                      <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Chip label={item._id} color={getStatusColor(item._id)} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {item.count}
                        </Typography>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>

              {/* Complaints by Department */}
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                      Complaints by Department
                    </Typography>
                    {complaintsByDepartment.map((item, index) => (
                      <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="body1" sx={{ fontWeight: '500' }}>
                          {item._id}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {item.count}
                        </Typography>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', fontSize: '1.8rem' }}>
                Students Management
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  placeholder="Search students..."
                  value={studentsSearch}
                  onChange={(e) => setStudentsSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: 300 }}
                />
              </Box>
            </Box>

            <TableContainer component={Card} sx={{ borderRadius: '16px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Roll No</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Department</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student._id}>
                      <TableCell sx={{ fontSize: '1rem' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ backgroundColor: '#1976d2' }}>
                            {student.firstName[0]}{student.lastName[0]}
                          </Avatar>
                          <Typography variant="body1" sx={{ fontWeight: '600' }}>
                            {student.firstName} {student.lastName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontSize: '1rem' }}>{student.email}</TableCell>
                      <TableCell sx={{ fontSize: '1rem' }}>{student.rollNo}</TableCell>
                      <TableCell sx={{ fontSize: '1rem' }}>
                        <Chip label={student.department} size="small" />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Edit">
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingStudent(student)
                              setStudentForm({
                                firstName: student.firstName,
                                lastName: student.lastName,
                                email: student.email,
                                libraryId: student.libraryId,
                                rollNo: student.rollNo,
                                department: student.department,
                                year: String(student.year || ''),
                                password: ''
                              })
                              setStudentDialogOpen(true)
                            }}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reset Password">
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation()
                              setStudentPasswordReset({ id: student._id, newPassword: '' })
                              setStudentPasswordResetDialog(true)
                            }}
                            color="warning"
                          >
                            <LockReset />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteStudent(student._id)
                            }}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={studentsTotalPages}
                page={studentsPage}
                onChange={(event, page) => setStudentsPage(page)}
                color="primary"
              />
            </Box>
          </Box>
        )}

        {activeTab === 2 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', fontSize: '1.8rem' }}>
                Admins Management
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setAdminDialogOpen(true)}
                sx={{ fontWeight: 'bold' }}
              >
                Add Admin
              </Button>
            </Box>

            <TableContainer component={Card} sx={{ borderRadius: '16px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Department</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {admins.map((admin) => (
                    <TableRow key={admin._id}>
                      <TableCell sx={{ fontSize: '1rem' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ backgroundColor: getRoleColor(admin.role) + '.main' }}>
                            {admin.firstName[0]}{admin.lastName[0]}
                          </Avatar>
                          <Typography variant="body1" sx={{ fontWeight: '600' }}>
                            {admin.firstName} {admin.lastName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontSize: '1rem' }}>{admin.email}</TableCell>
                      <TableCell sx={{ fontSize: '1rem' }}>
                        <Chip label={admin.role} color={getRoleColor(admin.role)} size="small" />
                      </TableCell>
                      <TableCell sx={{ fontSize: '1rem' }}>
                        {admin.department ? <Chip label={admin.department} size="small" /> : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Edit">
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingAdmin(admin)
                              setAdminForm({
                                firstName: admin.firstName,
                                lastName: admin.lastName,
                                email: admin.email,
                                password: '',
                                role: admin.role,
                                department: admin.department || ''
                              })
                              setAdminDialogOpen(true)
                            }}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reset Password">
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation()
                              setAdminPasswordReset({ id: admin._id, newPassword: '' })
                              setAdminPasswordResetDialog(true)
                            }}
                            color="warning"
                          >
                            <LockReset />
                          </IconButton>
                        </Tooltip>
                        {admin.role !== 'super_admin' && (
                          <Tooltip title="Delete">
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteAdmin(admin._id)
                              }}
                              color="error"
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {activeTab === 3 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', fontSize: '1.8rem' }}>
                All Complaints
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={loadDashboardData}
                sx={{ fontWeight: 'bold' }}
              >
                Refresh
              </Button>
            </Box>

            <TableContainer component={Card} sx={{ borderRadius: '16px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Student</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Assigned To</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {complaints.map((complaint) => (
                    <TableRow key={complaint._id}>
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
                          {complaint.student?.department || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontSize: '1rem' }}>
                        <Chip label={complaint.status} color={getStatusColor(complaint.status)} size="small" />
                      </TableCell>
                      <TableCell sx={{ fontSize: '1rem' }}>
                        <Chip label={complaint.category} size="small" />
                      </TableCell>
                      <TableCell sx={{ fontSize: '1rem' }}>
                        {complaint.assignedTo ? (
                          <Typography variant="body2">
                            {complaint.assignedTo.firstName} {complaint.assignedTo.lastName}
                          </Typography>
                        ) : (
                          'Unassigned'
                        )}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Edit">
                          <IconButton
                            onClick={() => {
                              setEditingComplaint(complaint)
                              setComplaintForm({
                                title: complaint.title,
                                description: complaint.description,
                                category: complaint.category,
                                priority: complaint.priority,
                                status: complaint.status
                              })
                              setComplaintDialogOpen(true)
                            }}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            onClick={() => handleDeleteComplaint(complaint._id)}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {activeTab === 4 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', fontSize: '1.8rem' }}>
                System Analytics
              </Typography>
              <Button
                variant="contained"
                startIcon={<BarChart />}
                onClick={handleExportToExcel}
                sx={{ fontWeight: 'bold' }}
              >
                Export Report
              </Button>
            </Box>

            <Grid container spacing={4}>
              {/* Complaints by Department Pie Chart */}
              <Grid item xs={12} md={6}>
                <Card sx={{
                  borderRadius: '16px',
                  boxShadow: isDarkMode
                    ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                    : '0 4px 12px rgba(0, 0, 0, 0.1)',
                  backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
                  border: isDarkMode ? '1px solid #333' : 'none',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" gutterBottom sx={{
                      fontWeight: 'bold',
                      color: isDarkMode ? '#ffffff' : '#1976d2'
                    }}>
                      Complaints by Student Department
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Distribution of complaints received from students across different departments
                    </Typography>
                    <Box sx={{ height: 300, mt: 2, flex: 1 }}>
                      {console.log('Complaints by Department Data:', complaintsByDepartment)}
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={complaintsByDepartment}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {complaintsByDepartment.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={getDepartmentColor(index)} />
                            ))}
                          </Pie>
                          <RechartsTooltip
                            formatter={(value, name, props) => [value, 'Student Complaints']}
                            labelFormatter={(label, payload) => {
                              if (payload && payload.length > 0) {
                                return `Student Department: ${payload[0].payload._id}`;
                              }
                              return `Student Department: ${label}`;
                            }}
                            contentStyle={{
                              backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
                              border: isDarkMode ? '1px solid #333' : '1px solid #ccc',
                              borderRadius: '8px',
                              color: isDarkMode ? '#ffffff' : '#000000'
                            }}
                          />
                          <Legend
                            wrapperStyle={{
                              color: isDarkMode ? '#ffffff' : '#000000'
                            }}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Resolution Time */}
              <Grid item xs={12} md={6}>
                <Card sx={{
                  borderRadius: '16px',
                  boxShadow: isDarkMode
                    ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                    : '0 4px 12px rgba(0, 0, 0, 0.1)',
                  backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
                  border: isDarkMode ? '1px solid #333' : 'none',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" gutterBottom sx={{
                      fontWeight: 'bold',
                      color: isDarkMode ? '#ffffff' : '#1976d2'
                    }}>
                      Resolution Time Analytics
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Average time taken to resolve complaints across the system
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
                        mb: 3,
                        p: 2,
                        backgroundColor: isDarkMode ? 'rgba(25, 118, 210, 0.1)' : 'rgba(25, 118, 210, 0.05)',
                        borderRadius: 2
                      }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h4" sx={{
                            fontWeight: 'bold',
                            color: isDarkMode ? '#ffffff' : '#1976d2',
                            mb: 1
                          }}>
                            {analytics.resolutionTime.averageResolutionTime?.toFixed(1) || 0}
                          </Typography>
                          <Typography variant="body1" color="text.secondary">
                            Average Days
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Box sx={{ flex: 1, textAlign: 'center' }}>
                          <Typography variant="h6" sx={{
                            fontWeight: 'bold',
                            color: isDarkMode ? '#2e7d32' : '#2e7d32'
                          }}>
                            {analytics.resolutionTime.minResolutionTime?.toFixed(1) || 0}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Fastest
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1, textAlign: 'center' }}>
                          <Typography variant="h6" sx={{
                            fontWeight: 'bold',
                            color: isDarkMode ? '#d32f2f' : '#d32f2f'
                          }}>
                            {analytics.resolutionTime.maxResolutionTime?.toFixed(1) || 0}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Slowest
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Department Performance */}
              <Grid item xs={12} md={6}>
                <Card sx={{
                  borderRadius: '16px',
                  boxShadow: isDarkMode
                    ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                    : '0 4px 12px rgba(0, 0, 0, 0.1)',
                  backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
                  border: isDarkMode ? '1px solid #333' : 'none',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" gutterBottom sx={{
                      fontWeight: 'bold',
                      color: isDarkMode ? '#ffffff' : '#1976d2'
                    }}>
                      Department Performance
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Resolution rates and performance metrics by department
                    </Typography>
                    <Box sx={{ flex: 1, mt: 2 }}>
                      {analytics.departmentPerformance.map((dept, index) => (
                        <Box key={index} sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 3,
                          p: 2,
                          backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.02)',
                          borderRadius: 2,
                          border: isDarkMode ? '1px solid #333' : '1px solid rgba(0, 0, 0, 0.05)'
                        }}>
                          <Box>
                            <Typography variant="body1" sx={{
                              fontWeight: '600',
                              color: isDarkMode ? '#ffffff' : '#000000'
                            }}>
                              {dept.department}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {dept.resolvedComplaints}/{dept.totalComplaints} resolved
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="h6" sx={{
                              fontWeight: 'bold',
                              color: dept.resolutionRate >= 80 ? (isDarkMode ? '#2e7d32' : '#2e7d32') :
                                dept.resolutionRate >= 60 ? (isDarkMode ? '#f57c00' : '#f57c00') :
                                  (isDarkMode ? '#d32f2f' : '#d32f2f')
                            }}>
                              {dept.resolutionRate?.toFixed(1)}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Success Rate
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Admin Dialog */}
        <Dialog open={adminDialogOpen} onClose={() => setAdminDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingAdmin ? 'Edit Admin' : 'Add New Admin'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <TextField
                label="First Name"
                value={adminForm.firstName}
                onChange={(e) => setAdminForm({ ...adminForm, firstName: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="Last Name"
                value={adminForm.lastName}
                onChange={(e) => setAdminForm({ ...adminForm, lastName: e.target.value })}
                fullWidth
                required
              />
            </Box>

            <TextField
              label="Email"
              type="email"
              value={adminForm.email}
              onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
              fullWidth
              required
              sx={{ mt: 2 }}
            />

            {!editingAdmin && (
              <TextField
                label="Password"
                type="password"
                value={adminForm.password}
                onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                fullWidth
                required
                sx={{ mt: 2 }}
              />
            )}

            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={adminForm.role}
                label="Role"
                onChange={(e) => setAdminForm({ ...adminForm, role: e.target.value, department: '' })}
              >
                <MenuItem value="coordinator">Coordinator</MenuItem>
                <MenuItem value="additional_hod">Additional HOD</MenuItem>
                <MenuItem value="dean">Dean</MenuItem>
                <MenuItem value="external">External Department</MenuItem>
              </Select>
            </FormControl>

            {adminForm.role === 'external' ? (
              <TextField
                label="Department Name"
                value={adminForm.department}
                onChange={(e) => setAdminForm({ ...adminForm, department: e.target.value })}
                fullWidth
                required
                sx={{ mt: 2 }}
                placeholder="e.g., Accounts, Lab, Registrar, Library"
                helperText="Enter the name of the external department"
              />
            ) : adminForm.role !== 'super_admin' && (
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Department</InputLabel>
                <Select
                  value={adminForm.department}
                  label="Department"
                  onChange={(e) => setAdminForm({ ...adminForm, department: e.target.value })}
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
              </FormControl>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAdminDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAdminSubmit} variant="contained">
              {editingAdmin ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Student Dialog */}
        <Dialog open={studentDialogOpen} onClose={() => setStudentDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingStudent ? 'Edit Student' : 'Add New Student'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <TextField
                label="First Name"
                value={studentForm.firstName}
                onChange={(e) => setStudentForm({ ...studentForm, firstName: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="Last Name"
                value={studentForm.lastName}
                onChange={(e) => setStudentForm({ ...studentForm, lastName: e.target.value })}
                fullWidth
                required
              />
            </Box>
            <TextField
              label="Email"
              type="email"
              value={studentForm.email}
              onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
              fullWidth
              required
              sx={{ mt: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <TextField
                label="Library ID"
                value={studentForm.libraryId}
                onChange={(e) => setStudentForm({ ...studentForm, libraryId: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="Roll No"
                value={studentForm.rollNo}
                onChange={(e) => setStudentForm({ ...studentForm, rollNo: e.target.value })}
                fullWidth
                required
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  value={studentForm.department}
                  label="Department"
                  onChange={(e) => {
                    const newDept = e.target.value
                    // Reset year if switching to 2-year program and current year > 2
                    const isTwoYearProgram = ['MCA', 'MBA'].includes(newDept)
                    const currentYear = parseInt(studentForm.year)
                    const newYear = (isTwoYearProgram && currentYear > 2) ? '2' : studentForm.year
                    setStudentForm({ ...studentForm, department: newDept, year: newYear })
                  }}
                >
                  <MenuItem value="MCA">MCA</MenuItem>
                  <MenuItem value="MBA">MBA</MenuItem>
                  <MenuItem value="CSE">CSE</MenuItem>
                  <MenuItem value="Electronics">Electronics</MenuItem>
                  <MenuItem value="Mechanical">Mechanical</MenuItem>
                  <MenuItem value="Civil">Civil</MenuItem>
                  <MenuItem value="Electrical">Electrical</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth key={`year-${studentForm.department}`}>
                <InputLabel>Year</InputLabel>
                <Select
                  value={studentForm.year}
                  label="Year"
                  onChange={(e) => setStudentForm({ ...studentForm, year: e.target.value })}
                >
                  <MenuItem value="1">1st Year</MenuItem>
                  <MenuItem value="2">2nd Year</MenuItem>
                  {!['MCA', 'MBA'].includes(studentForm.department) && (
                    <>
                      <MenuItem value="3">3rd Year</MenuItem>
                      <MenuItem value="4">4th Year</MenuItem>
                    </>
                  )}
                </Select>
              </FormControl>
            </Box>
            {!editingStudent && (
              <TextField
                label="Password"
                type="password"
                value={studentForm.password}
                onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                fullWidth
                required
                sx={{ mt: 2 }}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setStudentDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleStudentSubmit} variant="contained">
              {editingStudent ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Student Password Reset Dialog */}
        <Dialog open={studentPasswordResetDialog} onClose={() => setStudentPasswordResetDialog(false)}>
          <DialogTitle>Reset Student Password</DialogTitle>
          <DialogContent>
            <TextField
              label="New Password"
              type="password"
              value={studentPasswordReset.newPassword}
              onChange={(e) => setStudentPasswordReset({ ...studentPasswordReset, newPassword: e.target.value })}
              fullWidth
              required
              sx={{ mt: 2 }}
              helperText="Password must be at least 8 characters long"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setStudentPasswordResetDialog(false)}>Cancel</Button>
            <Button onClick={handleStudentPasswordReset} variant="contained" color="warning">
              Reset Password
            </Button>
          </DialogActions>
        </Dialog>

        {/* Admin Password Reset Dialog */}
        <Dialog open={adminPasswordResetDialog} onClose={() => setAdminPasswordResetDialog(false)}>
          <DialogTitle>Reset Admin Password</DialogTitle>
          <DialogContent>
            <TextField
              label="New Password"
              type="password"
              value={adminPasswordReset.newPassword}
              onChange={(e) => setAdminPasswordReset({ ...adminPasswordReset, newPassword: e.target.value })}
              fullWidth
              required
              sx={{ mt: 2 }}
              helperText="Password must be at least 8 characters long"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAdminPasswordResetDialog(false)}>Cancel</Button>
            <Button onClick={handleAdminPasswordReset} variant="contained" color="warning">
              Reset Password
            </Button>
          </DialogActions>
        </Dialog>

        {/* Complaint Dialog */}
        <Dialog open={complaintDialogOpen} onClose={() => setComplaintDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Edit Complaint</DialogTitle>
          <DialogContent>
            <TextField
              label="Title"
              value={complaintForm.title}
              onChange={(e) => setComplaintForm({ ...complaintForm, title: e.target.value })}
              fullWidth
              required
              sx={{ mt: 2 }}
            />
            <TextField
              label="Description"
              value={complaintForm.description}
              onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })}
              fullWidth
              multiline
              rows={4}
              required
              sx={{ mt: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={complaintForm.category}
                  label="Category"
                  onChange={(e) => setComplaintForm({ ...complaintForm, category: e.target.value })}
                >
                  <MenuItem value="Academic">Academic</MenuItem>
                  <MenuItem value="Infrastructure">Infrastructure</MenuItem>
                  <MenuItem value="Library">Library</MenuItem>
                  <MenuItem value="Hostel">Hostel</MenuItem>
                  <MenuItem value="Cafeteria">Cafeteria</MenuItem>
                  <MenuItem value="Transport">Transport</MenuItem>
                  <MenuItem value="Faculty">Faculty</MenuItem>
                  <MenuItem value="Administration">Administration</MenuItem>
                  <MenuItem value="Examination">Examination</MenuItem>
                  <MenuItem value="Fee">Fee</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={complaintForm.priority}
                  label="Priority"
                  onChange={(e) => setComplaintForm({ ...complaintForm, priority: e.target.value })}
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={complaintForm.status}
                label="Status"
                onChange={(e) => setComplaintForm({ ...complaintForm, status: e.target.value })}
              >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Resolved">Resolved</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
                <MenuItem value="Closed">Closed</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setComplaintDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleComplaintSubmit} variant="contained">
              Update
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  )
}

export default SuperAdminDashboard

