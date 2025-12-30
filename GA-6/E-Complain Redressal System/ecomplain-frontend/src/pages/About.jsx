import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  alpha
} from '@mui/material'
import {
  School,
  Security,
  Speed,
  Lightbulb,
  Handshake,
  EmojiEvents,
  GitHub,
  LinkedIn,
  Code,
  Favorite,
  Groups,
  Gavel,
  HistoryEdu,
  Visibility,
  Email,
  Phone,
  LocationOn,
  Support
} from '@mui/icons-material'
import { useTheme as useCustomTheme } from '../contexts/ThemeContext.jsx'
import { keyframes } from '@mui/system'

// Core animations
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`

const float = keyframes`
  0% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-10px) scale(1.02); }
  100% { transform: translateY(0) scale(1); }
`

const pulse = keyframes`
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59,130,246,0.45); }
  50% { transform: scale(1.03); box-shadow: 0 0 40px 10px rgba(59,130,246,0.25); }
`

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`

function About() {
  const { isDarkMode } = useCustomTheme()

  const stats = [
    { label: 'Complaints Resolved', value: '1.2K+', icon: <EmojiEvents />, color: '#22c55e' },
    { label: 'Avg. Response Time', value: '< 24 hrs', icon: <Speed />, color: '#f97316' },
    { label: 'Departments Onboarded', value: '25+', icon: <School />, color: '#3b82f6' },
    { label: 'Student Satisfaction', value: '4.8/5', icon: <Favorite />, color: '#ec4899' }
  ]

  const values = [
    {
      icon: <Visibility />,
      title: 'Radical Transparency',
      description: 'Every action is visible, every update is tracked, and every decision is documented. No more “lost” complaints.',
      color: '#3b82f6'
    },
    {
      icon: <Security />,
      title: 'Safe & Secure Voice',
      description: 'Enterprise‑grade security and role‑based access ensure your identity and data stay protected.',
      color: '#22c55e'
    },
    {
      icon: <Lightbulb />,
      title: 'Insight‑Driven Campus',
      description: 'Analytics turn individual complaints into patterns that help institutions improve policies and culture.',
      color: '#a855f7'
    },
    {
      icon: <Handshake />,
      title: 'Built For Collaboration',
      description: 'Students, mentors and administrators work together in one intuitive, guided workflow.',
      color: '#f97316'
    }
  ]

  const journeySteps = [
    {
      step: '01',
      title: 'You share your concern',
      description: 'Log in with your institute credentials and submit your issue with full context, category and attachments.',
      icon: <HistoryEdu />
    },
    {
      step: '02',
      title: 'Smart routing engine',
      description: 'Our logic routes the complaint directly to the correct department, HOD or authority – automatically.',
      icon: <Gavel />
    },
    {
      step: '03',
      title: 'Live tracking & updates',
      description: 'Track your case like a delivery – see which desk it is on, what changed and what is coming next.',
      icon: <Visibility />
    },
    {
      step: '04',
      title: 'Resolution & feedback',
      description: 'Get notified on every action and share feedback so we can keep improving the experience.',
      icon: <Support />
    }
  ]

  const team = [
    {
      name: 'Abhijeet Singh',
      role: 'Backend Architect',
      avatar: 'AS',
      color: '#3b82f6',
      skills: ['AWS', 'Express', 'Node.js'],
      github: 'https://github.com/abhi-singh-01',
      linkedin: 'https://linkedin.com'
    },
    {
      name: 'Abhishek Mishra',
      role: 'Frontend Engineer',
      avatar: 'AM',
      color: '#a855f7',
      skills: ['React', 'Cloudinary', 'Tailwind CSS'],
      github: 'https://github.com',
      linkedin: 'https://linkedin.com'
    },
    {
      name: 'Aashi',
      role: 'Full Stack Developer',
      avatar: 'A',
      color: '#ec4899',
      skills: ['MongoDB', 'React', 'Framer Motion'],
      github: 'https://github.com',
      linkedin: 'https://linkedin.com'
    }
  ]

  const getCardSx = (color) => ({
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 4,
    p: 3,
    height: '100%',
    maxWidth: '350px',
    border: isDarkMode
      ? `1px solid ${alpha(color, 0.5)}`
      : `2px solid ${alpha(color, 0.4)}`,
    background: isDarkMode
      ? `linear-gradient(135deg, ${alpha('#0f172a', 0.85)}, ${alpha(color, 0.25)})`
      : `linear-gradient(135deg, rgba(255,255,255,0.98), rgba(255,255,255,0.95), ${alpha(color, 0.03)})`,
    boxShadow: isDarkMode
      ? `0 20px 50px ${alpha('#020617', 0.9)}`
      : `0 20px 50px ${alpha(color, 0.12)}, 0 10px 30px ${alpha(color, 0.08)}, inset 0 1px 0 rgba(255,255,255,1)`,
    backdropFilter: 'blur(20px) saturate(180%)',
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: '-40%',
      background: `radial-gradient(circle at 0% 0%, ${alpha(color, isDarkMode ? 0.6 : 0.4)}, transparent 60%)`,
      opacity: isDarkMode ? 0.4 : 0.15,
      pointerEvents: 'none',
      animation: `${float} 12s ease-in-out infinite`
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      inset: 0,
      borderRadius: 4,
      padding: '2px',
      background: `linear-gradient(135deg, ${alpha(color, 0.6)}, transparent, ${alpha(color, 0.3)})`,
      WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
      WebkitMaskComposite: 'xor',
      maskComposite: 'exclude',
      opacity: isDarkMode ? 0.5 : 0.7,
      pointerEvents: 'none'
    },
    '&:hover': {
      transform: 'translateY(-12px) scale(1.02)',
      boxShadow: isDarkMode
        ? `0 28px 70px ${alpha(color, 0.8)}`
        : `0 30px 80px ${alpha(color, 0.35)}, 0 15px 40px ${alpha(color, 0.25)}, inset 0 1px 0 rgba(255,255,255,1)`,
      borderColor: alpha(color, isDarkMode ? 0.85 : 0.9)
    },
    transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)'
  })

  const chipSx = (color) => ({
    bgcolor: alpha(color, isDarkMode ? 0.3 : 0.2),
    color: isDarkMode ? alpha(color, 1) : color,
    borderRadius: 999,
    px: 1.8,
    py: 0.4,
    fontWeight: 700,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.8,
    border: `2px solid ${alpha(color, isDarkMode ? 0.6 : 0.6)}`,
    boxShadow: isDarkMode
      ? `0 4px 12px ${alpha(color, 0.4)}, 0 0 20px ${alpha(color, 0.2)}`
      : `0 4px 15px ${alpha(color, 0.3)}, inset 0 1px 0 rgba(255,255,255,0.6)`,
    backdropFilter: 'blur(10px)',
    '& svg': {
      color: isDarkMode ? alpha(color, 1) : color,
      filter: isDarkMode ? `drop-shadow(0 0 6px ${alpha(color, 0.5)})` : `drop-shadow(0 1px 2px ${alpha(color, 0.3)})`
    }
  })

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        overflow: 'hidden',
        py: { xs: 6, md: 10 },
        px: { xs: 2.5, sm: 4, md: 8 },
        background: isDarkMode
          ? 'radial-gradient(circle at 0% 0%, #1d4ed8 0, transparent 55%), radial-gradient(circle at 100% 100%, #22c55e 0, #020617 55%)'
          : 'radial-gradient(ellipse at 15% 20%, #dbeafe 0, transparent 50%), radial-gradient(ellipse at 85% 80%, #fce7f3 0, transparent 50%), radial-gradient(circle at 50% 50%, #dcfce7 0, transparent 60%), linear-gradient(135deg, #f0f9ff, #fef3f2, #f0fdf4)'
      }}
    >
      {/* Soft animated sheen */}
      <Box
        sx={{
          position: 'absolute',
          inset: '-20%',
          backgroundImage:
            'linear-gradient(120deg, transparent, rgba(255,255,255,0.08), transparent)',
          backgroundSize: '200% 100%',
          mixBlendMode: 'normal',
          opacity: isDarkMode ? 0.3 : 0.15,
          animation: `${shimmer} 18s linear infinite`,
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      <Box
        sx={{
          position: 'relative',
          maxWidth: 1240,
          mx: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: { xs: 8, md: 10 }
        }}
      >
        {/* HERO SECTION - centered, single column for all devices */}
        <Grid
          container
          spacing={4}
          justifyContent="center"
          sx={{ animation: `${fadeInUp} 0.8s ease-out` }}
        >
          <Grid item xs={12} md={10} lg={8}>
            <Box
              sx={{
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3
              }}
            >
              <Box sx={{ mb: 1.5 }}>
                <Box sx={chipSx('#3b82f6')}>
                  <Code fontSize="small" />
                  Built by students • Optimized for campus life
                </Box>
              </Box>

              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  letterSpacing: '-0.04em',
                  fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3.2rem' },
                  lineHeight: 1.05,
                  color: isDarkMode ? '#f9fafb' : '#111827'
                }}
              >
                Turn{' '}
                <Box
                  component="span"
                  sx={{
                    backgroundImage:
                      'linear-gradient(120deg, #3b82f6, #8b5cf6, #ec4899)',
                    backgroundClip: 'text',
                    textFillColor: 'transparent',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  every complaint
                </Box>{' '}
                into clear, trackable action.
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: isDarkMode ? alpha('#e5e7eb', 0.85) : '#374151',
                  fontSize: { xs: '1rem', md: '1.05rem' },
                  lineHeight: 1.8,
                  maxWidth: 600,
                  fontWeight: 400
                }}
              >
                E‑Complain is your digital bridge between students and college
                authorities. No more paper forms, office queues or wondering what
                happened to your issue – just raise, track and resolve from
                anywhere.
              </Typography>

              {/* Key highlights as interactive chips */}
              <Grid container spacing={2.5} justifyContent="center">
                <Grid item xs={12} sm={6} md={5}>
                  <Box
                    sx={{
                      ...chipSx('#22c55e'),
                      width: '100%',
                      justifyContent: 'center',
                      animation: `${pulse} 3.2s ease-in-out infinite`,
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-2px) scale(1.01)'
                      }
                    }}
                  >
                    <Speed fontSize="small" />
                    Live status & instant updates
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={5}>
                  <Box
                    sx={{
                      ...chipSx('#a855f7'),
                      width: '100%',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-2px) scale(1.01)'
                      }
                    }}
                  >
                    <Security fontSize="small" />
                    Fully secure & role‑based
                  </Box>
                </Grid>
              </Grid>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2,
                  alignItems: 'center',
                  justifyContent: 'center',
                  mt: 1
                }}
              >
                {/* CTA button (non‑navigating, just visual) */}
                <Box
                  component="button"
                  sx={{
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: 999,
                    px: 4,
                    py: 1.4,
                    fontWeight: 700,
                    fontSize: 15,
                    letterSpacing: 0.6,
                    textTransform: 'uppercase',
                    color: '#ffffff',
                    backgroundImage:
                      'linear-gradient(120deg, #3b82f6, #6366f1, #ec4899)',
                    backgroundSize: '200% 200%',
                    boxShadow: isDarkMode
                      ? '0 18px 45px rgba(79,70,229,0.6)'
                      : '0 18px 45px rgba(79,70,229,0.5)',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      backgroundPosition: '100% 0',
                      transform: 'translateY(-2px) scale(1.01)',
                      boxShadow: isDarkMode
                        ? '0 22px 55px rgba(79,70,229,0.75)'
                        : '0 22px 55px rgba(79,70,229,0.65)'
                    }
                  }}
                >
                  Start your first complaint
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: isDarkMode ? '#9ca3af' : '#6b7280',
                    fontSize: 13
                  }}
                >
                  <Groups fontSize="small" sx={{ color: '#22c55e' }} />
                  <span>Trusted by students & faculties across campus</span>
                </Box>
              </Box>

              {/* Stats moved under hero, centered and interactive on hover */}
              <Grid container spacing={2.5} justifyContent="center" sx={{ mt: 2 }}>
                {stats.map((item) => (
                  <Grid item xs={6} sm={3} key={item.label}>
                    <Box
                      sx={{
                        p: 1.8,
                        borderRadius: 3,
                        background: isDarkMode
                          ? alpha(item.color, 0.24)
                          : `linear-gradient(135deg, ${alpha(item.color, 0.15)}, rgba(255,255,255,0.9))`,
                        border: `2px solid ${alpha(item.color, isDarkMode ? 0.5 : 0.7)}`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.8,
                        alignItems: 'center',
                        textAlign: 'center',
                        cursor: 'default',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        boxShadow: isDarkMode
                          ? `0 10px 28px ${alpha('#020617', 0.8)}`
                          : `0 10px 28px ${alpha(item.color, 0.2)}, 0 5px 15px ${alpha(item.color, 0.1)}, inset 0 1px 0 rgba(255,255,255,0.9)`,
                        backdropFilter: 'blur(10px)',
                        '&:hover': {
                          transform: 'translateY(-6px) scale(1.03)',
                          boxShadow: isDarkMode
                            ? `0 16px 40px ${alpha(item.color, 0.7)}`
                            : `0 20px 50px ${alpha(item.color, 0.35)}, 0 10px 25px ${alpha(item.color, 0.2)}, inset 0 1px 0 rgba(255,255,255,1)`
                        }
                      }}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '999px',
                          background: isDarkMode
                            ? `linear-gradient(135deg, ${alpha(item.color, 0.6)}, ${alpha(item.color, 0.4)})`
                            : `linear-gradient(135deg, ${item.color}, ${alpha(item.color, 0.7)})`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          fontSize: '18px',
                          mb: 0.5,
                          boxShadow: isDarkMode
                            ? `0 6px 20px ${alpha(item.color, 0.5)}, 0 0 30px ${alpha(item.color, 0.3)}`
                            : `0 8px 25px ${alpha(item.color, 0.4)}, 0 0 40px ${alpha(item.color, 0.2)}, inset 0 1px 0 rgba(255,255,255,0.4)`,
                          transition: 'transform 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.15) rotate(5deg)'
                          }
                        }}
                      >
                        {item.icon}
                      </Box>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: isDarkMode ? '#e5e7eb' : '#111827',
                          fontWeight: 700
                        }}
                      >
                        {item.value}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: isDarkMode ? '#9ca3af' : '#6b7280',
                          fontSize: 11,
                          fontWeight: 500
                        }}
                      >
                        {item.label}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>
        </Grid >

        {/* VALUES SECTION */}
        < Box >
          <Typography
            variant="h4"
            sx={{
              textAlign: 'center',
              fontWeight: 700,
              fontSize: { xs: '1.9rem', md: '2.3rem' },
              mb: 1.2,
              color: isDarkMode ? '#f9fafb' : '#111827'
            }}
          >
            What makes E‑Complain different?
          </Typography>
          <Typography
            variant="body2"
            sx={{
              textAlign: 'center',
              maxWidth: 620,
              mx: 'auto',
              color: isDarkMode ? '#9ca3af' : '#4b5563',
              mb: 4,
              fontSize: 14,
              fontWeight: 400
            }}
          >
            More than a ticketing tool – it&apos;s a carefully crafted, student‑first
            experience that brings clarity, empathy and speed to every
            conversation.
          </Typography>

          <Grid container spacing={3.2} justifyContent="center">
            {values.map((item) => (
              <Grid item xs={12} sm={6} md={6} key={item.title}>
                <Card sx={getCardSx(item.color)}>
                  <CardContent sx={{ position: 'relative', zIndex: 1, p: 0 }}>
                    <Box
                      sx={{
                        mb: 2,
                        width: 56,
                        height: 56,
                        borderRadius: '999px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isDarkMode
                          ? `linear-gradient(135deg, ${alpha(item.color, 0.5)}, ${alpha(item.color, 0.3)})`
                          : `linear-gradient(135deg, ${item.color}, ${alpha(item.color, 0.8)})`,
                        color: '#ffffff',
                        fontSize: '28px',
                        boxShadow: isDarkMode
                          ? `0 12px 35px ${alpha(item.color, 0.6)}, 0 0 50px ${alpha(item.color, 0.4)}`
                          : `0 15px 45px ${alpha(item.color, 0.5)}, 0 5px 25px ${alpha(item.color, 0.3)}, 0 0 60px ${alpha(item.color, 0.25)}, inset 0 2px 0 rgba(255,255,255,0.5)`,
                        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        '&:hover': {
                          transform: 'scale(1.2) rotate(-5deg)',
                          boxShadow: isDarkMode
                            ? `0 15px 50px ${alpha(item.color, 0.8)}, 0 0 70px ${alpha(item.color, 0.6)}`
                            : `0 20px 60px ${alpha(item.color, 0.6)}, 0 10px 35px ${alpha(item.color, 0.4)}, 0 0 80px ${alpha(item.color, 0.35)}, inset 0 2px 0 rgba(255,255,255,0.7)`
                        }
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 700,
                        mb: 1,
                        color: isDarkMode ? '#f9fafb' : '#111827'
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: isDarkMode ? '#9ca3af' : '#4b5563',
                        lineHeight: 1.7,
                        fontSize: 13.5,
                        fontWeight: 400
                      }}
                    >
                      {item.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box >

        {/* JOURNEY TIMELINE */}
        < Box >
          {/* Journey Heading - Full Width Centered */}
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.9rem', md: '2.2rem' },
              mb: 1,
              color: isDarkMode ? '#f9fafb' : '#111827',
              textAlign: 'center'
            }}
          >
            A simple journey from{' '}
            <Box
              component="span"
              sx={{
                backgroundImage:
                  'linear-gradient(120deg,#22c55e,#a855f7,#0ea5e9)',
                backgroundClip: 'text',
                textFillColor: 'transparent',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              problem to progress
            </Box>
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: isDarkMode ? '#9ca3af' : '#4b5563',
              lineHeight: 1.8,
              mb: 3,
              fontSize: 14,
              textAlign: 'center',
              maxWidth: 650,
              mx: 'auto'
            }}
          >
            Every screen, email and notification is designed so that you
            always know what&apos;s happening, who&apos;s responsible and what
            comes next.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <Box sx={chipSx('#0ea5e9')}>
              <HistoryEdu fontSize="small" />
              End‑to‑end guided experience
            </Box>
          </Box>

          {/* Timeline Steps */}
          <Grid container spacing={{ xs: 4, md: 6 }} justifyContent="center">
            <Grid item xs={12} md={8}>
              <Box
                sx={{
                  position: 'relative',
                  pl: { xs: 0, md: 3 },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: { xs: '12px', md: '24px' },
                    top: 6,
                    bottom: 6,
                    width: 2,
                    bgcolor: alpha('#64748b', 0.4)
                  }
                }}
              >
                {journeySteps.map((step, idx) => (
                  <Box
                    key={step.step}
                    sx={{
                      position: 'relative',
                      display: 'flex',
                      gap: 2.5,
                      mb: idx === journeySteps.length - 1 ? 0 : 3.2
                    }}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        zIndex: 1,
                        mt: 0.5,
                        flexShrink: 0
                      }}
                    >
                      <Box
                        sx={{
                          width: 26,
                          height: 26,
                          borderRadius: '999px',
                          bgcolor: isDarkMode ? '#020617' : '#0f172a',
                          border: '2px solid #22c55e',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#22c55e',
                          fontSize: 11,
                          fontWeight: 700,
                          boxShadow: '0 0 0 4px rgba(34,197,94,0.15)'
                        }}
                      >
                        {step.step}
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        flex: 1,
                        p: 2.4,
                        borderRadius: 3,
                        background: isDarkMode
                          ? alpha('#0f172a', 0.85)
                          : 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.95))',
                        border: `2px solid ${alpha(isDarkMode ? '#22c55e' : '#22c55e', isDarkMode ? 0.3 : 0.3)}`,
                        boxShadow: isDarkMode
                          ? `0 12px 30px ${alpha('#020617', 0.8)}`
                          : `0 12px 35px ${alpha('#22c55e', 0.15)}, 0 6px 20px ${alpha('#22c55e', 0.1)}, inset 0 1px 0 rgba(255,255,255,0.9)`,
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 1
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 600,
                            color: isDarkMode ? '#f9fafb' : '#111827'
                          }}
                        >
                          {step.title}
                        </Typography>
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '999px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: isDarkMode
                              ? `linear-gradient(135deg, ${alpha('#22c55e', 0.4)}, ${alpha('#22c55e', 0.2)})`
                              : `linear-gradient(135deg, #22c55e, ${alpha('#22c55e', 0.7)})`,
                            color: '#ffffff',
                            fontSize: '20px',
                            boxShadow: isDarkMode
                              ? `0 6px 20px ${alpha('#22c55e', 0.4)}`
                              : `0 8px 25px ${alpha('#22c55e', 0.35)}, 0 0 40px ${alpha('#22c55e', 0.2)}`,
                            transition: 'transform 0.3s ease',
                            '&:hover': {
                              transform: 'scale(1.15)'
                            }
                          }}
                        >
                          {step.icon}
                        </Box>
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: isDarkMode ? '#9ca3af' : '#4b5563',
                          mb: 1.2,
                          fontSize: 13.5
                        }}
                      >
                        {step.description}
                      </Typography>
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.8,
                          fontSize: 11,
                          color: isDarkMode ? '#6b7280' : '#9ca3af',
                          textTransform: 'uppercase',
                          letterSpacing: 0.6
                        }}
                      >
                        <span>Step {idx + 1}</span>
                        <Box
                          component="span"
                          sx={{
                            width: 4,
                            height: 4,
                            borderRadius: '999px',
                            bgcolor: '#22c55e'
                          }}
                        />
                        <span>Guided</span>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Box >

        {/* TEAM & TECH SECTION */}
        < Box >
          {/* Team Heading - Full Width Centered */}
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.9rem', md: '2.1rem' },
              mb: 1,
              color: isDarkMode ? '#f9fafb' : '#111827',
              textAlign: 'center'
            }}
          >
            The makers behind the platform
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: isDarkMode ? '#9ca3af' : '#4b5563',
              mb: 4,
              fontSize: 14,
              textAlign: 'center',
              maxWidth: 600,
              mx: 'auto'
            }}
          >
            A small, focused team of engineers and students who have lived
            through the very problems this platform solves.
          </Typography>

          {/* Team Cards */}
          <Grid container spacing={3} justifyContent="center">
            {team.map((dev) => (
              <Grid item xs={12} sm={6} key={dev.name}>
                <Card sx={getCardSx(dev.color)}>
                  <CardContent sx={{ position: 'relative', zIndex: 1, p: 0 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        mb: 2
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: dev.color,
                          width: 52,
                          height: 52,
                          fontWeight: 700,
                          fontSize: 20,
                          boxShadow: `0 12px 28px ${alpha(dev.color, 0.6)}`
                        }}
                      >
                        {dev.avatar}
                      </Avatar>
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 700,
                            color: isDarkMode ? '#e2e8f0' : '#111827',
                            textShadow: isDarkMode ? `0 0 20px ${alpha(dev.color, 0.4)}` : 'none'
                          }}
                        >
                          {dev.name}
                        </Typography>
                        <Box sx={{ ...chipSx(dev.color), '& svg': { color: isDarkMode ? alpha(dev.color, 1) : dev.color } }}>
                          <Code fontSize="small" />
                          {dev.role}
                        </Box>
                      </Box>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      {dev.skills.map((skill) => (
                        <Chip
                          key={skill}
                          label={skill}
                          size="small"
                          sx={{
                            mr: 1,
                            mb: 1,
                            bgcolor: alpha(dev.color, isDarkMode ? 0.25 : 0.2),
                            color: isDarkMode ? alpha(dev.color, 1) : dev.color,
                            fontSize: 11,
                            fontWeight: 700,
                            border: `1px solid ${alpha(dev.color, isDarkMode ? 0.6 : 0.4)}`,
                            boxShadow: isDarkMode
                              ? `0 2px 12px ${alpha(dev.color, 0.4)}, 0 0 15px ${alpha(dev.color, 0.2)}`
                              : `0 2px 8px ${alpha(dev.color, 0.2)}`
                          }}
                        />
                      ))}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      <IconButton
                        href={dev.github}
                        target="_blank"
                        sx={{
                          bgcolor: isDarkMode ? alpha(dev.color, 0.4) : dev.color,
                          color: '#ffffff',
                          boxShadow: `0 4px 15px ${alpha(dev.color, isDarkMode ? 0.4 : 0.35)}`,
                          '&:hover': {
                            bgcolor: isDarkMode ? dev.color : alpha(dev.color, 1),
                            color: '#ffffff',
                            transform: 'translateY(-4px) scale(1.1)',
                            boxShadow: `0 12px 35px ${alpha(dev.color, 0.6)}, 0 0 20px ${alpha(dev.color, 0.4)}`
                          },
                          transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'
                        }}
                      >
                        <GitHub />
                      </IconButton>
                      <IconButton
                        href={dev.linkedin}
                        target="_blank"
                        sx={{
                          bgcolor: isDarkMode ? alpha(dev.color, 0.4) : dev.color,
                          color: '#ffffff',
                          boxShadow: `0 4px 15px ${alpha(dev.color, isDarkMode ? 0.4 : 0.35)}`,
                          '&:hover': {
                            bgcolor: isDarkMode ? dev.color : alpha(dev.color, 1),
                            color: '#ffffff',
                            transform: 'translateY(-4px) scale(1.1)',
                            boxShadow: `0 12px 35px ${alpha(dev.color, 0.6)}, 0 0 20px ${alpha(dev.color, 0.4)}`
                          },
                          transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'
                        }}
                      >
                        <LinkedIn />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          {/* Tech & Support - Separate centered section */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <Card sx={{ ...getCardSx('#0ea5e9'), width: '100%', maxWidth: '700px' }}>
              <CardContent sx={{ position: 'relative', zIndex: 1, p: 0, width: '100%' }}>
                <Typography
                  variant="h5"
                  sx={{
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    mb: 2,
                    color: isDarkMode ? '#a5b4fc' : '#2563eb',
                    fontWeight: 700,
                    textAlign: 'center',
                    fontSize: '1.1rem'
                  }}
                >
                  Modern Tech Stack
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    textAlign: 'center',
                    mb: 4,
                    color: isDarkMode ? '#f9fafb' : '#111827',
                    fontSize: { xs: '1.25rem', md: '1.4rem' },
                    lineHeight: 1.4
                  }}
                >
                  Fast, secure and built to scale with your institution.
                </Typography>

                <Grid container spacing={2} sx={{ mb: 4 }} justifyContent="center">
                  {[
                    { label: 'React + Vite', icon: <Code />, color: '#3b82f6' },
                    { label: 'Node & Express', icon: <Code />, color: '#22c55e' },
                    { label: 'MongoDB', icon: <Code />, color: '#f97316' },
                    { label: 'JWT Security', icon: <Security />, color: '#0ea5e9' }
                  ].map((item) => (
                    <Grid item xs={6} key={item.label}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          p: 1.8,
                          borderRadius: 999,
                          bgcolor: alpha(item.color, isDarkMode ? 0.32 : 0.16)
                        }}
                      >
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '999px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: isDarkMode ? alpha(item.color, 0.25) : item.color,
                            color: '#ffffff',
                            fontSize: '18px'
                          }}
                        >
                          {item.icon}
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: isDarkMode ? '#e5e7eb' : '#111827',
                            fontSize: '0.9rem'
                          }}
                        >
                          {item.label}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>

                <Box
                  sx={{
                    mt: 2,
                    p: 3,
                    borderRadius: 3,
                    bgcolor: isDarkMode
                      ? alpha('#0ea5e9', 0.15)
                      : alpha('#0ea5e9', 0.08),
                    border: `1px solid ${alpha('#0ea5e9', isDarkMode ? 0.3 : 0.2)}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Support sx={{ color: isDarkMode ? '#0ea5e9' : '#3b82f6', fontSize: '1.5rem' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: isDarkMode ? '#e5e7eb' : '#111827' }}>
                      Always‑on support for your campus
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: isDarkMode ? '#9ca3af' : '#4b5563', fontSize: '0.95rem', lineHeight: 1.6 }}>
                    Need help, have a feature idea or found an issue? Reach out –
                    we&apos;re actively improving E‑Complain with your feedback.
                  </Typography>
                  <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
                    {[
                      {
                        icon: <Email />,
                        label: 'support@ecomplaint.edu'
                      },
                      {
                        icon: <Phone />,
                        label: '+91 1234567890'
                      },
                      {
                        icon: <LocationOn />,
                        label: 'Campus Helpdesk • 09:00 – 18:00'
                      }
                    ].map((item) => (
                      <Grid item xs={12} key={item.label}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            fontSize: 14,
                            color: isDarkMode ? '#e5e7eb' : '#374151'
                          }}
                        >
                          <Box
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: '999px',
                              bgcolor: isDarkMode ? alpha('#0ea5e9', 0.25) : alpha('#0ea5e9', 0.15),
                              color: isDarkMode ? '#0ea5e9' : '#3b82f6',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {item.icon}
                          </Box>
                          <span>{item.label}</span>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box >
      </Box >
    </Box >
  )
}

export default About


