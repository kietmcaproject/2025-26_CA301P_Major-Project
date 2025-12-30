import { Link as RouterLink } from 'react-router-dom'
import {
  Box,
  Grid,
  Typography,
  Button
} from '@mui/material'
import {
  Email,
  Phone,
  LocationOn
} from '@mui/icons-material'
import { useTheme as useCustomTheme } from '../contexts/ThemeContext.jsx'

function Footer() {
  const { isDarkMode } = useCustomTheme()

  return (
    <Box
      sx={{
        backgroundColor: isDarkMode ? '#0a0a0a' : '#1a1a1a',
        color: 'white',
        py: { xs: 3, md: 4 },
        // Removed width and marginLeft to fix white space below footer
        // width: '100vw',
        // marginLeft: 'calc(-50vw + 50%)',
        px: { xs: 2, sm: 3, md: 4 },
        marginTop: 'auto',
        marginBottom: 0,
        minHeight: 'fit-content',
        flexShrink: 0
      }}
    >
      <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
        <Grid container spacing={{ xs: 4, md: 8 }} sx={{ justifyContent: 'space-between' }}>
          {/* Contact Info - Left Side */}
          <Grid item xs={12} sm={4} md={3.5}>
            <Typography
              variant="h6"
              component="h4"
              gutterBottom
              sx={{
                fontWeight: 'bold',
                color: 'white',
                mb: { xs: 2, md: 3 },
                fontSize: { xs: '1rem', md: '1.2rem' },
                textAlign: { xs: 'center', sm: 'left' }
              }}
            >
              Contact Information
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, md: 2 }, alignItems: { xs: 'center', sm: 'flex-start' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Email sx={{ color: '#1976d2', fontSize: { xs: 20, md: 24 } }} />
                <Typography variant="body2" sx={{ color: '#b0b0b0', fontSize: { xs: '0.95rem', md: '1.1rem' } }}>
                  support@university.edu
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Phone sx={{ color: '#1976d2', fontSize: { xs: 20, md: 24 } }} />
                <Typography variant="body2" sx={{ color: '#b0b0b0', fontSize: { xs: '0.95rem', md: '1.1rem' } }}>
                  +91 120 232 2020
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <LocationOn sx={{ color: '#1976d2', fontSize: { xs: 20, md: 24 }, mt: 0.5 }} />
                <Typography variant="body2" sx={{ color: '#b0b0b0', fontSize: { xs: '0.95rem', md: '1.1rem' }, lineHeight: 1.5, textAlign: { xs: 'center', sm: 'left' } }}>
                  Delhi-NCR<br />
                  Ghaziabad<br />
                  Uttar Pradesh 201206
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Services - Center */}
          <Grid item xs={12} sm={4} md={3.5}>
            <Typography
              variant="h6"
              component="h4"
              gutterBottom
              sx={{
                fontWeight: 'bold',
                color: 'white',
                mb: { xs: 2, md: 3 },
                fontSize: { xs: '1rem', md: '1.2rem' },
                textAlign: { xs: 'center', sm: 'left' }
              }}
            >
              Our Services
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1, md: 1.5 }, alignItems: { xs: 'center', sm: 'flex-start' } }}>
              <Typography variant="body2" sx={{ color: '#b0b0b0', fontSize: { xs: '0.9rem', md: '1.1rem' }, py: 0.5 }}>
                Complaint Submission
              </Typography>
              <Typography variant="body2" sx={{ color: '#b0b0b0', fontSize: { xs: '0.9rem', md: '1.1rem' }, py: 0.5 }}>
                Real-time Tracking
              </Typography>
              <Typography variant="body2" sx={{ color: '#b0b0b0', fontSize: { xs: '0.9rem', md: '1.1rem' }, py: 0.5 }}>
                Status Updates
              </Typography>
              <Typography variant="body2" sx={{ color: '#b0b0b0', fontSize: { xs: '0.9rem', md: '1.1rem' }, py: 0.5 }}>
                Document Upload
              </Typography>
              <Typography variant="body2" sx={{ color: '#b0b0b0', fontSize: { xs: '0.9rem', md: '1.1rem' }, py: 0.5 }}>
                Analytics Dashboard
              </Typography>
            </Box>
          </Grid>

          {/* Quick Links - Right Side */}
          <Grid item xs={12} sm={4} md={3.5}>
            <Typography
              variant="h6"
              component="h4"
              gutterBottom
              sx={{
                fontWeight: 'bold',
                color: 'white',
                mb: { xs: 2, md: 3 },
                fontSize: { xs: '1rem', md: '1.2rem' },
                textAlign: { xs: 'center', sm: 'left' }
              }}
            >
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1, md: 1.5 }, alignItems: { xs: 'center', sm: 'flex-start' } }}>
              <Button
                component={RouterLink}
                to="/"
                sx={{
                  color: '#b0b0b0',
                  justifyContent: 'flex-start',
                  textTransform: 'none',
                  fontSize: { xs: '0.9rem', md: '1.1rem' },
                  fontWeight: 'medium',
                  py: 1,
                  px: 0,
                  '&:hover': {
                    color: '#1976d2',
                    backgroundColor: 'rgba(25, 118, 210, 0.1)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Home
              </Button>
              <Button
                component={RouterLink}
                to="/about"
                sx={{
                  color: '#b0b0b0',
                  justifyContent: 'flex-start',
                  textTransform: 'none',
                  fontSize: { xs: '0.9rem', md: '1.1rem' },
                  fontWeight: 'medium',
                  py: 1,
                  px: 0,
                  '&:hover': {
                    color: '#1976d2',
                    backgroundColor: 'rgba(25, 118, 210, 0.1)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                About
              </Button>
              <Button
                component={RouterLink}
                to="/register"
                sx={{
                  color: '#b0b0b0',
                  justifyContent: 'flex-start',
                  textTransform: 'none',
                  fontSize: { xs: '0.9rem', md: '1.1rem' },
                  fontWeight: 'medium',
                  py: 1,
                  px: 0,
                  '&:hover': {
                    color: '#1976d2',
                    backgroundColor: 'rgba(25, 118, 210, 0.1)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Register
              </Button>
              <Button
                component={RouterLink}
                to="/login"
                sx={{
                  color: '#b0b0b0',
                  justifyContent: 'flex-start',
                  textTransform: 'none',
                  fontSize: { xs: '0.9rem', md: '1.1rem' },
                  fontWeight: 'medium',
                  py: 1,
                  px: 0,
                  '&:hover': {
                    color: '#1976d2',
                    backgroundColor: 'rgba(25, 118, 210, 0.1)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Login
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Bottom Bar */}
        <Box
          sx={{
            borderTop: '1px solid #333',
            mt: 3,
            pt: 2,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Typography variant="body2" sx={{ color: '#999', fontSize: { xs: '0.85rem', md: '1rem' }, textAlign: 'center' }}>
            © 2025 Abhijeet singh. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: { xs: 2, md: 4 }, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button
              sx={{
                color: '#999',
                textTransform: 'none',
                fontSize: { xs: '0.85rem', md: '1rem' },
                fontWeight: 'medium',
                '&:hover': {
                  color: '#1976d2',
                  backgroundColor: 'rgba(25, 118, 210, 0.1)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Privacy Policy
            </Button>
            <Button
              sx={{
                color: '#999',
                textTransform: 'none',
                fontSize: { xs: '0.85rem', md: '1rem' },
                fontWeight: 'medium',
                '&:hover': {
                  color: '#1976d2',
                  backgroundColor: 'rgba(25, 118, 210, 0.1)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Terms of Service
            </Button>
            <Button
              sx={{
                color: '#999',
                textTransform: 'none',
                fontSize: { xs: '0.85rem', md: '1rem' },
                fontWeight: 'medium',
                '&:hover': {
                  color: '#1976d2',
                  backgroundColor: 'rgba(25, 118, 210, 0.1)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Help Center
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default Footer
