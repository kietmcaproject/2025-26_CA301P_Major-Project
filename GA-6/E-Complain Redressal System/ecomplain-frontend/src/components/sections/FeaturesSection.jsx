import { Box, Typography, Grid, Card, CardContent, alpha } from '@mui/material'
import {
  Assignment,
  Timeline,
  AdminPanelSettings,
  Notifications,
  Analytics,
  Security
} from '@mui/icons-material'
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext.jsx'
import { useTheme } from '@mui/material/styles'

function FeaturesSection() {
  const { isDarkMode } = useCustomTheme()
  const theme = useTheme()

  const features = [
    {
      icon: <Assignment sx={{ fontSize: 40 }} />,
      title: 'Easy Complaint Submission',
      description: 'Submit complaints quickly with our intuitive form. Categorize issues and track progress in real-time.',
      color: '#1976d2',
      gradient: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)'
    },
    {
      icon: <Timeline sx={{ fontSize: 40 }} />,
      title: 'Real-time Tracking',
      description: 'Monitor your complaint status from submission to resolution with detailed progress updates.',
      color: '#2e7d32',
      gradient: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)'
    },
    {
      icon: <AdminPanelSettings sx={{ fontSize: 40 }} />,
      title: 'Admin Dashboard',
      description: 'Comprehensive admin panel for HODs and Assistant HODs to manage and resolve complaints efficiently.',
      color: '#ed6c02',
      gradient: 'linear-gradient(135deg, #ed6c02 0%, #ff9800 100%)'
    },
    {
      icon: <Notifications sx={{ fontSize: 40 }} />,
      title: 'Instant Notifications',
      description: 'Get notified immediately when your complaint status changes or when admins respond.',
      color: '#9c27b0',
      gradient: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)'
    },
    {
      icon: <Analytics sx={{ fontSize: 40 }} />,
      title: 'Analytics & Reports',
      description: 'Detailed analytics and reports for administrators to track performance and identify trends.',
      color: '#0288d1',
      gradient: 'linear-gradient(135deg, #0288d1 0%, #03a9f4 100%)'
    },
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: 'Secure & Private',
      description: 'Your data is protected with enterprise-grade security and privacy measures.',
      color: '#d32f2f',
      gradient: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)'
    }
  ]

  return (
    <Box
      sx={{
        width: '100%',
        py: 8,
        backgroundColor: isDarkMode ? '#121212' : '#ffffff'
      }}
    >
      <Box sx={{
        width: '100%',
        px: { xs: 2, sm: 4, md: 6, lg: 8, xl: 12 },
        display: 'flex',
        justifyContent: 'center'
      }}>
        <Box sx={{
          width: '100%',
          maxWidth: '1200px'
        }}>
          <Typography
            variant="h3"
            sx={{
              textAlign: 'center',
              fontWeight: 'bold',
              mb: 6,
              color: isDarkMode ? '#fff' : '#333'
            }}
          >
            Powerful Features for Everyone
          </Typography>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    p: 3,
                    textAlign: 'center',
                    width: '100%',
                    maxWidth: '350px',
                    background: isDarkMode
                      ? `linear-gradient(135deg, rgba(30, 30, 30, 0.95) 0%, rgba(45, 45, 45, 0.95) 100%)`
                      : `linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)`,
                    border: `2px solid ${alpha(feature.color, isDarkMode ? 0.3 : 0.2)}`,
                    borderRadius: { xs: 2, md: 3 },
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: feature.gradient,
                      transform: 'scaleX(0)',
                      transition: 'transform 0.4s ease'
                    },
                    '&:hover': {
                      transform: 'translateY(-12px) scale(1.05)',
                      boxShadow: `0 20px 40px ${alpha(feature.color, 0.4)}`,
                      border: `2px solid ${alpha(feature.color, 0.6)}`,
                      '&::before': {
                        transform: 'scaleX(1)'
                      },
                      '& .feature-icon': {
                        transform: 'rotate(360deg) scale(1.2)',
                        background: feature.gradient,
                        color: '#ffffff',
                        '& svg': {
                          color: '#ffffff'
                        }
                      }
                    }
                  }}
                >
                  <CardContent>
                    <Box 
                      className="feature-icon"
                      sx={{ 
                        color: feature.color, 
                        mb: 2,
                        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: 60,
                        height: 60,
                        mx: 'auto',
                        borderRadius: '50%',
                        background: isDarkMode
                          ? alpha(feature.color, 0.2)
                          : alpha(feature.color, 0.1),
                        boxShadow: `0 4px 16px ${alpha(feature.color, 0.3)}`,
                        '& svg': {
                          transition: 'color 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                          color: 'inherit'
                        }
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Box>
  )
}

export default FeaturesSection
