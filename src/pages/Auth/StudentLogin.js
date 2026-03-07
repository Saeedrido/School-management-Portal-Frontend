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
import { School } from '@mui/icons-material';
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
      console.log('🎓 STUDENT LOGIN ATTEMPT:', { studentNumber: formData.studentNumber });

      const response = await authAPI.studentLogin({
        studentNumber: formData.studentNumber,
      });

      console.log('📨 STUDENT LOGIN RESPONSE:', response.data);

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

        console.log('✅ Student login successful - normalized user:', normalizedUser);

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
      console.error('🚨 STUDENT LOGIN ERROR:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });

      // Use getErrorMessage for consistent error handling
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
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
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #5FAF8F 0%, #2E8B57 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <School sx={{ fontSize: 40, color: '#FFFFFF' }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1F2937', mb: 1 }}>
              Student Login
            </Typography>
            <Typography variant="body2" sx={{ color: '#4B5563' }}>
              Enter your student number to access your exams
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="body2" sx={{ color: '#1F2937', mb: 1, fontWeight: 500 }}>
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
                    <School sx={{ color: '#5FAF8F' }} />
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
              {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Login'}
            </Button>
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#4B5563' }}>
              Are you a staff member?{' '}
              <Link to="/login" style={{ color: '#5FAF8F', textDecoration: 'none', fontWeight: 600 }}>
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
