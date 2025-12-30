import { Suspense, lazy } from 'react'
import { Box, CircularProgress, alpha } from '@mui/material'
import { useTheme as useCustomTheme } from '../contexts/ThemeContext.jsx'

// Lazy load section components
const HeroSection = lazy(() => import('./sections/HeroSection.jsx'))
const StatsSection = lazy(() => import('./sections/StatsSection.jsx'))
const FeaturesSection = lazy(() => import('./sections/FeaturesSection.jsx'))
const TestimonialsSection = lazy(() => import('./sections/TestimonialsSection.jsx'))
const CTASection = lazy(() => import('./sections/CTASection.jsx'))

function LandingPage() {
  const { isDarkMode } = useCustomTheme()

  return (
    <Box sx={{
      width: '100vw',
      minHeight: '100vh',
      margin: 0,
      padding: 0,
      backgroundColor: isDarkMode ? '#0a0a0a' : '#ffffff',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Smooth transitions between sections */}
      <Suspense fallback={
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          background: isDarkMode
            ? 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
        }}>
          <CircularProgress sx={{ color: 'white' }} />
        </Box>
      }>
        <HeroSection />
      </Suspense>

      <Suspense fallback={
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '30vh',
          backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f9fa'
        }}>
          <CircularProgress />
        </Box>
      }>
        <StatsSection />
      </Suspense>

      <Suspense fallback={
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '40vh',
          backgroundColor: isDarkMode ? '#121212' : '#ffffff'
        }}>
          <CircularProgress />
        </Box>
      }>
        <FeaturesSection />
      </Suspense>

      <Suspense fallback={
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '40vh',
          backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f9fa'
        }}>
          <CircularProgress />
        </Box>
      }>
        <TestimonialsSection />
      </Suspense>

      <Suspense fallback={
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '40vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
          <CircularProgress sx={{ color: 'white' }} />
        </Box>
      }>
        <CTASection />
      </Suspense>
    </Box>
  )
}

export default LandingPage
