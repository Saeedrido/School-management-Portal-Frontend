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
  Chip,
  LinearProgress,
  Divider,
  InputBase,
} from '@mui/material';
import {
  Person,
  School,
  TrendingUp,
  People,
  CalendarMonth,
  Assignment,
  Message,
  Notifications,
  EmojiEvents,
  MenuBook,
  Search,
  ArrowForward,
  Star,
  AccessTime,
  CheckCircle,
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ParentDashboard = () => {
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
    const colors = ['#6FAF8F', '#4E8C70', '#8BC34A', '#009688', '#FF9800', '#9C27B0'];
    const index = name?.charCodeAt(0) % colors.length || 0;
    return colors[index];
  };

  const stats = [
    { icon: <People />, label: 'Total Children', value: children.length, color: '#6FAF8F', bg: '#E8F5E9' },
    { icon: <TrendingUp />, label: 'Avg. Performance', value: '85%', color: '#2196F3', bg: '#E3F2FD' },
    { icon: <MenuBook />, label: 'Upcoming Exams', value: '2', color: '#FF9800', bg: '#FFF3E0' },
  ];

  const activities = [
    { title: 'Mathematics Result Released', desc: 'John\'s Term 2 math result is now available', time: '2 hours ago', icon: <CheckCircle />, color: '#4CAF50' },
    { title: 'Attendance Update', desc: 'Jane marked present for today', time: '5 hours ago', icon: <School />, color: '#2196F3' },
    { title: 'New Achievement', desc: 'John received "Star Student" award', time: '1 day ago', icon: <EmojiEvents />, color: '#FF9800' },
  ];

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        bgcolor: '#FAFBFC'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ color: '#6FAF8F', mb: 2 }} />
          <Typography variant="body2" sx={{ color: '#64748B' }}>Loading your dashboard...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#FAFBFC',
    }}>
      {/* Top Navigation Bar */}
      <Box sx={{ 
        bgcolor: '#fff',
        borderBottom: '1px solid #E5E7EB',
        px: { xs: 2, sm: 4 },
        py: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ 
            width: 40, 
            height: 40, 
            borderRadius: 2,
            bgcolor: '#6FAF8F',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <School sx={{ color: '#fff', fontSize: 24 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1F2937' }}>
            300 Arundel Learning
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            bgcolor: '#F3F4F6',
            borderRadius: 2,
            px: 2,
            py: 1,
          }}>
            <Search sx={{ color: '#9CA3AF', mr: 1 }} />
            <InputBase placeholder="Search..." sx={{ fontSize: '0.875rem' }} />
          </Box>
          <Avatar sx={{ bgcolor: '#6FAF8F', width: 40, height: 40 }}>
            {user?.name?.charAt(0) || 'P'}
          </Avatar>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 2, sm: 4 }, py: 4 }}>
        
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, color: '#111827', mb: 0.75, fontSize: { xs: '1.5rem', sm: '1.75rem' } }}>
            Welcome back, {user?.name?.split(' ')[0] || 'Parent'} 👋
          </Typography>
          <Typography variant="body1" sx={{ color: '#6B7280', fontSize: '0.9rem' }}>
            Here's what's happening with your children's education today.
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {stats.map((stat, i) => (
            <Grid size={{ xs: 6, md: 3 }} key={i}>
              <Card sx={{ 
                borderRadius: 2.5, 
                border: '1px solid #E5E7EB',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px rgba(111, 175, 143, 0.12)',
                  borderColor: '#6FAF8F',
                }
              }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
                    <Box sx={{ 
                      p: 1.5, 
                      borderRadius: 2.5, 
                      bgcolor: stat.bg,
                    }}>
                      {React.cloneElement(stat.icon, { sx: { color: stat.color, fontSize: 24 } })}
                    </Box>
                    <ArrowForward sx={{ color: '#D1D5DB', fontSize: 20 }} />
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#111827', fontSize: '2rem', lineHeight: 1, mb: 0.5 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500 }}>
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Main Content Grid */}
        <Grid container spacing={4}>
          {/* Children Section */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827' }}>
                Your Children
              </Typography>
              <Button 
                endIcon={<ArrowForward />}
                onClick={() => navigate('/parent-dashboard/children')}
                sx={{ color: '#6FAF8F', fontWeight: 600 }}
              >
                View All
              </Button>
            </Box>

            {children.length === 0 ? (
              <Card sx={{ 
                borderRadius: 3, 
                border: '1px solid #E5E7EB',
                p: 6,
                textAlign: 'center',
                bgcolor: '#fff',
              }}>
                <Avatar sx={{ 
                  width: 80, 
                  height: 80, 
                  bgcolor: '#E8F5E9',
                  mx: 'auto',
                  mb: 2
                }}>
                  <Person sx={{ fontSize: 40, color: '#6FAF8F' }} />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#374151', mb: 1 }}>
                  No Children Yet
                </Typography>
                <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                  Children linked to your account will appear here
                </Typography>
              </Card>
            ) : (
              <Grid container spacing={3}>
                {children.slice(0, 4).map((child, i) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={i}>
                    <Card sx={{ 
                      borderRadius: 3, 
                      border: '1px solid #E5E7EB',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      overflow: 'hidden',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 16px 32px rgba(111, 175, 143, 0.12)',
                        borderColor: '#6FAF8F',
                        '& .view-btn': { bgcolor: '#5a9a7a' }
                      }
                    }}>
                      <Box sx={{ 
                        height: 4, 
                        background: `linear-gradient(90deg, ${getAvatarColor(child.fullName)} 0%, ${getAvatarColor(child.fullName)}cc 100%)` 
                      }} />
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
                          <Avatar
                            sx={{
                              width: 52,
                              height: 52,
                              bgcolor: getAvatarColor(child.fullName),
                              fontWeight: 700,
                              fontSize: '1.25rem',
                              boxShadow: `0 4px 12px ${getAvatarColor(child.fullName)}30`
                            }}
                          >
                            {child.fullName?.charAt(0) || 'S'}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', lineHeight: 1.3 }}>
                              {child.fullName || 'Unknown'}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5 }}>
                              {child.studentNumber || 'N/A'}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 500 }}>Performance</Typography>
                            <Typography variant="caption" sx={{ color: '#6FAF8F', fontWeight: 600 }}>85%</Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={85} 
                            sx={{ 
                              height: 6, 
                              borderRadius: 3,
                              bgcolor: '#E8F5E9',
                              '& .MuiLinearProgress-bar': { 
                                borderRadius: 3,
                                bgcolor: '#6FAF8F'
                              }
                            }} 
                          />
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, mb: 2.5 }}>
                          <Chip 
                            label={child.relationship || 'Parent'}
                            size="small"
                            sx={{ 
                              bgcolor: '#E8F5E9', 
                              color: '#059669',
                              fontWeight: 600,
                              fontSize: '0.7rem'
                            }}
                          />
                        </Box>

                        <Button
                          fullWidth
                          variant="contained"
                          className="view-btn"
                          startIcon={<TrendingUp />}
                          onClick={() => navigate(`/parent-dashboard/results/${child.studentProfileId}`)}
                          sx={{
                            bgcolor: '#6FAF8F',
                            borderRadius: 2,
                            py: 1.25,
                            fontWeight: 600,
                            transition: 'all 0.2s',
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
          </Grid>

          {/* Recent Activity */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', mb: 3 }}>
              Recent Activity
            </Typography>
            
            <Card sx={{ 
              borderRadius: 3, 
              border: '1px solid #E5E7EB',
              bgcolor: '#fff',
            }}>
              <CardContent sx={{ p: 0 }}>
                {activities.map((activity, i) => (
                  <Box key={i}>
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 2, 
                      p: 2.5,
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: '#F9FAFB' }
                    }}>
                      <Box sx={{ 
                        p: 1, 
                        borderRadius: 1.5, 
                        bgcolor: `${activity.color}15`,
                        height: 'fit-content'
                      }}>
                        {React.cloneElement(activity.icon, { sx: { color: activity.color, fontSize: 20 } })}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827', mb: 0.5 }}>
                          {activity.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6B7280' }}>
                          {activity.desc}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                          <AccessTime sx={{ fontSize: 12, color: '#9CA3AF' }} />
                          <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                            {activity.time}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    {i < activities.length - 1 && <Divider />}
                  </Box>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', mb: 3, mt: 4 }}>
              Quick Actions
            </Typography>
            
            <Grid container spacing={2}>
              {[
                { icon: <People />, label: 'All Children', color: '#6FAF8F' },
                { icon: <Assignment />, label: 'Results', color: '#3B82F6' },
                { icon: <Message />, label: 'Messages', color: '#8B5CF6' },
                { icon: <Notifications />, label: 'Alerts', color: '#F59E0B' },
              ].map((action, i) => (
                <Grid size={{ xs: 6 }} key={i}>
                  <Card 
                    onClick={() => navigate(action.path || '/parent-dashboard')}
                    sx={{ 
                      borderRadius: 2.5, 
                      border: '1px solid #E5E7EB',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: action.color,
                        bgcolor: `${action.color}05`,
                        transform: 'scale(1.02)',
                      }
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 2.5, px: 2 }}>
                      <Box sx={{ 
                        p: 1.5, 
                        borderRadius: 2, 
                        bgcolor: `${action.color}15`,
                        display: 'inline-flex',
                        mb: 1.5
                      }}>
                        {React.cloneElement(action.icon, { sx: { color: action.color, fontSize: 24 } })}
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151' }}>
                        {action.label}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ParentDashboard;
