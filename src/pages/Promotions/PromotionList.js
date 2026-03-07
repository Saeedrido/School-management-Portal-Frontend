import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import {
  School,
  CheckCircle,
  Cancel,
  TrendingUp,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const PromotionsList = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [searchParams] = useSearchParams();
  const academicYearId = searchParams.get('academicYearId') || '';

  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (academicYearId) {
      fetchPromotions();
    }
  }, [academicYearId]);

  const fetchPromotions = async () => {
    // This would call the promotions API
    // For now, showing mock data
    setLoading(false);
    setPromotions([
      {
        id: 1,
        studentName: 'John Doe',
        currentClass: 'JSS 1',
        averageScore: 85.5,
        recommendation: 'Promoted',
        status: 'Pending',
      },
      {
        id: 2,
        studentName: 'Jane Smith',
        currentClass: 'JSS 1',
        averageScore: 62.3,
        recommendation: 'Retain',
        status: 'Pending',
      },
      {
        id: 3,
        studentName: 'Bob Johnson',
        currentClass: 'JSS 2',
        averageScore: 78.9,
        recommendation: 'Promoted',
        status: 'Approved',
      },
    ]);
  };

  if (!hasRole('Admin')) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">You don't have permission to access this page.</Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: 3,
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(102, 187, 106, 0.1) 100%)'
            : 'linear-gradient(135deg, #E3F2FD 0%, #F1F8E9 100%)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: { xs: 3, md: 4 },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 2, sm: 0 },
            textAlign: { xs: 'center', sm: 'left' },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TrendingUp sx={{ fontSize: { xs: 28, sm: 32 }, color: 'success.main' }} />
            <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700, fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}>
              Student Promotions
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={() => navigate('/dashboard/promotions/criteria')}
            sx={{
              bgcolor: '#66BB6A',
              '&:hover': { bgcolor: '#81C784' },
              borderRadius: 2,
            }}
          >
            Promotion Criteria
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {promotions.map((promotion) => (
            <Grid item xs={12} md={6} lg={4} key={promotion.id}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ color: '#1976D2', fontWeight: 600, mb: 1 }}>
                      {promotion.studentName}
                    </Typography>
                    <Chip
                      label={promotion.currentClass}
                      size="small"
                      sx={{ bgcolor: '#E3F2FD', color: '#1976D2' }}
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: '#78909C' }}>
                        Average Score:
                      </Typography>
                      <Typography variant="h6" sx={{ color: promotion.averageScore >= 70 ? '#66BB6A' : '#EF5350', fontWeight: 700 }}>
                        {promotion.averageScore}%
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <School sx={{ fontSize: 16, color: '#78909C' }} />
                      <Typography variant="body2" sx={{ color: '#78909C' }}>
                        {promotion.recommendation}
                      </Typography>
                    </Box>
                    <Chip
                      label={promotion.status}
                      size="small"
                      color={
                        promotion.status === 'Approved'
                          ? 'success'
                          : promotion.status === 'Pending'
                          ? 'warning'
                          : 'default'
                      }
                      sx={{
                        bgcolor:
                          promotion.status === 'Approved'
                            ? '#66BB6A'
                            : promotion.status === 'Pending'
                            ? '#FFC107'
                            : '#9E9E9E',
                        color: 'white',
                      }}
                    />
                  </Box>

                  {promotion.status === 'Pending' && (
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircle />}
                        onClick={() => console.log('Approve', promotion.id)}
                        sx={{ borderRadius: 1 }}
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<Cancel />}
                        onClick={() => console.log('Reject', promotion.id)}
                        sx={{ borderRadius: 1 }}
                      >
                        Reject
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Container>
  );
};

export default PromotionsList;
