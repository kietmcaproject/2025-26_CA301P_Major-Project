import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  AppBar,
  Box,
  Button,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material'
import {
  LightMode,
  DarkMode,
  Menu as MenuIcon,
  Close as CloseIcon,
  Home,
  Info,
  PersonAdd,
  Login,
  AdminPanelSettings
} from '@mui/icons-material'
import { useTheme as useCustomTheme } from '../contexts/ThemeContext.jsx'

function Header() {
  const { isDarkMode, toggleTheme } = useCustomTheme()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const navItems = [
    { label: 'Home', path: '/', icon: <Home /> },
    { label: 'About', path: '/about', icon: <Info /> },
    { label: 'Register', path: '/register', icon: <PersonAdd /> },
    { label: 'Login', path: '/login', icon: <Login /> },
  ]

  const drawer = (
    <Box sx={{
      width: 280,
      height: '100%',
      backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
    }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 2,
        borderBottom: isDarkMode ? '1px solid #333' : '1px solid #e0e0e0'
      }}>
        <Typography
          variant="h6"
          sx={{
            color: '#1976d2',
            fontWeight: 'bold',
          }}
        >
          E-Complaint
        </Typography>
        <IconButton onClick={handleDrawerToggle} sx={{ color: isDarkMode ? '#fff' : '#333' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <List sx={{ pt: 2 }}>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton
              component={RouterLink}
              to={item.path}
              onClick={handleDrawerToggle}
              sx={{
                py: 1.5,
                px: 3,
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.1)',
                },
              }}
            >
              <Box sx={{ color: '#1976d2', mr: 2, display: 'flex' }}>
                {item.icon}
              </Box>
              <ListItemText
                primary={item.label}
                sx={{
                  '& .MuiListItemText-primary': {
                    fontWeight: 600,
                    color: isDarkMode ? '#fff' : '#333'
                  }
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 2, borderColor: isDarkMode ? '#333' : '#e0e0e0' }} />

      <Box sx={{ px: 3, py: 1 }}>
        <Button
          variant="contained"
          component={RouterLink}
          to="/admin/login"
          onClick={handleDrawerToggle}
          fullWidth
          startIcon={<AdminPanelSettings />}
          sx={{
            fontWeight: 'bold',
            backgroundColor: '#1976d2',
            color: 'white',
            py: 1.5,
            borderRadius: 2,
            '&:hover': {
              backgroundColor: '#1565c0',
            },
          }}
        >
          Admin Login
        </Button>
      </Box>

      <Box sx={{ px: 3, py: 2 }}>
        <Button
          variant="outlined"
          onClick={() => {
            toggleTheme()
          }}
          fullWidth
          startIcon={isDarkMode ? <LightMode /> : <DarkMode />}
          sx={{
            fontWeight: 600,
            py: 1.5,
            borderRadius: 2,
            color: isDarkMode ? '#fff' : '#333',
            borderColor: isDarkMode ? '#444' : '#ccc',
            '&:hover': {
              backgroundColor: 'rgba(25, 118, 210, 0.1)',
              borderColor: '#1976d2',
            },
          }}
        >
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </Button>
      </Box>
    </Box>
  )

  return (
    <>
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
            component={RouterLink}
            to="/"
            sx={{
              color: '#1976d2',
              fontWeight: 'bold',
              textDecoration: 'none',
              fontSize: { xs: '1.2rem', sm: '1.5rem' }
            }}
          >
            E-Complaint
          </Typography>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  color="primary"
                  component={RouterLink}
                  to={item.path}
                  sx={{
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.1)' }
                  }}
                >
                  {item.label}
                </Button>
              ))}
              <Button
                variant="contained"
                component={RouterLink}
                to="/admin/login"
                sx={{
                  fontWeight: 'bold',
                  ml: 1,
                  backgroundColor: '#1976d2',
                  color: 'white',
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: '#1565c0',
                    color: 'white',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(25, 118, 210, 0.4)',
                    scale: '1.05'
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:active': {
                    transform: 'translateY(0px)',
                    scale: '1.02'
                  }
                }}
              >
                Admin
              </Button>
              <IconButton
                onClick={toggleTheme}
                sx={{
                  ml: 1,
                  color: 'primary.main',
                  '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.1)' }
                }}
              >
                {isDarkMode ? <LightMode /> : <DarkMode />}
              </IconButton>
            </Box>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                onClick={toggleTheme}
                sx={{
                  color: 'primary.main',
                  '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.1)' }
                }}
              >
                {isDarkMode ? <LightMode /> : <DarkMode />}
              </IconButton>
              <IconButton
                color="primary"
                aria-label="open navigation menu"
                onClick={handleDrawerToggle}
                sx={{
                  '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.1)' }
                }}
              >
                <MenuIcon sx={{ fontSize: '1.8rem' }} />
              </IconButton>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
            backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  )
}

export default Header
