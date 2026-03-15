import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Avatar,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  Person,
  School,
  TrendingUp,
  People,
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ParentDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.parents.getMyChildren();
      if (response.data && response.data.success) {
        setChildren(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getAvatarColor = (name) => {
    const colors = ['#2196F3', '#66BB6A', '#EF5350', '#FFA726', '#AB47BC'];
    const index = name?.charCodeAt(0) % colors.length || 0;
    return colors[index];
  };

  const statsCards = [
    {
      title: 'My Children',
      value: children.length,
      icon: <People sx={{ fontSize: 40, color: '#FF3E8A' }} />,
      bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      title: 'View Results',
      value: 'Results',
      icon: <TrendingUp sx={{ fontSize: 40, color: '#FF3E8A' }} />,
      bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(180deg, #0a192f 0%, #0d1b2a 40%, #000000 100%)'
          : 'background.default',
      }}
    >
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
        {/* Welcome Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
            }}
          >
            Welcome back, {user?.name || 'Parent'}!
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1 }}>
            Here's an overview of your children's academic performance.
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statsCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  background: stat.bg,
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                        {stat.title}
                      </Typography>
                      <Typography variant="h3" sx={{ color: '#ffffff', fontWeight: 700 }}>
                        {stat.value}
                      </Typography>
                    </Box>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)' }}>
                      {stat.icon}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* My Children Section */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: 'text.primary',
            mb: 3,
          }}
        >
          My Children
        </Typography>

        {children.length === 0 ? (
          <Card sx={{ background: 'rgba(17, 17, 17, 0.8)', borderRadius: 3 }}>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <Person sx={{ fontSize: 60, color: 'rgba(255, 255, 255, 0.2)', mb: 2 }} />
              <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.5)', mb: 2 }}>
                No Children Found
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                You don't have any children linked to your account yet.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {children.map((child) => (
              <Grid item xs={12} sm={6} md={4} key={child.studentProfileId}>
                <Card
                  sx={{
                    background: 'rgba(17, 17, 17, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 3,
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      borderColor: '#FF3E8A',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar
                        sx={{
                          width: 56,
                          height: 56,
                          bgcolor: getAvatarColor(child.fullName),
                          fontSize: '1.5rem',
                        }}
                      >
                        {child.fullName?.charAt(0) || 'S'}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 600 }}>
                          {child.fullName || 'Unknown'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                          {child.studentNumber || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      <Box
                        sx={{
                          px: 2,
                          py: 0.5,
                          borderRadius: 1,
                          bgcolor: child.relationship === 'Father' ? '#E3F2FD' : 
                                   child.relationship === 'Mother' ? '#FFF3E0' : '#E8F5E9',
                        }}
                      >
                        <Typography variant="caption" sx={{ 
                          color: child.relationship === 'Father' ? '#1976D2' : 
                                child.relationship === 'Mother' ? '#F57C00' : '#388E3C',
                          fontWeight: 500,
                        }}>
                          {child.relationship || 'Parent'}
                        </Typography>
                      </Box>
                      {child.isPrimaryContact && (
                        <Box
                          sx={{
                            px: 2,
                            py: 0.5,
                            borderRadius: 1,
                            bgcolor: 'rgba(255, 62, 138, 0.1)',
                          }}
                        >
                          <Typography variant="caption" sx={{ color: '#FF3E8A', fontWeight: 500 }}>
                            Primary Contact
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<TrendingUp />}
                      onClick={() => navigate(`/parent-dashboard/results/${child.studentProfileId}`)}
                      sx={{
                        bgcolor: '#FF3E8A',
                        '&:hover': { bgcolor: '#FF5DA3' },
                        borderRadius: 2,
                      }}
                    >
                      View Results
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Quick Actions */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: 'text.primary',
            mb: 3,
            mt: 4,
          }}
        >
          Quick Actions
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<People />}
              onClick={() => navigate('/parent-dashboard/children')}
              sx={{
                py: 2,
                borderColor: 'rgba(255, 255, 255, 0.2)',
                color: 'text.primary',
                '&:hover': {
                  borderColor: '#FF3E8A',
                  bgcolor: 'rgba(255, 62, 138, 0.1)',
                },
              }}
            >
              View All Children
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<TrendingUp />}
              onClick={() => navigate('/parent-dashboard/results')}
              sx={{
                py: 2,
                borderColor: 'rgba(255, 255, 255, 0.2)',
                color: 'text.primary',
                '&:hover': {
                  borderColor: '#FF3E8A',
                  bgcolor: 'rgba(255, 62, 138, 0.1)',
                },
              }}
            >
              View Results
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<School />}
              onClick={() => navigate('/parent-dashboard/settings')}
              sx={{
                py: 2,
                borderColor: 'rgba(255, 255, 255, 0.2)',
                color: 'text.primary',
                '&:hover': {
                  borderColor: '#FF3E8A',
                  bgcolor: 'rgba(255, 62, 138, 0.1)',
                },
              }}
            >
              Settings
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ParentDashboard;
