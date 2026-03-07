import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
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
  IconButton,
  Chip,
  Switch,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  CalendarToday,
} from '@mui/icons-material';
import { academicYearsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const AcademicYearList = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchAcademicYears = async () => {
    try {
      setLoading(true);
      const response = await academicYearsAPI.getAll();
      setAcademicYears(response.data.data || []);
    } catch (err) {
      setError('Failed to fetch academic years');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this academic year?')) {
      return;
    }

    try {
      await academicYearsAPI.delete(id);
      setAcademicYears(academicYears.filter((y) => y.id !== id));
    } catch (err) {
      setError('Failed to delete academic year');
      console.error(err);
    }
  };

  const handleSetActive = async (id) => {
    try {
      await academicYearsAPI.setActive(id);
      setAcademicYears(
        academicYears.map((y) => ({
          ...y,
          isActive: y.id === id,
        }))
      );
    } catch (err) {
      setError('Failed to set active academic year');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        Loading...
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: { xs: 2, sm: 3 },
          background: theme.palette.mode === 'dark'
            ? 'rgba(30, 30, 30, 0.8)'
            : 'linear-gradient(135deg, #E3F2FD 0%, #F1F8E9 100%)',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            mb: { xs: 2, sm: 3, md: 4 },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 2, sm: 0 },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CalendarToday sx={{ fontSize: { xs: 28, sm: 32 }, color: 'primary.main' }} />
            <Typography variant="h4" sx={{ color: 'text.primary', fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
              Academic Years
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/admin-dashboard/academic-years/new')}
            disabled={!hasRole('Admin')}
            sx={{
              bgcolor: 'primary.main',
              '&:hover': { bgcolor: 'primary.dark' },
              borderRadius: { xs: 1.5, sm: 2 },
              fontSize: { xs: '0.875rem', sm: '1rem' },
              px: { xs: 2, sm: 2.5 },
            }}
          >
            {window.innerWidth < 600 ? 'Add' : 'Add Academic Year'}
          </Button>
        </Box>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Box sx={{ overflowX: 'auto' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: 'text.primary', fontSize: { xs: '0.875rem', sm: '1rem' } }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.primary', fontSize: { xs: '0.875rem', sm: '1rem' } }}>Start Date</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.primary', fontSize: { xs: '0.875rem', sm: '1rem' } }}>End Date</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.primary', fontSize: { xs: '0.875rem', sm: '1rem' } }}>Active</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: 'text.primary', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {academicYears.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body1" sx={{ color: 'text.secondary', py: 2 }}>
                        No academic years found. Add your first academic year to get started.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  academicYears.map((year) => (
                    <TableRow key={year.id} hover>
                      <TableCell>
                        <Typography sx={{ fontWeight: 600, color: 'text.primary', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                          {year.name}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        {new Date(year.startDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        {new Date(year.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {year.isActive && (
                            <Chip
                              label="Active"
                              size="small"
                              color="success"
                            />
                          )}
                          <Switch
                            checked={year.isActive}
                            onChange={() => handleSetActive(year.id)}
                            disabled={!hasRole('Admin') || year.isActive}
                          />
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="primary"
                          onClick={() => navigate(`/admin-dashboard/academic-years/${year.id}/edit`)}
                          disabled={!hasRole('Admin')}
                          size="small"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(year.id)}
                          disabled={!hasRole('Admin')}
                          size="small"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>
    </Container>
  );
};

export default AcademicYearList;
