import { Link } from 'react-router-dom'
import {
  AppBar,
  Box,
  Button,
  Toolbar,
  Typography,
  IconButton
} from '@mui/material'
import {
  LightMode,
  DarkMode,
  Home
} from '@mui/icons-material'
import { useTheme as useCustomTheme } from '../contexts/ThemeContext.jsx'

function AdminLoginNavbar() {
  const { isDarkMode, toggleTheme } = useCustomTheme()

  return (
    <AppBar 
      position="fixed" 
      elevation={0} 
      sx={{ 
        backgroundColor: isDarkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: isDarkMode ? '1px solid #333' : '1px solid rgba(0, 0, 0, 0.1)'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
        <Typography
          variant="h5"
          sx={{
            color: '#1976d2',
            fontWeight: 'bold',
            fontSize: '1.5rem'
          }}
        >
          E-Complaint Admin
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {/* Home Button */}
          <Button
            component={Link}
            to="/"
            startIcon={<Home sx={{ fontSize: '1.4rem' }} />}
            sx={{
              color: isDarkMode ? '#fff' : '#333',
              textTransform: 'none',
              fontWeight: '600',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.1)'
              }
            }}
          >
            Home
          </Button>

          {/* Theme Toggle */}
          <IconButton
            onClick={toggleTheme}
            sx={{
              color: 'primary.main',
              '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.1)' },
              '& .MuiSvgIcon-root': {
                fontSize: '1.8rem'
              }
            }}
          >
            {isDarkMode ? <LightMode /> : <DarkMode />}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default AdminLoginNavbar
