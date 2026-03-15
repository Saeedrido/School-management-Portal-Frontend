import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  Grid,
  CircularProgress,
} from '@mui/material';
import {
  Person,
  School,
  Visibility,
  CalendarToday,
} from '@mui/icons-material';
import { parentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, StatusBadge } from '../../components/ui';

const MyChildren = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      setError('Failed to load children');
    } finally {
      setLoading(false);
    }
  };

  const getAvatarColor = (name) => {
    const colors = ['#6FAF8F', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4'];
    const index = name?.charCodeAt(0) % colors.length || 0;
    return colors[index];
  };

  if (loading) {
    return (
      <Box>
        <PageHeader title="My Children" subtitle="View your children's information" />
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
        title="My Children"
        subtitle="View and manage your children's academic information"
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
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            You don't have any children linked to your account yet.
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {children.map((child) => (
            <Grid item xs={12} key={child.id}>
              <Card sx={{ borderRadius: 3, border: '1px solid rgba(111, 175, 143, 0.1)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Avatar
                        sx={{
                          width: 64,
                          height: 64,
                          bgcolor: getAvatarColor(child.firstName),
                          fontWeight: 700,
                          fontSize: '1.5rem',
                        }}
                      >
                        {child.firstName?.charAt(0) || 'S'}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E293B' }}>
                          {child.firstName} {child.lastName}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
                          <Chip
                            icon={<School sx={{ fontSize: 16 }} />}
                            label={child.className || child.class?.name || 'N/A'}
                            size="small"
                            sx={{ bgcolor: '#F1F5F9', color: '#475569' }}
                          />
                          <Chip
                            icon={<CalendarToday sx={{ fontSize: 16 }} />}
                            label={child.studentNumber || child.studentId || 'N/A'}
                            size="small"
                            sx={{ bgcolor: '#F1F5F9', color: '#475569' }}
                          />
                        </Box>
                      </Box>
                    </Box>
                    <Button
                      variant="contained"
                      startIcon={<Visibility />}
                      onClick={() => navigate(`/parent-dashboard/results/${child.id}`)}
                      sx={{
                        background: 'linear-gradient(135deg, #6FAF8F 0%, #4E8C70 100%)',
                        borderRadius: 2.5,
                      }}
                    >
                      View Results
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default MyChildren;
