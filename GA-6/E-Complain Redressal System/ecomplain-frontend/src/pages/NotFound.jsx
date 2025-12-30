import { Link as RouterLink } from 'react-router-dom'
import { Box, Typography, Button, Container } from '@mui/material'
import { Home, Error as ErrorIcon } from '@mui/icons-material'
import { useTheme as useCustomTheme } from '../contexts/ThemeContext.jsx'

function NotFound() {
    const { isDarkMode } = useCustomTheme()

    return (
        <Box
            sx={{
                minHeight: '80vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isDarkMode
                    ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                py: 8
            }}
        >
            <Container maxWidth="sm">
                <Box
                    sx={{
                        textAlign: 'center',
                        p: 4,
                        borderRadius: 4,
                        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
                    }}
                >
                    <ErrorIcon
                        sx={{
                            fontSize: 100,
                            color: '#1976d2',
                            mb: 2,
                            animation: 'pulse 2s infinite',
                            '@keyframes pulse': {
                                '0%, 100%': { transform: 'scale(1)', opacity: 1 },
                                '50%': { transform: 'scale(1.1)', opacity: 0.8 }
                            }
                        }}
                    />

                    <Typography
                        variant="h1"
                        sx={{
                            fontSize: { xs: '4rem', md: '6rem' },
                            fontWeight: 800,
                            background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mb: 1
                        }}
                    >
                        404
                    </Typography>

                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 600,
                            color: isDarkMode ? '#fff' : '#333',
                            mb: 2
                        }}
                    >
                        Oops! Page Not Found
                    </Typography>

                    <Typography
                        variant="body1"
                        sx={{
                            color: isDarkMode ? '#b0b0b0' : '#666',
                            mb: 4,
                            maxWidth: 400,
                            mx: 'auto'
                        }}
                    >
                        The page you're looking for doesn't exist or has been moved.
                        Let's get you back on track!
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Button
                            variant="contained"
                            component={RouterLink}
                            to="/"
                            startIcon={<Home />}
                            sx={{
                                px: 4,
                                py: 1.5,
                                borderRadius: 2,
                                fontWeight: 600,
                                textTransform: 'none',
                                fontSize: '1.1rem',
                                backgroundColor: '#1976d2',
                                '&:hover': {
                                    backgroundColor: '#1565c0',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 8px 25px rgba(25, 118, 210, 0.4)'
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Go Home
                        </Button>

                        <Button
                            variant="outlined"
                            component={RouterLink}
                            to="/login"
                            sx={{
                                px: 4,
                                py: 1.5,
                                borderRadius: 2,
                                fontWeight: 600,
                                textTransform: 'none',
                                fontSize: '1.1rem',
                                color: isDarkMode ? '#fff' : '#1976d2',
                                borderColor: isDarkMode ? '#fff' : '#1976d2',
                                '&:hover': {
                                    backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                    borderColor: '#1976d2',
                                    transform: 'translateY(-2px)'
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Login
                        </Button>
                    </Box>
                </Box>
            </Container>
        </Box>
    )
}

export default NotFound
