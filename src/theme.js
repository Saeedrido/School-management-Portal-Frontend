import { createTheme } from '@mui/material/styles';

// School Management System Theme - Premium Light Theme
// Colors: Primary #6FAF8F, Background #F5F7F6, Cards #FFFFFF, Sidebar #EAF3EE
const theme = createTheme({
  palette: {
    mode: 'light',
    // Primary Green
    primary: {
      main: '#6FAF8F',      // Primary Green
      light: '#8DC9B3',
      dark: '#4E8C70',      // Hover color
      contrastText: '#fff',
    },
    // Auth Green Accent
    auth: {
      main: '#4E8C70',      // Darker Green for auth buttons
      light: '#6FAF8F',     // Lighter green for hover
      dark: '#3D6B57',      // Darker green
      contrastText: '#fff',
    },
    // Secondary (Darker Green)
    secondary: {
      main: '#4E8C70',      // Darker Green
      light: '#6FAF8F',
      dark: '#3D6B57',
      contrastText: '#fff',
    },
    // Success Green
    success: {
      main: '#6FAF8F',      // Primary Green
      light: '#8DC9B3',
      dark: '#4E8C70',
      contrastText: '#fff',
    },
    // Info (Primary Green)
    info: {
      main: '#6FAF8F',
      light: '#8DC9B3',
      dark: '#4E8C70',
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
      main: '#DC2626',
      light: '#EF4444',
      dark: '#B91C1C',
      contrastText: '#fff',
    },
    // Background colors - Light Theme
    background: {
      default: '#F5F7F6',    // Main background
      paper: '#FFFFFF',       // Cards
      sidebar: '#EAF3EE',    // Sidebar
    },
    // Border color
    divider: '#E2E8F0',
    // Text colors
    text: {
      primary: '#1F2937',    // Text Dark
      secondary: '#4B5563',
      disabled: '#9CA3AF',
    },
  },
  typography: {
    fontFamily: [
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 600,
      fontSize: '2.5rem',
      color: '#1F2937',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      color: '#6FAF8F',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      color: '#1F2937',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      color: '#6FAF8F',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
      color: '#4B5563',
    },
    body1: {
      fontSize: '1rem',
      color: '#4B5563',
    },
    body2: {
      fontSize: '0.875rem',
      color: '#6B7280',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(111, 175, 143, 0.3)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#1F2937',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#EAF3EE',
          borderRight: '1px solid #E2E8F0',
        },
      },
    },
  },
  overrides: {
    MuiCssBaseline: {
      '@global': {
        body: {
          backgroundColor: '#F5F7F6',
        },
      },
    },
  },
});

export default theme;
