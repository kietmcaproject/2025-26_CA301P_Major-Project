import { useState, useEffect } from 'react'
import { Box, Typography, Grid, Card, CardContent, Avatar, alpha, Grow, Fade } from '@mui/material'
import { People, CheckCircle, Support, Star, TrendingUp } from '@mui/icons-material'
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext.jsx'
import { useTheme } from '@mui/material/styles'

function StatsSection() {
  const { isDarkMode } = useCustomTheme()
  const theme = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const stats = [
    { 
      number: '1000+', 
      label: 'Active Users', 
      icon: <People />, 
      color: '#1976d2',
      gradient: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)'
    },
    { 
      number: '500+', 
      label: 'Complaints Resolved', 
      icon: <CheckCircle />, 
      color: '#2e7d32',
      gradient: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)'
    },
    { 
      number: '24/7', 
      label: 'Support Available', 
      icon: <Support />, 
      color: '#ed6c02',
      gradient: 'linear-gradient(135deg, #ed6c02 0%, #ff9800 100%)'
    },
    { 
      number: '95%', 
      label: 'Satisfaction Rate', 
      icon: <Star />, 
      color: '#9c27b0',
      gradient: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)'
    }
  ]

  return (
    <Box
      sx={{
        width: '100%',
        py: { xs: 6, md: 10 },
        background: isDarkMode
          ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
          : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        borderTop: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
        borderBottom: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: isDarkMode
            ? 'radial-gradient(circle at 30% 50%, rgba(25, 118, 210, 0.05) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(156, 39, 176, 0.05) 0%, transparent 50%)'
            : 'radial-gradient(circle at 30% 50%, rgba(25, 118, 210, 0.03) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(156, 39, 176, 0.03) 0%, transparent 50%)',
          zIndex: 0
        }}
      />
      
      <Box sx={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        px: { xs: 2, sm: 4, md: 6, lg: 8, xl: 12 },
        display: 'flex',
        justifyContent: 'center'
      }}>
        <Box sx={{
          width: '100%',
          maxWidth: '1200px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          {mounted && (
            <Fade in timeout={800}>
              <Typography
                variant="h3"
                sx={{
                  textAlign: 'center',
                  fontWeight: 800,
                  mb: { xs: 4, md: 8 },
                  color: theme.palette.text.primary,
                  fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' },
                  background: isDarkMode
                    ? 'linear-gradient(135deg, #ffffff 0%, #b0b0b0 100%)'
                    : 'linear-gradient(135deg, #333 0%, #666 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Impact in Numbers
              </Typography>
            </Fade>
          )}
          
          <Grid container spacing={{ xs: 3, md: 4 }} sx={{ justifyContent: 'center' }}>
            {stats.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index} sx={{ display: 'flex', justifyContent: 'center' }}>
                {mounted && (
                  <Grow in timeout={1000 + index * 200}>
                    <Card
                      sx={{
                        textAlign: 'center',
                        p: { xs: 2, sm: 3 },
                        height: '100%',
                        width: '100%',
                        maxWidth: '280px',
                        background: isDarkMode
                          ? `linear-gradient(135deg, rgba(30, 30, 30, 0.95) 0%, rgba(45, 45, 45, 0.95) 100%)`
                          : `linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)`,
                        border: `2px solid ${alpha(stat.color, isDarkMode ? 0.3 : 0.2)}`,
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
                          background: stat.gradient,
                          transform: 'scaleX(0)',
                          transition: 'transform 0.4s ease'
                        },
                        '&:hover': {
                          transform: 'translateY(-12px) scale(1.05)',
                          boxShadow: `0 20px 40px ${alpha(stat.color, 0.4)}`,
                          border: `2px solid ${alpha(stat.color, 0.6)}`,
                          '&::before': {
                            transform: 'scaleX(1)'
                          },
                          '& .stat-icon': {
                            transform: 'rotate(360deg) scale(1.2)',
                            background: stat.gradient,
                            color: '#ffffff',
                            '& svg': {
                              color: '#ffffff'
                            }
                          }
                        }
                      }}
                    >
                      <CardContent>
                        <Avatar 
                          className="stat-icon"
                          sx={{
                            background: isDarkMode
                              ? alpha(stat.color, 0.2)
                              : alpha(stat.color, 0.1),
                            width: { xs: 60, sm: 70 },
                            height: { xs: 60, sm: 70 },
                            mx: 'auto',
                            mb: 2,
                            color: stat.color,
                            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: `0 4px 16px ${alpha(stat.color, 0.3)}`,
                            '& svg': {
                              transition: 'color 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                              color: 'inherit'
                            }
                          }}
                        >
                          {stat.icon}
                        </Avatar>
                        <Typography 
                          variant="h3" 
                          component="div" 
                          sx={{ 
                            fontWeight: 800, 
                            background: stat.gradient,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mb: 1,
                            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
                          }}
                        >
                          {stat.number}
                        </Typography>
                        <Typography 
                          variant="body1" 
                          sx={{
                            color: theme.palette.text.secondary,
                            fontWeight: 600,
                            fontSize: { xs: '0.875rem', sm: '1rem' }
                          }}
                        >
                          {stat.label}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grow>
                )}
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Box>
  )
}

export default StatsSection
