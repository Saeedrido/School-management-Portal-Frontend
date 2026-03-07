import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  People,
  Class as ClassIcon,
  Quiz,
  Assessment,
  TrendingUp,
  School,
  Event,
  Notifications,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { dashboardAPI } from '../../services/api';

const StatCard = ({ title, value, icon, color, gradient, trend }) => (
  <Card
    sx={{
      height: '100%',
      borderRadius: 4,
      background: gradient,
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
      transition: 'transform 0.3s, box-shadow 0.3s',
      '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
      },
      '&::before': {
        content: '""',
        position: 'absolute',
        top: -50,
        right: -50,
        width: 150,
        height: 150,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.1)',
      },
    }}
  >
    <CardContent>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 2,
        }}
      >
        <Box>
          <Typography
            variant="body2"
            sx={{ opacity: 0.9, fontWeight: 500, mb: 1 }}
          >
            {title}
          </Typography>
          <Typography variant="h3" component="div" sx={{ fontWeight: 700 }}>
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 3,
            bgcolor: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      </Box>
      {trend && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <TrendingUp sx={{ fontSize: 16 }} />
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            {trend}
          </Typography>
        </Box>
      )}
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    totalExams: 0,
    totalResults: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await dashboardAPI.getStatistics();
        setStats({
          totalStudents: response.data.totalStudents || 0,
          totalClasses: response.data.totalClasses || 0,
          totalExams: response.data.totalExams || 0,
          totalResults: response.data.totalResults || 0,
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard statistics:', err);
        setError('Failed to load dashboard statistics');
        // Keep default values on error
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const quickActions = [
    {
      title: 'Manage Students',
      icon: <People />,
      color: '#2196F3',
      path: '/dashboard/students',
      roles: ['Admin', 'Teacher'],
    },
    {
      title: 'Manage Classes',
      icon: <ClassIcon />,
      color: '#66BB6A',
      path: '/dashboard/classes',
      roles: ['Admin', 'Teacher'],
    },
    {
      title: 'Create Exams',
      icon: <Quiz />,
      color: '#EF5350',
      path: '/dashboard/exams',
      roles: ['Admin', 'Teacher'],
    },
    {
      title: 'View Results',
      icon: <Assessment />,
      color: '#FFA726',
      path: '/dashboard/results',
      roles: ['Admin', 'Teacher', 'Student'],
    },
  ].filter((action) => action.roles.includes(user?.role));

  const recentActivities = [
    { text: 'New student enrolled in JSS 1', time: '2 hours ago', color: '#66BB6A' },
    { text: 'Mathematics exam results published', time: '5 hours ago', color: '#2196F3' },
    { text: 'Staff meeting scheduled for tomorrow', time: '1 day ago', color: '#EF5350' },
  ];

  const upcomingEvents = [
    { title: 'Mid-Term Exams', date: 'Feb 15, 2025', color: '#EF5350' },
    { title: 'Parent-Teacher Meeting', date: 'Feb 20, 2025', color: '#2196F3' },
    { title: 'Sports Day', date: 'Feb 28, 2025', color: '#66BB6A' },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {!loading && error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Welcome Header */}
      <Box
        sx={{
          mb: 4,
          background: 'linear-gradient(135deg, #2196F3 0%, #66BB6A 100%)',
          borderRadius: 4,
          p: 4,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, position: 'relative', zIndex: 1 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'rgba(255,255,255,0.2)',
              fontSize: 32,
              fontWeight: 700,
            }}
          >
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
              {getWelcomeMessage()}, {user?.name?.split(' ')[0]}!
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Welcome to your {user?.role} Dashboard
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Chip
                label={user?.role}
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 600,
                }}
              />
              <Chip
                label="Active"
                size="small"
                sx={{
                  bgcolor: 'rgba(102, 187, 106, 0.3)',
                  color: 'white',
                  fontWeight: 600,
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={<People sx={{ fontSize: 28 }} />}
            gradient="linear-gradient(135deg, #2196F3 0%, #1976D2 100%)"
            trend="+12% from last month"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Classes"
            value={stats.totalClasses}
            icon={<ClassIcon sx={{ fontSize: 28 }} />}
            gradient="linear-gradient(135deg, #66BB6A 0%, #388E3C 100%)"
            trend="+2 new this term"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Exams"
            value={stats.totalExams}
            icon={<Quiz sx={{ fontSize: 28 }} />}
            gradient="linear-gradient(135deg, #EF5350 0%, #C62828 100%)"
            trend="5 exams this week"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Results Published"
            value={stats.totalResults}
            icon={<Assessment sx={{ fontSize: 28 }} />}
            gradient="linear-gradient(135deg, #FFA726 0%, #F57C00 100%)"
            trend="+8% improvement"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 4,
              height: '100%',
              background: 'linear-gradient(180deg, #FFFFFF 0%, #F5F7FA 100%)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #2196F3 0%, #66BB6A 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <School sx={{ color: 'white' }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976D2' }}>
                Quick Actions
              </Typography>
            </Box>

            <Grid container spacing={2}>
              {quickActions.map((action) => (
                <Grid item xs={12} sm={6} key={action.title}>
                  <Box
                    onClick={() => navigate(action.path)}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      border: '2px solid',
                      borderColor: `${action.color}20`,
                      background: `${action.color}08`,
                      transition: 'all 0.3s',
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: action.color,
                        background: `${action.color}15`,
                        transform: 'translateX(4px)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          background: action.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                        }}
                      >
                        {action.icon}
                      </Box>
                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 600, color: '#1976D2' }}
                        >
                          {action.title}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 4,
              height: '100%',
              background: 'linear-gradient(180deg, #FFFFFF 0%, #F5F7FA 100%)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #66BB6A 0%, #EF5350 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Notifications sx={{ color: 'white', fontSize: 20 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#2E7D32' }}>
                Recent Activity
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {recentActivities.map((activity, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    gap: 2,
                    alignItems: 'flex-start',
                    p: 2,
                    borderRadius: 2,
                    background: 'white',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: activity.color,
                      mt: 1,
                      flexShrink: 0,
                    }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 500, color: '#546E7A' }}
                    >
                      {activity.text}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: '#90A4AE' }}
                    >
                      {activity.time}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Announcements */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 4,
              background: 'linear-gradient(135deg, #E3F2FD 0%, #F1F8E9 100%)',
              border: '2px dashed #2196F3',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
              <Event sx={{ color: '#2196F3', fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976D2' }}>
                Upcoming Events
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {upcomingEvents.map((event, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    background: 'white',
                    borderLeft: `4px solid ${event.color}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, color: '#546E7A' }}
                  >
                    {event.title}
                  </Typography>
                  <Chip
                    label={event.date}
                    size="small"
                    sx={{
                      bgcolor: `${event.color}15`,
                      color: event.color,
                      fontWeight: 600,
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Welcome Message */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 4,
              background: 'linear-gradient(135deg, #66BB6A 0%, #EF5350 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: -30,
                right: -30,
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
              }}
            />
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
              🎉 Welcome to the New Academic Session!
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
              We're excited to have you back. Check out the new features and improvements
              we've made to enhance your learning experience.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip
                label="✨ Updated Dashboard"
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
              <Chip
                label="📱 Mobile Friendly"
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
              <Chip
                label="⚡ Faster Performance"
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
