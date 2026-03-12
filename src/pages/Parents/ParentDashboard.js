import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Avatar,
  IconButton,
} from '@mui/material';
import {
  Person,
  School,
  EmojiEvents,
  Visibility,
  Email,
  Phone,
  CalendarToday,
  TrendingUp,
} from '@mui/icons-material';
import { parentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, StatusBadge } from '../../components/ui';

const ParentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchChildrenData = async () => {
      try {
        setLoading(true);
        const response = await parentAPI.children.getAll();
        if (response.data?.success) {
          setChildren(response.data.data);
          if (response.data.data.length > 0) {
            setSelectedChild(response.data.data[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching children:', err);
        setChildren([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChildrenData();
  }, []);

  if (loading) {
    return (
      <Box>
        <PageHeader title="Parent Dashboard" subtitle="Welcome to your parent portal" />
        <Card sx={{ borderRadius: 3, p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title={`Welcome, ${user?.name || 'Parent'}`}
        subtitle="Monitor your children's academic progress"
      />

      {children.length === 0 ? (
        <Card sx={{ borderRadius: 3, p: 6, textAlign: 'center' }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #6FAF8F15 0%, #6FAF8F08 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <Person sx={{ fontSize: 40, color: '#6FAF8F' }} />
          </Box>
          <Typography variant="h6" sx={{ color: '#1E293B', fontWeight: 600, mb: 1 }}>
            No Children Linked
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
            You don't have any children linked to your account yet.
          </Typography>
        </Card>
      ) : (
        <>
          {/* Children Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {children.map((child) => (
              <Grid item xs={12} sm={6} md={4} key={child.id}>
                <Card
                  onClick={() => setSelectedChild(child)}
                  sx={{
                    borderRadius: 3,
                    border: selectedChild?.id === child.id ? '2px solid #6FAF8F' : '1px solid rgba(111, 175, 143, 0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 24px rgba(111, 175, 143, 0.15)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar
                        sx={{
                          width: 56,
                          height: 56,
                          bgcolor: '#6FAF8F',
                          fontWeight: 700,
                          fontSize: '1.2rem',
                        }}
                      >
                        {child.firstName?.charAt(0) || 'S'}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E293B' }}>
                          {child.firstName} {child.lastName}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748B' }}>
                          {child.className || child.class?.name || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip
                        icon={<School sx={{ fontSize: 16 }} />}
                        label={child.studentNumber || child.studentId || 'N/A'}
                        size="small"
                        sx={{ bgcolor: '#F1F5F9', color: '#475569' }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Selected Child Details */}
          {selectedChild && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card sx={{ borderRadius: 3, border: '1px solid rgba(111, 175, 143, 0.1)' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E293B', mb: 3 }}>
                      Student Information
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Person sx={{ color: '#6FAF8F', fontSize: 20 }} />
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#64748B' }}>Full Name</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500, color: '#1E293B' }}>
                            {selectedChild.firstName} {selectedChild.lastName}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <School sx={{ color: '#6FAF8F', fontSize: 20 }} />
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#64748B' }}>Class</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500, color: '#1E293B' }}>
                            {selectedChild.className || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <CalendarToday sx={{ color: '#6FAF8F', fontSize: 20 }} />
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#64748B' }}>Student ID</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500, color: '#1E293B' }}>
                            {selectedChild.studentNumber || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={8}>
                <Card sx={{ borderRadius: 3, border: '1px solid rgba(111, 175, 143, 0.1)' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E293B' }}>
                        Academic Performance
                      </Typography>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => navigate(`/parent-dashboard/children/${selectedChild.id}/results`)}
                        sx={{ borderRadius: 2 }}
                      >
                        View Results
                      </Button>
                    </Box>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: '#F1F5F9' }}>
                          <EmojiEvents sx={{ fontSize: 32, color: '#F59E0B', mb: 1 }} />
                          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1E293B' }}>A</Typography>
                          <Typography variant="caption" sx={{ color: '#64748B' }}>Average Grade</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: '#F1F5F9' }}>
                          <TrendingUp sx={{ fontSize: 32, color: '#10B981', mb: 1 }} />
                          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1E293B' }}>92%</Typography>
                          <Typography variant="caption" sx={{ color: '#64748B' }}>Attendance</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: '#F1F5F9' }}>
                          <School sx={{ fontSize: 32, color: '#6FAF8F', mb: 1 }} />
                          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1E293B' }}>5th</Typography>
                          <Typography variant="caption" sx={{ color: '#64748B' }}>Class Rank</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </>
      )}
    </Box>
  );
};

export default ParentDashboard;
