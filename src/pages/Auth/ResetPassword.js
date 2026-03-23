import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Card,
  CardContent,
  LinearProgress,
} from '@mui/material';
import {
  Lock,
  Visibility,
  VisibilityOff,
  CheckCircle,
  Error as ErrorIcon,
  ArrowForward,
} from '@mui/icons-material';
import schoolLogo from '../../assets/school logo imj/school-logo bck.png';
import { authAPI } from '../../services/api';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [token]);

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) {
      errors.push('At least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('One uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('One lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('One number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('One special character');
    }
    return errors;
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 20;
    return strength;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords({
      ...passwords,
      [name]: value,
    });
    setError('');
    setValidationErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});

    // Validate passwords match
    if (passwords.newPassword !== passwords.confirmPassword) {
      setValidationErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    // Validate password strength
    const pwdErrors = validatePassword(passwords.newPassword);
    if (pwdErrors.length > 0) {
      setValidationErrors({ 
        newPassword: `Password must contain: ${pwdErrors.join(', ')}` 
      });
      return;
    }

    setLoading(true);

    try {
      await authAPI.resetPassword({
        token: token,
        newPassword: passwords.newPassword,
        confirmPassword: passwords.confirmPassword,
      });
      setSuccess(true);
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || 'Failed to reset password. The link may have expired.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(passwords.newPassword);
  const getStrengthColor = () => {
    if (passwordStrength <= 20) return '#F44336';
    if (passwordStrength <= 40) return '#FF9800';
    if (passwordStrength <= 60) return '#FFC107';
    if (passwordStrength <= 80) return '#8BC34A';
    return '#4CAF50';
  };

  if (success) {
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
        <Card
          sx={{
            maxWidth: 440,
            width: '100%',
            borderRadius: 4,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
            backgroundColor: '#FFFFFF',
            position: 'relative',
            overflow: 'visible',
            mx: 2,
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 5 }, textAlign: 'center' }}>
            <Box sx={{ mb: 3 }}>
              <Box
                component="img"
                src={schoolLogo}
                alt="School Logo"
                sx={{
                  width: 120,
                  height: 120,
                  objectFit: 'contain',
                }}
              />
            </Box>
            
            <CheckCircle sx={{ fontSize: 60, color: '#4CAF50', mb: 2 }} />
            
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: '#1F2937',
                mb: 1,
              }}
            >
              Password Reset Successful
            </Typography>
            
            <Typography variant="body2" sx={{ color: '#64748B', mb: 4 }}>
              Your password has been successfully reset. You can now log in with your new password.
            </Typography>
            
            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate('/login')}
              sx={{
                py: 1.8,
                background: 'linear-gradient(135deg, #6FAF8F 0%, #4E8C70 100%)',
                borderRadius: '50px',
                fontWeight: 700,
                boxShadow: '0 4px 14px rgba(111, 175, 143, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5FA08A 0%, #3D7B5F 100%)',
                  boxShadow: '0 6px 20px rgba(111, 175, 143, 0.5)',
                },
              }}
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

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
          maxWidth: 440,
          width: '100%',
          borderRadius: 4,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
          backgroundColor: '#FFFFFF',
          position: 'relative',
          overflow: 'visible',
          mx: 2,
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
          {/* Logo */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              component="img"
              src={schoolLogo}
              alt="School Logo"
              sx={{
                width: 120,
                height: 120,
                objectFit: 'contain',
              }}
            />
          </Box>
          
          {/* Welcome Text */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: '#1F2937',
                mb: 0.5,
              }}
            >
              Reset Password
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.9rem' }}>
              Create a new password for your account
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
              icon={<ErrorIcon />}
            >
              {error}
            </Alert>
          )}

          {token ? (
            <Box component="form" onSubmit={handleSubmit}>
              {/* New Password */}
              <Box sx={{ mb: 2.5 }}>
                <Typography
                  variant="body2"
                  sx={{ color: '#374151', mb: 1, fontWeight: 600, fontSize: '0.85rem' }}
                >
                  New Password
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter new password"
                  name="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={passwords.newPassword}
                  onChange={handleChange}
                  disabled={loading}
                  error={!!validationErrors.newPassword}
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
                    mb: 1,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2.5,
                      backgroundColor: '#F8FAF9',
                      '&:hover': { backgroundColor: '#F1F5F4' },
                      '&.Mui-focused': {
                        backgroundColor: '#FFFFFF',
                        boxShadow: '0 0 0 3px rgba(111, 175, 143, 0.15)',
                      },
                    },
                  }}
                />
                {passwords.newPassword && (
                  <Box sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        Password Strength:
                      </Typography>
                      <Typography variant="caption" sx={{ color: getStrengthColor(), fontWeight: 600 }}>
                        {passwordStrength <= 20 ? 'Weak' : passwordStrength <= 40 ? 'Fair' : passwordStrength <= 60 ? 'Good' : passwordStrength <= 80 ? 'Strong' : 'Very Strong'}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={passwordStrength}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: '#E5E7EB',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3,
                          bgcolor: getStrengthColor(),
                        },
                      }}
                    />
                  </Box>
                )}
                {validationErrors.newPassword && (
                  <Typography variant="caption" sx={{ color: '#EF4444', display: 'block', mt: 0.5 }}>
                    {validationErrors.newPassword}
                  </Typography>
                )}
              </Box>

              {/* Confirm Password */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="body2"
                  sx={{ color: '#374151', mb: 1, fontWeight: 600, fontSize: '0.85rem' }}
                >
                  Confirm Password
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Confirm new password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwords.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                  error={!!validationErrors.confirmPassword}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: '#6FAF8F', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                          sx={{ color: '#64748B' }}
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2.5,
                      backgroundColor: '#F8FAF9',
                      '&:hover': { backgroundColor: '#F1F5F4' },
                      '&.Mui-focused': {
                        backgroundColor: '#FFFFFF',
                        boxShadow: '0 0 0 3px rgba(111, 175, 143, 0.15)',
                      },
                    },
                  }}
                />
                {validationErrors.confirmPassword && (
                  <Typography variant="caption" sx={{ color: '#EF4444', display: 'block', mt: 0.5 }}>
                    {validationErrors.confirmPassword}
                  </Typography>
                )}
              </Box>

              {/* Password Requirements */}
              <Box sx={{ mb: 3, p: 2, bgcolor: '#F9FAFB', borderRadius: 2 }}>
                <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, display: 'block', mb: 1 }}>
                  Password must contain:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {[
                    { label: '8+ chars', valid: passwords.newPassword.length >= 8 },
                    { label: 'Uppercase', valid: /[A-Z]/.test(passwords.newPassword) },
                    { label: 'Lowercase', valid: /[a-z]/.test(passwords.newPassword) },
                    { label: 'Number', valid: /[0-9]/.test(passwords.newPassword) },
                    { label: 'Special', valid: /[!@#$%^&*(),.?":{}|<>]/.test(passwords.newPassword) },
                  ].map((req, i) => (
                    <Box
                      key={i}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        bgcolor: req.valid ? '#ECFDF5' : '#F3F4F6',
                      }}
                    >
                      <CheckCircle sx={{ fontSize: 12, color: req.valid ? '#10B981' : '#9CA3AF' }} />
                      <Typography variant="caption" sx={{ color: req.valid ? '#059669' : '#6B7280', fontWeight: 500 }}>
                        {req.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading || !passwords.newPassword || !passwords.confirmPassword}
                sx={{
                  py: 1.8,
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
                    Reset Password <ArrowForward sx={{ ml: 1, fontSize: 18 }} />
                  </>
                )}
              </Button>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <ErrorIcon sx={{ fontSize: 60, color: '#EF4444', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#1F2937', mb: 2 }}>
                Invalid Reset Link
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
                This password reset link is invalid or has expired.
              </Typography>
              <Button
                variant="contained"
                component={Link}
                to="/forgot-password"
                sx={{
                  background: 'linear-gradient(135deg, #6FAF8F 0%, #4E8C70 100%)',
                  borderRadius: '50px',
                  px: 4,
                  fontWeight: 600,
                }}
              >
                Request New Link
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ResetPassword;
