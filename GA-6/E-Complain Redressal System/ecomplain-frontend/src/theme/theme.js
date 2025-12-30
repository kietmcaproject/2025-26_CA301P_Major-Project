import { createTheme } from '@mui/material/styles'

export const createAppTheme = (mode) => {
  const isDark = mode === 'dark'
  
  return createTheme({
    palette: {
      mode: mode,
      primary: {
        main: '#1976d2',
        light: '#42a5f5',
        dark: '#1565c0',
      },
      secondary: {
        main: '#9c27b0',
        light: '#ba68c8',
        dark: '#7b1fa2',
      },
      background: {
        default: isDark ? '#121212' : '#f5f5f5',
        paper: isDark ? '#1e1e1e' : '#ffffff',
      },
      text: {
        primary: isDark ? '#ffffff' : '#212121',
        secondary: isDark ? '#b0b0b0' : '#666666',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableRipple: true,
        },
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
          },
        },
      },
      MuiIconButton: {
        defaultProps: {
          disableRipple: true,
        },
      },
      MuiCard: {
        defaultProps: {
          disableRipple: true,
        },
      },
      MuiCardActionArea: {
        defaultProps: {
          disableRipple: true,
        },
      },
      MuiListItemButton: {
        defaultProps: {
          disableRipple: true,
        },
      },
      MuiTab: {
        defaultProps: {
          disableRipple: true,
        },
      },
      MuiChip: {
        defaultProps: {
          disableRipple: true,
        },
      },
      MuiFab: {
        defaultProps: {
          disableRipple: true,
        },
      },
      MuiToggleButton: {
        defaultProps: {
          disableRipple: true,
        },
      },
    },
    shape: {
      borderRadius: 8,
    },
  })
}

