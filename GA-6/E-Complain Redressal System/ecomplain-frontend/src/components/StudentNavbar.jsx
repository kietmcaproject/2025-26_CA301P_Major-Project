import { useNavigate } from 'react-router-dom'
import {
  AppBar,
  Box,
  Button,
  Toolbar,
  Typography,
  IconButton,
  useMediaQuery,
  useTheme
} from '@mui/material'
import {
  LightMode,
  DarkMode,
  Logout,
  Person
} from '@mui/icons-material'
import { useTheme as useCustomTheme } from '../contexts/ThemeContext.jsx'
import { useAuth } from '../auth/AuthContext.jsx'

function StudentNavbar() {
  const { isDarkMode, toggleTheme } = useCustomTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const handleLogout = () => {
    logout()
    navigate('/')
  }

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
      <Toolbar sx={{ justifyContent: 'space-between', py: 1, px: { xs: 1, sm: 2 } }}>
        <Typography
          variant="h5"
          sx={{
            color: '#1976d2',
            fontWeight: 'bold',
            fontSize: { xs: '1.1rem', sm: '1.5rem' }
          }}
        >
          E-Complaint
        </Typography>

        <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 2 }, alignItems: 'center' }}>
          {/* Student Name - Hide on very small screens */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person sx={{ color: '#1976d2', fontSize: '1.2rem' }} />
              <Typography
                variant="body1"
                sx={{
                  color: isDarkMode ? '#fff' : '#333',
                  fontWeight: '600',
                  fontSize: '1rem',
                  maxWidth: 150,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {user?.name || 'Student'}
              </Typography>
            </Box>
          )}

          {/* Theme Toggle */}
          <IconButton
            onClick={toggleTheme}
            sx={{
              color: 'primary.main',
              '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.1)' }
            }}
          >
            {isDarkMode ? <LightMode /> : <DarkMode />}
          </IconButton>

          {/* Logout Button */}
          <Button
            variant="contained"
            onClick={handleLogout}
            startIcon={!isMobile && <Logout />}
            sx={{
              fontWeight: 'bold',
              backgroundColor: '#d32f2f',
              color: 'white',
              px: { xs: 1.5, sm: 2 },
              py: { xs: 0.75, sm: 1 },
              borderRadius: 2,
              fontSize: { xs: '0.85rem', sm: '1rem' },
              minWidth: { xs: 'auto', sm: 100 },
              '&:hover': {
                backgroundColor: '#b71c1c',
                color: 'white',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(211, 47, 47, 0.4)',
                scale: '1.05'
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:active': {
                transform: 'translateY(0px)',
                scale: '1.02'
              }
            }}
          >
            {isMobile ? <Logout /> : 'Logout'}
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default StudentNavbar

