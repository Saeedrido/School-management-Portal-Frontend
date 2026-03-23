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
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  ArrowForward,
  Close,
  CheckCircle,
} from '@mui/icons-material';
import schoolLogo from '../../assets/school logo imj/school-logo bck.png';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';

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
  const [rememberMe, setRememberMe] = useState(false);
  
  // Forgot Password Modal State
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState('');

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
        ? (savedUser.roles[0].name || savedUser.roles[0].Name)
        : (savedUser.role || 'User');

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

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError('');
    setForgotSuccess(false);

    try {
      const response = await authAPI.forgotPassword({ email: forgotEmail });
      if (response.data?.success) {
        setForgotSuccess(true);
      }
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || 'Failed to send reset link';
      setForgotError(message);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleCloseForgotPassword = () => {
    setForgotPasswordOpen(false);
    setForgotEmail('');
    setForgotSuccess(false);
    setForgotError('');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(135deg, #F0F7F4 0%, #E8F2ED 50%, #D4EBE3 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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
          maxWidth: 400,
          width: '100%',
          borderRadius: 3,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
          backgroundColor: '#FFFFFF',
          position: 'relative',
          overflow: 'visible',
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          {/* Logo inside the card */}
          <Box sx={{ textAlign: 'center' }}>
            <Box
              component="img"
              src={schoolLogo}
              alt="School Logo"
              sx={{
                width: 140,
                height: 140,
                objectFit: 'contain',
              }}
            />
          </Box>
          {/* Welcome Text */}
          <Box sx={{ textAlign: 'center', mt: -3 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: '#1F2937',
                mb: 0.5,
                fontSize: { xs: '1.4rem', sm: '1.6rem' },
              }}
            >
              Welcome Back
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.9rem' }}>
              Sign in to continue
            </Typography>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
                '& .MuiAlert-icon': { color: '#EF4444' },
              }}
            >
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="body2"
                sx={{ color: '#374151', mb: 0.75, fontWeight: 600, fontSize: '0.8rem' }}
              >
                Email Address
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter your email"
                name="identifier"
                value={formData.identifier}
                onChange={handleChange}
                disabled={loading}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: '#6FAF8F', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 1.5,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: '#F8FAF9',
                    '&:hover': {
                      backgroundColor: '#F1F5F4',
                    },
                    '&.Mui-focused': {
                      backgroundColor: '#FFFFFF',
                      boxShadow: '0 0 0 3px rgba(111, 175, 143, 0.15)',
                    },
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(111, 175, 143, 0.2)',
                  },
                }}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                <Typography
                  variant="body2"
                  sx={{ color: '#374151', fontWeight: 600, fontSize: '0.8rem' }}
                >
                  Password
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#6FAF8F',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                  onClick={() => setForgotPasswordOpen(true)}
                >
                  Forgot password?
                </Typography>
              </Box>
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
                      <Lock sx={{ color: '#6FAF8F', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: '#64748B' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 2,
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
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(111, 175, 143, 0.2)',
                  },
                }}
              />
            </Box>

            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  sx={{
                    color: '#6FAF8F',
                    '&.Mui-checked': { color: '#6FAF8F' },
                  }}
                />
              }
              label={
                <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.85rem' }}>
                  Remember me
                </Typography>
              }
              sx={{ mb: 1 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="medium"
              disabled={loading}
              sx={{
                py: 1.25,
                mb: 2.5,
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
                '&:disabled': {
                  background: '#CBD5E1',
                  boxShadow: 'none',
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: '#fff' }} />
              ) : (
                <>
                  Sign In <ArrowForward sx={{ ml: 1, fontSize: 18 }} />
                </>
              )}
            </Button>
          </Box>

          <Divider sx={{ my: 3, borderColor: 'rgba(111, 175, 143, 0.1)' }}>
            <Typography variant="caption" sx={{ color: '#94A3B8', px: 1 }}>
              OR
            </Typography>
          </Divider>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#64748B', mb: 2, fontSize: '0.9rem' }}>
              Are you a student? Login as student
            </Typography>
            <Button
              variant="outlined"
              fullWidth
              component={Link}
              to="/student-login"
              sx={{
                py: 1.5,
                borderColor: '#6FAF8F',
                color: '#4E8C70',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
                borderRadius: '50px',
                backgroundColor: 'rgba(111, 175, 143, 0.05)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: '#4E8C70',
                  backgroundColor: 'rgba(111, 175, 143, 0.15)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              Student Login
            </Button>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.9rem' }}>
              Don't have an account?{' '}
              <Link
                to="/register"
                style={{
                  color: '#6FAF8F',
                  textDecoration: 'none',
                  fontWeight: 700,
                }}
              >
                Register now
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Forgot Password Modal */}
      <Dialog
        open={forgotPasswordOpen}
        onClose={handleCloseForgotPassword}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            padding: '10px',
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          pb: 1,
        }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1F2937' }}>
            Reset Password
          </Typography>
          <IconButton onClick={handleCloseForgotPassword} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {forgotSuccess ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <CheckCircle sx={{ fontSize: 60, color: '#6FAF8F', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1F2937', mb: 1 }}>
                Reset Link Sent
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B', mb: 2 }}>
                If the email <strong>{forgotEmail}</strong> is registered, you will receive a password reset link shortly.
              </Typography>
              <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                Please check your inbox and spam folder. The link expires in 30 minutes.
              </Typography>
            </Box>
          ) : (
            <>
              <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
                Enter your email address and we'll send you a link to reset your password.
              </Typography>
              {forgotError && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                  {forgotError}
                </Alert>
              )}
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                disabled={forgotLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: '#6FAF8F' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&.Mui-focused': {
                      boxShadow: '0 0 0 3px rgba(111, 175, 143, 0.15)',
                    },
                  },
                }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          {!forgotSuccess && (
            <>
              <Button 
                onClick={handleCloseForgotPassword}
                sx={{ color: '#64748B' }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleForgotPassword}
                disabled={forgotLoading || !forgotEmail}
                sx={{
                  background: 'linear-gradient(135deg, #6FAF8F 0%, #4E8C70 100%)',
                  borderRadius: '50px',
                  px: 4,
                  fontWeight: 600,
                  boxShadow: '0 4px 14px rgba(111, 175, 143, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5FA08A 0%, #3D7B5F 100%)',
                  },
                  '&:disabled': {
                    background: '#CBD5E1',
                  }
                }}
              >
                {forgotLoading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Send Reset Link'}
              </Button>
            </>
          )}
          {forgotSuccess && (
            <Button
              variant="contained"
              onClick={handleCloseForgotPassword}
              sx={{
                background: 'linear-gradient(135deg, #6FAF8F 0%, #4E8C70 100%)',
                borderRadius: '50px',
                px: 4,
                fontWeight: 600,
                boxShadow: '0 4px 14px rgba(111, 175, 143, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5FA08A 0%, #3D7B5F 100%)',
                },
              }}
            >
              Done
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Login;
