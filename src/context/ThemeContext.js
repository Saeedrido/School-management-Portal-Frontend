import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Color constants - Premium Green Theme
const PRIMARY = '#6FAF8F';
const PRIMARY_HOVER = '#4E8C70';
const LIGHT_BG = '#F5F7F6';
const SIDEBAR = '#EAF3EE';
const BORDERS = '#E2E8F0';
const TEXT_DARK = '#1F2937';

// Light Theme (Default - Premium Green)
const lightTheme = createTheme({
  typography: {
    fontFamily: [
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    htmlFontSize: 16,
    h1: {
      fontWeight: 600,
      fontSize: '2rem',
      color: TEXT_DARK,
    },
    h2: {
      fontWeight: 600,
      fontSize: '1.75rem',
      color: PRIMARY,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
      color: TEXT_DARK,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
      color: PRIMARY,
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.1rem',
      color: '#4B5563',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
      color: '#4B5563',
    },
    body1: {
      fontSize: '0.9375rem',
      color: '#4B5563',
    },
    body2: {
      fontSize: '0.8125rem',
      color: '#6B7280',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '0.875rem',
    },
    caption: {
      fontSize: '0.75rem',
    },
  },
  spacing: 8,
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        html {
          font-size: 16px;
        }
        body {
          font-size: 1rem;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `,
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          padding: '8px 16px',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(111, 175, 143, 0.3)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: 'none',
          },
        },
        sizeMedium: {
          padding: '8px 16px',
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
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiSelect: {
      defaultProps: {
        MenuProps: {
          disableScrollLock: true,
          anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
          transformOrigin: { vertical: 'top', horizontal: 'left' },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          maxHeight: '300px !important',
          overflowY: 'auto',
        },
      },
    },
    MuiPopover: {
      defaultProps: {
        anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
        transformOrigin: { vertical: 'top', horizontal: 'left' },
      },
      styleOverrides: {
        paper: {
          maxHeight: '300px !important',
          overflowY: 'auto',
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: '56px !important',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: TEXT_DARK,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        },
      },
    },
  },
});

// Dark Theme (Legacy - kept for reference but not used by default)
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: PRIMARY,
      light: '#8DC9B3',
      dark: PRIMARY_HOVER,
      contrastText: '#fff',
    },
    secondary: {
      main: '#EF5350',
      light: '#FF8A80',
      dark: '#C62828',
      contrastText: '#fff',
    },
    success: {
      main: PRIMARY,
      light: '#8DC9B3',
      dark: PRIMARY_HOVER,
      contrastText: '#fff',
    },
    info: {
      main: '#42A5F5',
      light: '#64B5F6',
      dark: '#1976D2',
      contrastText: '#fff',
    },
    warning: {
      main: '#FFA726',
      light: '#FFB74D',
      dark: '#F57C00',
      contrastText: '#fff',
    },
    error: {
      main: '#E53935',
      light: '#FF5252',
      dark: '#C62828',
      contrastText: '#fff',
    },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
    text: {
      primary: '#ffffff',
      secondary: '#B0BEC5',
      disabled: '#616161',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
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
      fontSize: {
        xs: '2rem',
        sm: '2.5rem',
      },
      color: '#ffffff',
    },
    h2: {
      fontWeight: 600,
      fontSize: {
        xs: '1.5rem',
        sm: '2rem',
      },
      color: PRIMARY,
    },
    h3: {
      fontWeight: 600,
      fontSize: {
        xs: '1.25rem',
        sm: '1.75rem',
      },
      color: '#ffffff',
    },
    h4: {
      fontWeight: 600,
      fontSize: {
        xs: '1.1rem',
        sm: '1.5rem',
      },
      color: PRIMARY,
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
      color: '#B0BEC5',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
      color: '#B0BEC5',
    },
    body1: {
      fontSize: '1rem',
      color: '#E0E0E0',
    },
    body2: {
      fontSize: '0.875rem',
      color: '#B0BEC5',
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
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
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
    MuiSelect: {
      defaultProps: {
        MenuProps: {
          disableScrollLock: true,
          anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
          transformOrigin: { vertical: 'top', horizontal: 'left' },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          maxHeight: '300px !important',
          overflowY: 'auto',
        },
      },
    },
    MuiPopover: {
      defaultProps: {
        anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
        transformOrigin: { vertical: 'top', horizontal: 'left' },
      },
      styleOverrides: {
        paper: {
          maxHeight: '300px !important',
          overflowY: 'auto',
        },
      },
    },
  },
  overrides: {
    MuiCssBaseline: {
      '@global': {
        body: {
          backgroundColor: '#121212',
          color: '#E0E0E0',
        },
      },
    },
  },
});

// Theme context
const ThemeContext = createContext({
  toggleTheme: () => {},
  isDarkMode: false,
});

export const useThemeContext = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Default to light mode
    const savedTheme = localStorage.getItem('themeMode');
    return savedTheme === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('themeMode', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const theme = useMemo(() => (isDarkMode ? darkTheme : lightTheme), [isDarkMode]);

  const value = useMemo(
    () => ({
      toggleTheme,
      isDarkMode,
    }),
    [isDarkMode]
  );

  return (
    <MuiThemeProvider theme={theme}>
      <ThemeContext.Provider value={value}>
        <CssBaseline />
        {children}
      </ThemeContext.Provider>
    </MuiThemeProvider>
  );
};
