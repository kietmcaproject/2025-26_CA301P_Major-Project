import { Link as RouterLink } from 'react-router-dom'
import {
  Box,
  Button,
  Container,
  Typography
} from '@mui/material'

function Home() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Content Section Below Images */}
      <Box
        sx={{
          py: 8,
          flex: 1,
          background: 'linear-gradient(to bottom right, #eff6ff, #f3e8ff)'
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              textAlign: 'center',
              animation: 'fadeInUp 1s ease-out',
              '@keyframes fadeInUp': {
                '0%': {
                  opacity: 0,
                  transform: 'translateY(30px)'
                },
                '100%': {
                  opacity: 1,
                  transform: 'translateY(0)'
                }
              }
            }}
          >
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{
                fontSize: '3rem',
                fontWeight: 700,
                lineHeight: 1.2,
                color: '#1976d2',
                mb: 3
              }}
            >
              E-Complaint Redressal System for Educational Institutions
            </Typography>

            <Typography
              variant="h5"
              sx={{
                fontSize: '1.2rem',
                fontWeight: 400,
                color: '#666',
                lineHeight: 1.6,
                mb: 4,
                maxWidth: '48rem',
                mx: 'auto'
              }}
            >
              Submit, track, and resolve issues efficiently with our modern, user-friendly platform designed for students.
            </Typography>

            {/* Get Started Button */}
            <Box sx={{ mb: 6 }}>
              <Button
                variant="contained"
                size="large"
                component={RouterLink}
                to="/register"
                sx={{
                  backgroundColor: '#1976d2',
                  color: 'white',
                  fontWeight: 'bold',
                  px: 6,
                  py: 2,
                  fontSize: '1.2rem',
                  borderRadius: 3,
                  textTransform: 'none',
                  boxShadow: '0 4px 20px rgba(25, 118, 210, 0.3)',
                  '&:hover': {
                    backgroundColor: '#1565c0',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 8px 30px rgba(25, 118, 210, 0.4)'
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                Get Started
              </Button>
            </Box>

            {/* Stats Section */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: { xs: 3, md: 6 },
                flexWrap: 'wrap',
                mt: 6,
                mb: 4
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                  1000+
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Active Users
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                  500+
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Complaints Resolved
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                  24/7
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Support Available
                </Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 8, backgroundColor: '#1976d2' }}>
        <Container maxWidth="md" sx={{ textAlign: 'center', color: 'white' }}>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
            Ready to Get Started?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join thousands of students and staff who trust our platform for complaint management.
          </Typography>
          <Box sx={{
            display: 'flex',
            gap: 2,
            justifyContent: 'center',
            flexDirection: { xs: 'column', sm: 'row' }
          }}>
            <Button
              variant="contained"
              size="large"
              component={RouterLink}
              to="/register"
              sx={{
                backgroundColor: 'white',
                color: '#1976d2',
                fontWeight: 'bold',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Get Started
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}

export default Home
