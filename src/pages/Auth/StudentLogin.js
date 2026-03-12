import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  Card,
  CardContent,
} from '@mui/material';
import { School, ArrowForward } from '@mui/icons-material';
import { authAPI, getErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const StudentLogin = () => {
  const navigate = useNavigate();
  const { refreshAuthState } = useAuth();
  const [formData, setFormData] = useState({
    studentNumber: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.studentNumber) {
      setError('Please enter your student number');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.studentLogin({
        studentNumber: formData.studentNumber,
      });

      if (response.data?.success) {
        const { token, refreshToken, user } = response.data.data;

        const firstName = user.firstName || user.FirstName || '';
        const lastName = user.lastName || user.LastName || '';
        const roles = user.roles || user.Roles || [];
        const normalizedUser = {
          ...user,
          name: user.fullName || user.FullName || `${firstName} ${lastName}`.trim() || 'Student',
          role: (roles && roles.length > 0) ? (roles[0].name || roles[0].Name) : 'Student',
        };

        localStorage.setItem('token', token);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        localStorage.setItem('user', JSON.stringify(normalizedUser));

        refreshAuthState();

        navigate('/student-dashboard');
      } else {
        setError(response.data?.message || 'Login failed');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #F0F7F4 0%, #E8F2ED 50%, #D4EBE3 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 3 },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Decorations */}
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'rgba(111, 175, 143, 0.08)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -50,
          left: -50,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(111, 175, 143, 0.06)',
        }}
      />

      <Card
        sx={{
          maxWidth: 440,
          width: '100%',
          borderRadius: 4,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
          backgroundColor: '#FFFFFF',
          position: 'relative',
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
          {/* Logo */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #6FAF8F 0%, #4E8C70 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                boxShadow: '0 8px 24px rgba(111, 175, 143, 0.35)',
              }}
            >
              <School sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: '#1F2937',
                mb: 0.5,
                fontSize: { xs: '1.5rem', sm: '1.75rem' },
              }}
            >
              Student Login
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.95rem' }}>
              Enter your student number to access your exams
            </Typography>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
              }}
            >
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="body2"
                sx={{ color: '#374151', mb: 1, fontWeight: 600, fontSize: '0.85rem' }}
              >
                Student Number
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter your student number"
                name="studentNumber"
                value={formData.studentNumber}
                onChange={handleChange}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <School sx={{ color: '#6FAF8F', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                    backgroundColor: '#F8FAF9',
                    '&:hover': {
                      backgroundColor: '#F1F5F4',
                    },
                    '&.Mui-focused': {
                      backgroundColor: '#FFFFFF',
                      boxShadow: '0 0 0 3px rgba(111, 175, 143, 0.15)',
                    },
                  },
                }}
              />
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.8,
                mb: 3,
                background: 'linear-gradient(135deg, #6FAF8F 0%, #4E8C70 100%)',
                borderRadius: '50px',
                fontWeight: 700,
                fontSize: '0.95rem',
                boxShadow: '0 4px 14px rgba(111, 175, 143, 0.4)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5FA08A 0%, #3D7B5F 100%)',
                  boxShadow: '0 8px 24px rgba(111, 175, 143, 0.5)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: '#fff' }} />
              ) : (
                <>
                  Login <ArrowForward sx={{ ml: 1, fontSize: 18 }} />
                </>
              )}
            </Button>
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.9rem' }}>
              Are you a staff member?{' '}
              <Link
                to="/login"
                style={{
                  color: '#6FAF8F',
                  textDecoration: 'none',
                  fontWeight: 700,
                }}
              >
                Login here
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default StudentLogin;
