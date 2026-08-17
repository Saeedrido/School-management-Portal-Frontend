import { createTheme, alpha } from '@mui/material/styles';

// School Management System Theme - Premium Modern Theme
// Colors: Primary #6FAF8F, Background #F5F7F6, Cards #FFFFFF, Sidebar #EAF3EE
const theme = createTheme({
  palette: {
    mode: 'light',
    // Primary Green
    primary: {
      main: '#6FAF8F',
      light: '#8DC9B3',
      dark: '#4E8C70',
      contrastText: '#fff',
    },
    // Auth Green Accent
    auth: {
      main: '#4E8C70',
      light: '#6FAF8F',
      dark: '#3D6B57',
      contrastText: '#fff',
    },
    // Secondary (Darker Green)
    secondary: {
      main: '#4E8C70',
      light: '#6FAF8F',
      dark: '#3D6B57',
      contrastText: '#fff',
    },
    // Success Green
    success: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669',
      contrastText: '#fff',
    },
    // Warning (Amber)
    warning: {
      main: '#F59E0B',
      light: '#FBBF24',
      dark: '#D97706',
      contrastText: '#fff',
    },
    // Error (Red)
    error: {
      main: '#EF4444',
      light: '#F87171',
      dark: '#DC2626',
      contrastText: '#fff',
    },
    // Info (Primary Green)
    info: {
      main: '#6FAF8F',
      light: '#8DC9B3',
      dark: '#4E8C70',
      contrastText: '#fff',
    },
    // Background colors - Light Theme
    background: {
      default: '#F8FAF9',
      paper: '#FFFFFF',
      sidebar: '#F0F7F4',
      card: '#FFFFFF',
    },
    // Border color
    divider: 'rgba(111, 175, 143, 0.12)',
    // Text colors
    text: {
      primary: '#1E293B',
      secondary: '#64748B',
      disabled: '#94A3B8',
    },
  },
  typography: {
    fontFamily: [
      '"Inter"',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      color: '#1E293B',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      color: '#1E293B',
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      color: '#1E293B',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      color: '#1E293B',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      color: '#1E293B',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      color: '#1E293B',
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: '1rem',
      color: '#1E293B',
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: '0.875rem',
      color: '#64748B',
    },
    body1: {
      fontSize: '1rem',
      color: '#334155',
      lineHeight: 1.7,
    },
    body2: {
      fontSize: '0.875rem',
      color: '#64748B',
      lineHeight: 1.6,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.01em',
    },
    caption: {
      fontSize: '0.75rem',
      color: '#94A3B8',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 1px 2px rgba(0, 0, 0, 0.04)',
    '0 2px 4px rgba(0, 0, 0, 0.04)',
    '0 4px 8px rgba(0, 0, 0, 0.04)',
    '0 6px 12px rgba(0, 0, 0, 0.04)',
    '0 8px 16px rgba(0, 0, 0, 0.04)',
    '0 10px 20px rgba(0, 0, 0, 0.04)',
    '0 12px 24px rgba(0, 0, 0, 0.04)',
    '0 14px 28px rgba(0, 0, 0, 0.04)',
    '0 16px 32px rgba(0, 0, 0, 0.04)',
    '0 18px 36px rgba(0, 0, 0, 0.04)',
    '0 20px 40px rgba(0, 0, 0, 0.04)',
    '0 22px 44px rgba(0, 0, 0, 0.04)',
    '0 24px 48px rgba(0, 0, 0, 0.04)',
    '0 26px 52px rgba(0, 0, 0, 0.04)',
    '0 28px 56px rgba(0, 0, 0, 0.04)',
    '0 30px 60px rgba(0, 0, 0, 0.04)',
    '0 32px 64px rgba(0, 0, 0, 0.04)',
    '0 34px 68px rgba(0, 0, 0, 0.04)',
    '0 36px 72px rgba(0, 0, 0, 0.04)',
    '0 38px 76px rgba(0, 0, 0, 0.04)',
    '0 40px 80px rgba(0, 0, 0, 0.04)',
    '0 42px 84px rgba(0, 0, 0, 0.04)',
    '0 44px 88px rgba(0, 0, 0, 0.04)',
    '0 46px 92px rgba(0, 0, 0, 0.04)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#F8FAF9',
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#F1F5F4',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#CBD5E1',
            borderRadius: '4px',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '10px 24px',
          fontSize: '0.875rem',
          fontWeight: 600,
          boxShadow: 'none',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(111, 175, 143, 0.25)',
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 6px 16px rgba(111, 175, 143, 0.3)',
          },
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
          border: '1px solid rgba(111, 175, 143, 0.08)',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(111, 175, 143, 0.12)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            transition: 'all 0.2s ease',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#6FAF8F',
              },
            },
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderWidth: '2px',
              },
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
        elevation1: {
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#1E293B',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#F0F7F4',
          borderRight: '1px solid rgba(111, 175, 143, 0.1)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(111, 175, 143, 0.1)',
          padding: '16px',
        },
        head: {
          fontWeight: 600,
          backgroundColor: 'rgba(111, 175, 143, 0.04)',
          color: '#64748B',
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'all 0.15s ease',
          '&:hover': {
            backgroundColor: 'rgba(111, 175, 143, 0.03)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(111, 175, 143, 0.1)',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '2px 8px',
          padding: '10px 16px',
          '&:hover': {
            backgroundColor: 'rgba(111, 175, 143, 0.08)',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: '3px 3px 0 0',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
          minWidth: 'auto',
          padding: '12px 24px',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#1E293B',
          borderRadius: 8,
          fontSize: '0.75rem',
          padding: '8px 12px',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: 'rgba(111, 175, 143, 0.1)',
        },
      },
    },
  },
});

export default theme;
