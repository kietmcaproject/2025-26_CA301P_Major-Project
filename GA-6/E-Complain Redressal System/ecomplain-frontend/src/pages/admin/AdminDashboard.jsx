import React from 'react'
import { useAuth } from '../../auth/AuthContext.jsx'
import AssistantHODDashboard from './AdditionalHODDashboard.jsx'
import CoordinatorDashboard from './CoordinatorDashboard.jsx'
import DeanDashboard from './DeanDashboard.jsx'
import SuperAdminDashboard from './SuperAdminDashboard.jsx'
import ExternalDepartmentDashboard from './ExternalDepartmentDashboard.jsx'
import { Box, Typography, Container, Alert } from '@mui/material'
import { AdminPanelSettings } from '@mui/icons-material'

export default function AdminDashboard() {
  const { user } = useAuth()

  // Show loading or error state if user is not loaded
  if (!user) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6">Loading...</Typography>
      </Box>
      </Container>
    )
  }

  // Route to appropriate dashboard based on role
  switch (user.role) {
    case 'coordinator':
      return <CoordinatorDashboard />
    case 'additional_hod':
      return <AssistantHODDashboard />
    
    case 'dean':
      return <DeanDashboard />
    
    case 'super_admin':
      return <SuperAdminDashboard />
    
    case 'accounts':
    case 'librarian':
    case 'maintenance':
    case 'external':
      return <ExternalDepartmentDashboard />
    
    default:
      return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert severity="error">
            Invalid admin role. Please contact system administrator.
          </Alert>
    </Container>
  )
  }
}