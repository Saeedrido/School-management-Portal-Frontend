import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  Paper,
  Chip,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  LightMode,
  DarkMode,
} from '@mui/icons-material';
import { useThemeContext } from '../context/ThemeContext';

const Settings = () => {
  const navigate = useNavigate();
  const { toggleTheme, isDarkMode } = useThemeContext();

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 } }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: { xs: 2, sm: 3 },
          gap: 2,
        }}
      >
        <SettingsIcon sx={{ fontSize: { xs: 28, sm: 32 }, color: 'primary.main' }} />
        <Typography
          variant="h4"
          sx={{
            color: 'text.primary',
            fontWeight: 700,
            fontSize: { xs: '1.5rem', sm: '2rem' },
          }}
        >
          Settings
        </Typography>
      </Box>

      {/* Theme Settings Card */}
      <Card
        sx={{
          borderRadius: { xs: 2, sm: 3 },
          boxShadow: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mb: { xs: 2, sm: 3 },
              gap: 2,
            }}
          >
            {isDarkMode ? (
              <DarkMode sx={{ fontSize: 32, color: 'text.primary' }} />
            ) : (
              <LightMode sx={{ fontSize: 32, color: 'text.primary' }} />
            )}
            <Typography
              variant="h5"
              sx={{
                color: 'text.primary',
                fontWeight: 600,
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
              }}
            >
              Change Theme
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: { xs: 2, sm: 3 },
              borderRadius: { xs: 2, sm: 3 },
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {isDarkMode ? (
                <DarkMode sx={{ fontSize: 24, color: 'primary.main' }} />
              ) : (
                <LightMode sx={{ fontSize: 24, color: 'primary.main' }} />
              )}
              <Typography
                variant="body1"
                sx={{
                  color: 'text.primary',
                  fontWeight: 500,
                  fontSize: { xs: '0.95rem', sm: '1rem' },
                }}
              >
                {isDarkMode ? 'Dark' : 'Light'}
              </Typography>
            </Box>

            <Switch
              checked={isDarkMode}
              onChange={toggleTheme}
              sx={{
                '& .MuiSwitch-switchBase': {
                  color: 'primary.main',
                  '&.Mui-checked': {
                    color: 'primary.main',
                  },
                },
                '& .MuiSwitch-track': {
                  backgroundColor: 'text.secondary',
                },
              }}
            />
          </Box>

          <Box sx={{ mt: { xs: 2, sm: 3 } }}>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontSize: { xs: '0.85rem', sm: '0.875rem' },
                lineHeight: 1.6,
              }}
            >
              Toggle the switch to change between Dark mode (current) and
              Green & White mode. Your theme preference will be saved and
              persist across browser sessions.
            </Typography>
          </Box>

          <Box sx={{ mt: { xs: 2, sm: 3 } }}>
            <Chip
              icon={isDarkMode ? <DarkMode /> : <LightMode />}
              label={`Current theme: ${isDarkMode ? 'Dark' : 'Light'} mode`}
              size="small"
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                fontWeight: 600,
                '& .MuiChip-icon': {
                  color: 'white',
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Back Button */}
      <Box sx={{ mt: { xs: 2, sm: 3 } }}>
        <Paper
          onClick={() => navigate(-1)}
          sx={{
            p: { xs: 1.5, sm: 2 },
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            borderRadius: { xs: 2, sm: 3 },
            cursor: 'pointer',
            boxShadow: 2,
            border: '1px solid',
            borderColor: 'divider',
            '&:hover': {
              boxShadow: 4,
              bgcolor: 'action.hover',
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          <SettingsIcon sx={{ fontSize: { xs: 18, sm: 20 }, color: 'text.secondary' }} />
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontWeight: 500,
              fontSize: { xs: '0.9rem', sm: '1rem' },
            }}
          >
            Back to Dashboard
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Settings;
