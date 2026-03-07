import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

    if (!formData.identifier || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    const result = await login(formData.identifier, formData.password);

    setLoading(false);

    if (result.success) {
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const userRole = savedUser.roles && savedUser.roles.length > 0
        ? savedUser.roles[0].name
        : 'User';

      // Use setTimeout to ensure navigation happens after state updates
      setTimeout(() => {
        if (userRole === 'Student') {
          navigate('/student/exams', { replace: true });
        } else if (userRole === 'Teacher') {
          navigate('/teacher-dashboard', { replace: true });
        } else if (userRole === 'Admin') {
          navigate('/admin-dashboard', { replace: true });
        } else if (userRole === 'Parent') {
          navigate('/parent-dashboard', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }, 100);
    } else {
      setError(result.error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #EAF5F1 0%, #D4EBE3 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 420,
          width: '100%',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          backgroundColor: '#FFFFFF',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1F2937', mb: 1 }}>
              Welcome Back
            </Typography>
            <Typography variant="body2" sx={{ color: '#4B5563' }}>
              Sign in to your account
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="body2" sx={{ color: '#1F2937', mb: 1, fontWeight: 500 }}>
              Email
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter your email"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: '#5FAF8F' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: '#EAF5F1' } }}
            />

            <Typography variant="body2" sx={{ color: '#1F2937', mb: 1, fontWeight: 500 }}>
              Password
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter your password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: '#5FAF8F' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: '#4B5563' }}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 4, '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: '#EAF5F1' } }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.8,
                mb: 3,
                background: 'linear-gradient(135deg, #5FAF8F 0%, #2E8B57 100%)',
                borderRadius: '50px',
                fontWeight: 600,
                boxShadow: '0 4px 14px rgba(95, 175, 143, 0.4)',
                '&:hover': { 
                  background: 'linear-gradient(135deg, #4E9A7A 0%, #1F6B42 100%)',
                  boxShadow: '0 6px 20px rgba(95, 175, 143, 0.5)',
                },
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Sign In'}
            </Button>
          </Box>

          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography variant="body2" sx={{ color: '#4B5563' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#5FAF8F', textDecoration: 'none', fontWeight: 600 }}>
                Register
              </Link>
            </Typography>
          </Box>

          <Divider sx={{ my: 3, borderColor: '#EAF5F1' }} />

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#4B5563', mb: 2 }}>
              Are you a student?
            </Typography>
            <Button
              variant="outlined"
              fullWidth
              component={Link}
              to="/student-login"
              sx={{
                py: 1.5,
                borderColor: '#5FAF8F',
                color: '#2E8B57',
                textDecoration: 'none',
                fontWeight: 600,
                borderRadius: '50px',
                '&:hover': {
                  borderColor: '#2E8B57',
                  backgroundColor: 'rgba(95, 175, 143, 0.1)',
                },
              }}
            >
              Student Login
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
