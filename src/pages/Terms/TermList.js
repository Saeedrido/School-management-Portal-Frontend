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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  DateRange,
} from '@mui/icons-material';
import { termsAPI, academicYearsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const TermList = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [terms, setTerms] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  useEffect(() => {
    if (selectedYear) {
      fetchTerms(selectedYear);
    }
  }, [selectedYear]);

  const fetchAcademicYears = async () => {
    try {
      setLoading(true);
      const response = await academicYearsAPI.getAll();
      const years = response.data.data || [];
      setAcademicYears(years);
      if (years.length > 0) {
        setSelectedYear(years[0].id);
        await fetchTerms(years[0].id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error('Failed to fetch academic years:', err);
      setError('Failed to load academic years');
      setLoading(false);
    }
  };

  const fetchTerms = async (yearId) => {
    try {
      const response = await termsAPI.getByAcademicYear(yearId);
      setTerms(response.data.data || []);
    } catch (err) {
      setError('Failed to fetch terms');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this term?')) {
      return;
    }

    try {
      await termsAPI.delete(id);
      setTerms(terms.filter((t) => t.id !== id));
    } catch (err) {
      setError('Failed to delete term');
      console.error(err);
    }
  };

  const handleSetActive = async (id) => {
    try {
      await termsAPI.setActive(id);
      setTerms(
        terms.map((t) => ({
          ...t,
          isActive: t.id === id,
        }))
      );
    } catch (err) {
      setError('Failed to set active term');
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
            <DateRange sx={{ fontSize: { xs: 28, sm: 32 }, color: 'primary.main' }} />
            <Typography variant="h4" sx={{ color: 'text.primary', fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
              Terms
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 }, alignItems: 'center', flexDirection: { xs: 'column', sm: 'row' }, width: { xs: '100%', sm: 'auto' } }}>
            {academicYears.length > 0 && (
              <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 } }}>
                <InputLabel>Academic Year</InputLabel>
                <Select
                  value={selectedYear}
                  label="Academic Year"
                  onChange={(e) => {
                    setSelectedYear(e.target.value);
                    fetchTerms(e.target.value);
                  }}
                >
                  {academicYears.map((year) => (
                    <MenuItem key={year.id} value={year.id}>
                      {year.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/admin-dashboard/terms/new')}
              disabled={!hasRole('Admin')}
              sx={{
                bgcolor: 'primary.main',
                '&:hover': { bgcolor: 'primary.dark' },
                borderRadius: { xs: 1.5, sm: 2 },
                fontSize: { xs: '0.875rem', sm: '1rem' },
                px: { xs: 2, sm: 2.5 },
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              {window.innerWidth < 600 ? 'Add' : 'Add Term'}
            </Button>
          </Box>
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
                {terms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body1" sx={{ color: 'text.secondary', py: 2 }}>
                        No terms found. Select an academic year or add a new term.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  terms.map((term) => (
                    <TableRow key={term.id} hover>
                      <TableCell>
                        <Typography sx={{ fontWeight: 600, color: 'text.primary', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                          {term.name}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        {new Date(term.startDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        {new Date(term.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {term.isActive && (
                            <Chip
                              label="Active"
                              size="small"
                              color="success"
                            />
                          )}
                          <Switch
                            checked={term.isActive}
                            onChange={() => handleSetActive(term.id)}
                            disabled={!hasRole('Admin') || term.isActive}
                          />
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="primary"
                          onClick={() => navigate(`/admin-dashboard/terms/${term.id}/edit`)}
                          disabled={!hasRole('Admin')}
                          size="small"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(term.id)}
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

export default TermList;
