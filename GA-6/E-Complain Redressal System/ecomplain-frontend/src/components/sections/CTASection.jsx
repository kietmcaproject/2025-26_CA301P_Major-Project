import { useState, useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Box, Button, Typography, Fade, Zoom, Grow } from '@mui/material'
import { ArrowForward, Rocket, TrendingUp } from '@mui/icons-material'
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext.jsx'

function CTASection() {
  const { isDarkMode } = useCustomTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <Box
      sx={{
        width: '100%',
        py: { xs: 6, md: 10 },
        background: isDarkMode
          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
          zIndex: 1,
          animation: 'pulse 6s ease-in-out infinite',
          '@keyframes pulse': {
            '0%, 100%': { opacity: 1 },
            '50%': { opacity: 0.7 }
          }
        }}
      />

      {/* Floating Icons */}
      {[...Array(6)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: { xs: 40, md: 60 },
            height: { xs: 40, md: 60 },
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            top: `${15 + i * 12}%`,
            left: `${5 + i * 15}%`,
            animation: `floatIcon${i} ${8 + i * 2}s ease-in-out infinite`,
            zIndex: 1,
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '@keyframes floatIcon0': {
              '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
              '50%': { transform: 'translate(30px, -30px) rotate(180deg)' }
            },
            '@keyframes floatIcon1': {
              '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
              '50%': { transform: 'translate(-25px, 35px) rotate(-180deg)' }
            },
            '@keyframes floatIcon2': {
              '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
              '50%': { transform: 'translate(35px, 25px) rotate(180deg)' }
            },
            '@keyframes floatIcon3': {
              '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
              '50%': { transform: 'translate(-30px, -25px) rotate(-180deg)' }
            },
            '@keyframes floatIcon4': {
              '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
              '50%': { transform: 'translate(28px, 32px) rotate(180deg)' }
            },
            '@keyframes floatIcon5': {
              '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
              '50%': { transform: 'translate(-32px, 28px) rotate(-180deg)' }
            }
          }}
        >
          <Rocket sx={{ fontSize: { xs: 20, md: 30 }, color: 'white', opacity: 0.7 }} />
        </Box>
      ))}

      <Box sx={{
        position: 'relative',
        zIndex: 2,
        width: '100%',
        px: { xs: 2, sm: 4, md: 6, lg: 8, xl: 12 },
        display: 'flex',
        justifyContent: 'center'
      }}>
        <Box sx={{
          width: '100%',
          maxWidth: '1200px',
          textAlign: 'center'
        }}>
          {mounted && (
            <>
              <Fade in timeout={1000}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 900,
                    mb: 4,
                    lineHeight: 1.2,
                    fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
                    textShadow: '0 4px 20px rgba(0,0,0,0.2)',
                    letterSpacing: '-0.02em'
                  }}
                >
                  Ready to Get Started?
                </Typography>
              </Fade>

              <Zoom in timeout={1500}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 6,
                    opacity: 0.95,
                    lineHeight: 1.8,
                    maxWidth: '700px',
                    mx: 'auto',
                    fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
                    fontWeight: 400,
                    textShadow: '0 2px 10px rgba(0,0,0,0.1)'
                  }}
                >
                  Join thousands of students and administrators who trust our platform
                  for efficient complaint management and resolution.
                </Typography>
              </Zoom>

              <Grow in timeout={2000}>
                <Box sx={{
                  display: 'flex',
                  gap: { xs: 2, sm: 3 },
                  justifyContent: 'center',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: 'center'
                }}>
                  <Button
                    component={RouterLink}
                    to="/register"
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForward />}
                    startIcon={<Rocket />}
                    sx={{
                      background: 'linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%)',
                      color: 'white',
                      px: { xs: 4, sm: 6, md: 8 },
                      py: { xs: 1.5, sm: 2, md: 2.5 },
                      fontSize: { xs: '1rem', sm: '1.2rem', md: '1.3rem' },
                      fontWeight: 700,
                      borderRadius: 3,
                      textTransform: 'none',
                      boxShadow: '0 8px 32px rgba(255, 107, 107, 0.4)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                        transition: 'left 0.5s'
                      },
                      '&:hover': {
                        background: 'linear-gradient(135deg, #ff5252 0%, #ff1744 100%)',
                        transform: 'translateY(-6px) scale(1.05)',
                        boxShadow: '0 16px 48px rgba(255, 107, 107, 0.6)',
                        '&::before': {
                          left: '100%'
                        }
                      },
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    Start Free Trial
                  </Button>

                  <Button
                    component={RouterLink}
                    to="/about"
                    variant="outlined"
                    size="large"
                    startIcon={<TrendingUp />}
                    sx={{
                      borderColor: 'white',
                      borderWidth: 2,
                      color: 'white',
                      px: { xs: 4, sm: 6, md: 8 },
                      py: { xs: 1.5, sm: 2, md: 2.5 },
                      fontSize: { xs: '1rem', sm: '1.2rem', md: '1.3rem' },
                      fontWeight: 700,
                      borderRadius: 3,
                      textTransform: 'none',
                      backdropFilter: 'blur(10px)',
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.25)',
                        transform: 'translateY(-6px) scale(1.05)',
                        boxShadow: '0 12px 32px rgba(255, 255, 255, 0.3)'
                      },
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    Learn More
                  </Button>
                </Box>
              </Grow>
            </>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default CTASection
