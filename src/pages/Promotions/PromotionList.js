import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
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
} from '@mui/material';
import {
  School,
  CheckCircle,
  TrendingUp,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, StatusBadge } from '../../components/ui';

const PromotionsList = () => {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [searchParams] = useSearchParams();
  const academicYearId = searchParams.get('academicYearId') || '';

  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPromotions();
  }, [academicYearId]);

  const fetchPromotions = async () => {
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

  const promotedCount = promotions.filter(p => p.recommendation === 'Promoted').length;
  const retainCount = promotions.filter(p => p.recommendation === 'Retain').length;

  return (
    <Box>
      <PageHeader
        title="Promotions"
        subtitle="Manage student promotions and progression"
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3, border: '1px solid rgba(111, 175, 143, 0.1)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500, mb: 0.5 }}>Total Students</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1E293B' }}>{promotions.length}</Typography>
                </Box>
                <Box sx={{ width: 48, height: 48, borderRadius: 2.5, background: 'linear-gradient(135deg, #6FAF8F15 0%, #6FAF8F08 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6FAF8F' }}>
                  <School sx={{ fontSize: 24 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3, border: '1px solid rgba(111, 175, 143, 0.1)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500, mb: 0.5 }}>Promoted</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#10B981' }}>{promotedCount}</Typography>
                </Box>
                <Box sx={{ width: 48, height: 48, borderRadius: 2.5, background: 'linear-gradient(135deg, #10B98115 0%, #10B98108 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
                  <TrendingUp sx={{ fontSize: 24 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3, border: '1px solid rgba(111, 175, 143, 0.1)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500, mb: 0.5 }}>To Retain</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#F59E0B' }}>{retainCount}</Typography>
                </Box>
                <Box sx={{ width: 48, height: 48, borderRadius: 2.5, background: 'linear-gradient(135deg, #F59E0B15 0%, #F59E0B08 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B' }}>
                  <CheckCircle sx={{ fontSize: 24 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ borderRadius: 3, border: '1px solid rgba(111, 175, 143, 0.1)', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : promotions.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <School sx={{ fontSize: 48, color: '#94A3B8', mb: 2 }} />
            <Typography variant="body1" sx={{ color: '#64748B', fontWeight: 500 }}>
              No promotions data available
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#F8FAF9' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>Student</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>Current Class</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>Average Score</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>Recommendation</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {promotions.map((promotion) => (
                  <TableRow
                    key={promotion.id}
                    sx={{
                      borderBottom: '1px solid rgba(111, 175, 143, 0.08)',
                      '&:hover': { backgroundColor: 'rgba(111, 175, 143, 0.03)' },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 500, color: '#1E293B' }}>{promotion.studentName}</TableCell>
                    <TableCell sx={{ color: '#64748B' }}>{promotion.currentClass}</TableCell>
                    <TableCell sx={{ color: '#64748B' }}>{promotion.averageScore}%</TableCell>
                    <TableCell>
                      <Chip
                        label={promotion.recommendation}
                        size="small"
                        sx={{
                          bgcolor: promotion.recommendation === 'Promoted' ? '#DCFCE7' : '#FEF3C7',
                          color: promotion.recommendation === 'Promoted' ? '#166534' : '#92400E',
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={promotion.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </Box>
  );
};

export default PromotionsList;
