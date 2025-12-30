import { useState, useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  Box,
  Button,
  Typography,
  Grid,
  Fade,
  Zoom,
  Grow
} from '@mui/material'
import {
  School,
  ArrowForward,
  TrendingUp,
  Speed,
  Security
} from '@mui/icons-material'
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext.jsx'

function HeroSection() {
  const { isDarkMode } = useCustomTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <Box
      sx={{
        width: '100%',
        background: isDarkMode
          ? 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Animated Background Particles */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: isDarkMode
            ? 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.4) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(78, 205, 196, 0.3) 0%, transparent 50%)'
            : 'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
          zIndex: 1,
          animation: 'pulse 8s ease-in-out infinite',
          '@keyframes pulse': {
            '0%, 100%': { opacity: 1 },
            '50%': { opacity: 0.8 }
          }
        }}
      />

      {/* Floating Shapes */}
      {[...Array(5)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: { xs: 60, md: 100 },
            height: { xs: 60, md: 100 },
            borderRadius: '50%',
            background: isDarkMode
              ? `rgba(${120 + i * 20}, ${119 + i * 10}, ${198 - i * 15}, 0.1)`
              : `rgba(255, 255, 255, ${0.1 + i * 0.05})`,
            top: `${20 + i * 15}%`,
            left: `${10 + i * 20}%`,
            animation: `float${i} ${6 + i}s ease-in-out infinite`,
            zIndex: 1,
            backdropFilter: 'blur(10px)',
            '@keyframes float0': {
              '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
              '50%': { transform: 'translate(30px, -30px) scale(1.1)' }
            },
            '@keyframes float1': {
              '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
              '50%': { transform: 'translate(-20px, 40px) scale(0.9)' }
            },
            '@keyframes float2': {
              '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
              '50%': { transform: 'translate(40px, 20px) scale(1.2)' }
            },
            '@keyframes float3': {
              '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
              '50%': { transform: 'translate(-30px, -20px) scale(0.8)' }
            },
            '@keyframes float4': {
              '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
              '50%': { transform: 'translate(25px, 35px) scale(1.15)' }
            }
          }}
        />
      ))}

      <Box sx={{
        position: 'relative',
        zIndex: 2,
        width: '100%',
        px: { xs: 2, sm: 4, md: 6, lg: 8, xl: 12 }
      }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              {mounted && (
                <>
                  <Fade in timeout={1000}>
                    <Typography
                      variant="h1"
                      sx={{
                        fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem', lg: '5rem' },
                        fontWeight: 900,
                        color: 'white',
                        mb: 2,
                        lineHeight: 1.1,
                        textShadow: '0 4px 20px rgba(0,0,0,0.3)',
                        letterSpacing: '-0.02em'
                      }}
                    >
                      E-Complaint
                      <br />
                      <Box 
                        component="span" 
                        sx={{
                          background: 'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 50%, #45b7d1 100%)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          display: 'inline-block',
                          animation: 'gradientShift 3s ease infinite',
                          '@keyframes gradientShift': {
                            '0%, 100%': { backgroundPosition: '0% 50%' },
                            '50%': { backgroundPosition: '100% 50%' }
                          },
                          backgroundSize: '200% 200%'
                        }}
                      >
                        Redressal System
                      </Box>
                    </Typography>
                  </Fade>

                  <Fade in timeout={1500}>
                    <Typography
                      variant="h5"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.95)',
                        mb: 4,
                        lineHeight: 1.8,
                        fontWeight: 400,
                        fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
                        maxWidth: { xs: '100%', md: '90%' },
                        textShadow: '0 2px 10px rgba(0,0,0,0.2)'
                      }}
                    >
                      Streamline complaint management for educational institutions.
                      <br />
                      <Box component="span" sx={{ fontWeight: 600 }}>
                        Submit, track, and resolve issues efficiently with our modern platform.
                      </Box>
                    </Typography>
                  </Fade>

                  <Grow in timeout={2000}>
                    <Box sx={{
                      display: 'flex',
                      gap: 2,
                      flexDirection: { xs: 'column', sm: 'row' },
                      justifyContent: { xs: 'center', md: 'flex-start' },
                      mt: 4
                    }}>
                      <Button
                        component={RouterLink}
                        to="/register"
                        variant="contained"
                        size="large"
                        endIcon={<ArrowForward />}
                        sx={{
                          background: 'linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%)',
                          color: 'white',
                          px: { xs: 4, sm: 6 },
                          py: { xs: 1.5, sm: 2 },
                          fontSize: { xs: '1rem', sm: '1.1rem' },
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
                            transform: 'translateY(-4px) scale(1.05)',
                            boxShadow: '0 16px 48px rgba(255, 107, 107, 0.5)',
                            '&::before': {
                              left: '100%'
                            }
                          },
                          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      >
                        Get Started Free
                      </Button>

                      <Button
                        component={RouterLink}
                        to="/admin/login"
                        variant="outlined"
                        size="large"
                        sx={{
                          borderColor: 'white',
                          borderWidth: 2,
                          color: 'white',
                          px: { xs: 4, sm: 6 },
                          py: { xs: 1.5, sm: 2 },
                          fontSize: { xs: '1rem', sm: '1.1rem' },
                          fontWeight: 700,
                          borderRadius: 3,
                          textTransform: 'none',
                          backdropFilter: 'blur(10px)',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          '&:hover': {
                            borderColor: 'white',
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            transform: 'translateY(-4px) scale(1.05)',
                            boxShadow: '0 12px 32px rgba(255, 255, 255, 0.2)'
                          },
                          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      >
                        Admin Portal
                      </Button>
                    </Box>
                  </Grow>
                </>
              )}
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              minHeight: { xs: 300, md: 500 }
            }}>
              {mounted && (
                <Zoom in timeout={2000}>
                  <Box sx={{ position: 'relative', width: '100%', maxWidth: 500 }}>
                    {/* Main Icon Container */}
                    <Box
                      sx={{
                        width: { xs: 280, sm: 350, md: 400 },
                        height: { xs: 280, sm: 350, md: 400 },
                        borderRadius: '50%',
                        background: isDarkMode
                          ? 'linear-gradient(135deg, rgba(255, 107, 107, 0.2), rgba(78, 205, 196, 0.2))'
                          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.15))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(20px)',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        animation: 'float 6s ease-in-out infinite',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                        mx: 'auto',
                        '@keyframes float': {
                          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
                          '50%': { transform: 'translateY(-30px) rotate(5deg)' }
                        }
                      }}
                    >
                      <School sx={{ fontSize: { xs: 120, sm: 150, md: 180 }, color: 'white', opacity: 0.95 }} />
                    </Box>

                    {/* Floating Feature Icons */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '10%',
                        right: '10%',
                        animation: 'orbit 20s linear infinite',
                        '@keyframes orbit': {
                          '0%': { transform: 'rotate(0deg) translateX(80px) rotate(0deg)' },
                          '100%': { transform: 'rotate(360deg) translateX(80px) rotate(-360deg)' }
                        }
                      }}
                    >
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, rgba(78, 205, 196, 0.8), rgba(69, 183, 209, 0.8))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 8px 24px rgba(78, 205, 196, 0.4)',
                          border: '2px solid rgba(255, 255, 255, 0.3)'
                        }}
                      >
                        <TrendingUp sx={{ fontSize: 30, color: 'white' }} />
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: '15%',
                        left: '5%',
                        animation: 'orbitReverse 15s linear infinite',
                        '@keyframes orbitReverse': {
                          '0%': { transform: 'rotate(0deg) translateX(60px) rotate(0deg)' },
                          '100%': { transform: 'rotate(-360deg) translateX(60px) rotate(360deg)' }
                        }
                      }}
                    >
                      <Box
                        sx={{
                          width: 50,
                          height: 50,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.8), rgba(255, 82, 82, 0.8))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 8px 24px rgba(255, 107, 107, 0.4)',
                          border: '2px solid rgba(255, 255, 255, 0.3)'
                        }}
                      >
                        <Speed sx={{ fontSize: 25, color: 'white' }} />
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '-5%',
                        animation: 'orbit 25s linear infinite',
                      }}
                    >
                      <Box
                        sx={{
                          width: 55,
                          height: 55,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.8), rgba(142, 36, 170, 0.8))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 8px 24px rgba(156, 39, 176, 0.4)',
                          border: '2px solid rgba(255, 255, 255, 0.3)'
                        }}
                      >
                        <Security sx={{ fontSize: 28, color: 'white' }} />
                      </Box>
                    </Box>
                  </Box>
                </Zoom>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

export default HeroSection
