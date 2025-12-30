import { useState, useEffect } from 'react'
import { Box, Typography, Grid, Card, CardContent, Avatar, alpha, Grow, Fade } from '@mui/material'
import { Star } from '@mui/icons-material'
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext.jsx'
import { useTheme } from '@mui/material/styles'

function TestimonialsSection() {
  const { isDarkMode } = useCustomTheme()
  const theme = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Computer Science Student',
      avatar: 'SJ',
      content: '"The E-Complaint system made it so easy to report issues with our lab equipment. The response was quick and the problem was resolved within 2 days!"',
      rating: 5,
      color: '#1976d2'
    },
    {
      name: 'Dr. Michael Chen',
      role: 'HOD, Mechanical Engineering',
      avatar: 'MC',
      content: '"As an administrator, this system has streamlined our complaint management process. The analytics help us identify trends and improve our services."',
      rating: 5,
      color: '#2e7d32'
    },
    {
      name: 'Emma Davis',
      role: 'Electrical Engineering Student',
      avatar: 'ED',
      content: '"I love how I can track my complaints in real-time. The notifications keep me updated, and the support team is always helpful."',
      rating: 5,
      color: '#9c27b0'
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
            ? 'radial-gradient(circle at 50% 50%, rgba(156, 39, 176, 0.05) 0%, transparent 70%)'
            : 'radial-gradient(circle at 50% 50%, rgba(156, 39, 176, 0.03) 0%, transparent 70%)',
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
          maxWidth: '1200px'
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
                What Our Users Say
              </Typography>
            </Fade>
          )}

          <Grid container spacing={{ xs: 3, md: 4 }} sx={{ justifyContent: 'center' }}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                {mounted && (
                  <Grow in timeout={1200 + index * 200}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                        maxWidth: '380px',
                        mx: 'auto',
                        background: isDarkMode
                          ? `linear-gradient(135deg, rgba(30, 30, 30, 0.95) 0%, rgba(45, 45, 45, 0.95) 100%)`
                          : `linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)`,
                        border: `2px solid ${alpha(testimonial.color, isDarkMode ? 0.3 : 0.2)}`,
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
                          background: `linear-gradient(135deg, ${testimonial.color} 0%, ${alpha(testimonial.color, 0.6)} 100%)`,
                          transform: 'scaleX(0)',
                          transition: 'transform 0.4s ease'
                        },
                        '&:hover': {
                          transform: 'translateY(-8px) scale(1.02)',
                          boxShadow: `0 16px 40px ${alpha(testimonial.color, 0.3)}`,
                          border: `2px solid ${alpha(testimonial.color, 0.6)}`,
                          '&::before': {
                            transform: 'scaleX(1)'
                          }
                        }
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1, p: { xs: 2, sm: 3 } }}>
                        <Box sx={{ 
                          display: 'flex', 
                          mb: 2,
                          justifyContent: 'center',
                          gap: 0.5
                        }}>
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star 
                              key={i} 
                              sx={{ 
                                color: '#ffd700', 
                                fontSize: { xs: 18, sm: 20 },
                                filter: 'drop-shadow(0 2px 4px rgba(255, 215, 0, 0.3))'
                              }} 
                            />
                          ))}
                        </Box>
                        <Typography
                          variant="body1"
                          sx={{
                            mb: 3,
                            color: theme.palette.text.secondary,
                            fontStyle: 'italic',
                            lineHeight: 1.8,
                            fontSize: { xs: '0.875rem', sm: '1rem' },
                            position: 'relative'
                          }}
                        >
                          {testimonial.content}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
                          <Avatar 
                            sx={{ 
                              mr: 2, 
                              bgcolor: testimonial.color,
                              width: { xs: 48, sm: 56 },
                              height: { xs: 48, sm: 56 },
                              fontWeight: 700,
                              fontSize: { xs: '1rem', sm: '1.25rem' },
                              boxShadow: `0 4px 16px ${alpha(testimonial.color, 0.4)}`
                            }}
                          >
                            {testimonial.avatar}
                          </Avatar>
                          <Box>
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: 700,
                                color: theme.palette.text.primary,
                                fontSize: { xs: '0.9375rem', sm: '1rem' }
                              }}
                            >
                              {testimonial.name}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: theme.palette.text.secondary,
                                fontSize: { xs: '0.8125rem', sm: '0.875rem' }
                              }}
                            >
                              {testimonial.role}
                            </Typography>
                          </Box>
                        </Box>
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

export default TestimonialsSection
