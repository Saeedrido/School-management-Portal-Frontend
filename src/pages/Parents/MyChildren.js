import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  Grid,
  CircularProgress,
  Divider,
  InputBase,
  LinearProgress,
  IconButton,
} from '@mui/material';
import {
  Person,
  School,
  Visibility,
  CalendarToday,
  ArrowBack,
  EmojiEvents,
  MenuBook,
  Search,
  FilterList,
  TrendingUp,
  CheckCircle,
  AccessTime,
  MoreVert,
} from '@mui/icons-material';
import { parentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const MyChildren = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    setLoading(true);
    try {
      const response = await parentAPI.children.getAll();
      if (response.data && response.data.success) {
        setChildren(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching children:', err);
    } finally {
      setLoading(false);
    }
  };

  const getAvatarColor = (name) => {
    const colors = ['#6FAF8F', '#4E8C70', '#8BC34A', '#009688', '#FF9800', '#9C27B0', '#3B82F6'];
    const index = name?.charCodeAt(0) % colors.length || 0;
    return colors[index];
  };

  const getStudentId = (child) => {
    return child.studentProfileId || child.id || child.studentId || child.student_profile_id;
  };

  const filteredChildren = children.filter(child => {
    const matchesSearch = child.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         child.firstName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const stats = {
    total: children.length,
    averagePerformance: 85,
    totalAwards: 3,
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        bgcolor: '#FAFBFC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ color: '#6FAF8F', mb: 2 }} />
          <Typography variant="body2" sx={{ color: '#64748B' }}>Loading children...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#FAFBFC',
    }}>
      {/* Top Navigation */}
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
          <Button 
            startIcon={<ArrowBack />} 
            onClick={() => navigate('/parent-dashboard')}
            sx={{ 
              color: '#6B7280', 
              fontWeight: 500,
              '&:hover': { bgcolor: '#F3F4F6' }
            }}
          >
            Back
          </Button>
          <Divider orientation="vertical" flexItem />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ 
              width: 36, 
              height: 36, 
              borderRadius: 1.5,
              bgcolor: '#6FAF8F',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <School sx={{ color: '#fff', fontSize: 20 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1F2937' }}>
              300 Arundel Learning
            </Typography>
          </Box>
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
            <InputBase 
              placeholder="Search children..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ fontSize: '0.875rem', minWidth: 150 }}
            />
          </Box>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 1.5, sm: 3 }, py: 3 }}>
        
        {/* Header Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, color: '#111827', mb: 0.75, fontSize: { xs: '1.5rem', sm: '1.75rem' } }}>
            My Children
          </Typography>
          <Typography variant="body1" sx={{ color: '#6B7280', fontSize: '0.9rem' }}>
            Monitor academic performance, attendance, and progress
          </Typography>
        </Box>

        {/* Stats Overview */}
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ 
              borderRadius: 2.5, 
              border: '1px solid #E5E7EB',
              background: 'linear-gradient(135deg, #6FAF8F 0%, #4E8C70 100%)',
              color: '#fff',
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h2" sx={{ fontWeight: 800, fontSize: '2.5rem', lineHeight: 1 }}>
                      {stats.total}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                      Total Children
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    bgcolor: 'rgba(255,255,255,0.2)',
                  }}>
                    <Person sx={{ fontSize: 36 }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ 
              borderRadius: 3, 
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: 2, 
                    bgcolor: '#E8F5E9',
                  }}>
                    <TrendingUp sx={{ color: '#6FAF8F', fontSize: 24 }} />
                  </Box>
                  <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500 }}>
                    Avg. Performance
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827' }}>
                  {stats.averagePerformance}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={stats.averagePerformance} 
                  sx={{ 
                    height: 6, 
                    borderRadius: 3,
                    mt: 1.5,
                    bgcolor: '#E8F5E9',
                    '& .MuiLinearProgress-bar': { 
                      borderRadius: 3,
                      bgcolor: '#6FAF8F'
                    }
                  }} 
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ 
              borderRadius: 3, 
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: 2, 
                    bgcolor: '#FFF3E0',
                  }}>
                    <EmojiEvents sx={{ color: '#F59E0B', fontSize: 24 }} />
                  </Box>
                  <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500 }}>
                    Total Awards
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827' }}>
                  {stats.totalAwards}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Children List */}
        {children.length === 0 ? (
          <Card sx={{ 
            borderRadius: 3, 
            border: '1px solid #E5E7EB',
            p: 8,
            textAlign: 'center',
            bgcolor: '#fff',
          }}>
            <Avatar sx={{ 
              width: 100, 
              height: 100, 
              bgcolor: '#E8F5E9',
              mx: 'auto',
              mb: 3
            }}>
              <Person sx={{ fontSize: 50, color: '#6FAF8F' }} />
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#374151', mb: 2 }}>
              No Children Found
            </Typography>
            <Typography variant="body1" sx={{ color: '#9CA3AF', maxWidth: 400, mx: 'auto', mb: 4 }}>
              You don't have any children linked to your account. Contact the school to link your children.
            </Typography>
            <Button 
              variant="contained"
              startIcon={<School />}
              onClick={() => navigate('/parent-dashboard')}
              sx={{ 
                bgcolor: '#6FAF8F',
                borderRadius: 2,
                px: 4,
                py: 1.5,
                '&:hover': { bgcolor: '#5a9a7a' }
              }}
            >
              Go to Dashboard
            </Button>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {filteredChildren.map((child, index) => (
              <Grid size={{ xs: 12, md: 6 }} key={getStudentId(child) || index}>
                <Card sx={{ 
                  borderRadius: 3, 
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02)',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 20px 40px rgba(111, 175, 143, 0.15)',
                    borderColor: '#6FAF8F',
                  }
                }}>
                  {/* Colored Header */}
                  <Box sx={{ 
                    height: 6, 
                    background: `linear-gradient(90deg, ${getAvatarColor(child.firstName)} 0%, ${getAvatarColor(child.firstName)}cc 100%)` 
                  }} />
                  
                  <CardContent sx={{ p: 3.5 }}>
                    {/* Profile Section */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5, mb: 3 }}>
                      <Avatar
                        sx={{
                          width: 72,
                          height: 72,
                          bgcolor: getAvatarColor(child.firstName),
                          fontWeight: 700,
                          fontSize: '1.75rem',
                          boxShadow: `0 8px 24px ${getAvatarColor(child.firstName)}30`
                        }}
                      >
                        {child.firstName?.charAt(0) || 'S'}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', lineHeight: 1.3 }}>
                          {child.firstName} {child.lastName}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                          <Chip 
                            icon={<School sx={{ fontSize: '14px !important' }} />}
                            label={child.className || child.class?.name || 'N/A'}
                            size="small"
                            sx={{ 
                              bgcolor: '#E8F5E9', 
                              color: '#059669',
                              fontWeight: 600,
                              fontSize: '0.75rem'
                            }}
                          />
                        </Box>
                      </Box>
                      <IconButton size="small" sx={{ color: '#9CA3AF' }}>
                        <MoreVert />
                      </IconButton>
                    </Box>

                    {/* Stats Grid */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid size={{ xs: 4 }}>
                        <Box sx={{ 
                          p: 2, 
                          borderRadius: 2, 
                          bgcolor: '#F9FAFB',
                          textAlign: 'center'
                        }}>
                          <Typography variant="h5" sx={{ fontWeight: 700, color: '#6FAF8F' }}>92%</Typography>
                          <Typography variant="caption" sx={{ color: '#6B7280', display: 'block' }}>Attendance</Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 4 }}>
                        <Box sx={{ 
                          p: 2, 
                          borderRadius: 2, 
                          bgcolor: '#F9FAFB',
                          textAlign: 'center'
                        }}>
                          <Typography variant="h5" sx={{ fontWeight: 700, color: '#3B82F6' }}>88%</Typography>
                          <Typography variant="caption" sx={{ color: '#6B7280', display: 'block' }}>Performance</Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 4 }}>
                        <Box sx={{ 
                          p: 2, 
                          borderRadius: 2, 
                          bgcolor: '#F9FAFB',
                          textAlign: 'center'
                        }}>
                          <Typography variant="h5" sx={{ fontWeight: 700, color: '#F59E0B' }}>2</Typography>
                          <Typography variant="caption" sx={{ color: '#6B7280', display: 'block' }}>Awards</Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Tags */}
                    <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
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
                      {child.isPrimaryContact && (
                        <Chip 
                          icon={<CheckCircle sx={{ fontSize: '14px !important' }} />}
                          label="Primary Contact"
                          size="small"
                          sx={{ 
                            bgcolor: '#6FAF8F20', 
                            color: '#6FAF8F',
                            fontWeight: 600,
                            fontSize: '0.7rem'
                          }}
                        />
                      )}
                      <Chip 
                        label="Active"
                        size="small"
                        icon={<CheckCircle sx={{ fontSize: '14px !important' }} />}
                        sx={{ 
                          bgcolor: '#ECFDF5', 
                          color: '#10B981',
                          fontWeight: 600,
                          fontSize: '0.7rem'
                        }}
                      />
                    </Box>

                    {/* Action Buttons */}
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<Visibility />}
                          onClick={() => navigate(`/parent-dashboard/children/${getStudentId(child)}`)}
                          sx={{
                            borderColor: '#E5E7EB',
                            color: '#374151',
                            borderRadius: 2,
                            py: 1.25,
                            fontWeight: 600,
                            '&:hover': {
                              borderColor: '#6FAF8F',
                              bgcolor: '#6FAF8F08',
                            }
                          }}
                        >
                          View Profile
                        </Button>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<TrendingUp />}
                          onClick={() => navigate(`/parent-dashboard/results/${getStudentId(child)}`)}
                          sx={{
                            bgcolor: '#6FAF8F',
                            borderRadius: 2,
                            py: 1.25,
                            fontWeight: 600,
                            boxShadow: '0 4px 12px rgba(111, 175, 143, 0.3)',
                            '&:hover': { 
                              bgcolor: '#5a9a7a',
                              boxShadow: '0 6px 16px rgba(111, 175, 143, 0.4)',
                            }
                          }}
                        >
                          View Results
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Bottom spacing */}
        <Box sx={{ height: 60 }} />
      </Box>
    </Box>
  );
};

export default MyChildren;
