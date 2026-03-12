import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  DateRange,
  CalendarToday,
} from '@mui/icons-material';
import { termsAPI, academicYearsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, StatusBadge } from '../../components/ui';

const TermList = () => {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [terms, setTerms] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const basePath = '/admin-dashboard';

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
      fetchTerms(selectedYear);
    } catch (err) {
      setError('Failed to set active term');
      console.error(err);
    }
  };

  const getTermStatus = (term) => {
    if (term.isActive) return { label: 'Active', bg: '#DCFCE7', color: '#166534' };
    return { label: 'Inactive', bg: '#F1F5F9', color: '#475569' };
  };

  if (loading) {
    return (
      <Box>
        <PageHeader title="Terms" subtitle="Manage academic terms" />
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
        title="Terms"
        subtitle="Manage academic terms and semesters"
        actionText={hasRole('Admin') ? 'Add Term' : undefined}
        onAction={hasRole('Admin') ? () => navigate(`${basePath}/terms/new`) : undefined}
      />

      <Card sx={{ borderRadius: 3, border: '1px solid rgba(111, 175, 143, 0.1)', mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <FormControl fullWidth sx={{ maxWidth: 300 }}>
            <InputLabel>Academic Year</InputLabel>
            <Select
              value={selectedYear}
              label="Academic Year"
              onChange={(e) => setSelectedYear(e.target.value)}
              sx={{ borderRadius: 2.5 }}
            >
              {academicYears.map((year) => (
                <MenuItem key={year.id} value={year.id}>
                  {year.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, border: '1px solid rgba(111, 175, 143, 0.1)', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F8FAF9' }}>
                <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>Term</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>Start Date</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>End Date</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>Status</TableCell>
                {hasRole('Admin') && (
                  <TableCell align="right" sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>Actions</TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {terms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={hasRole('Admin') ? 5 : 4} align="center" sx={{ py: 8 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <CalendarToday sx={{ fontSize: 48, color: '#94A3B8', mb: 2 }} />
                      <Typography variant="body1" sx={{ color: '#64748B', fontWeight: 500 }}>
                        No terms found
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                terms.map((term) => {
                  const status = getTermStatus(term);
                  return (
                    <TableRow
                      key={term.id}
                      sx={{
                        borderBottom: '1px solid rgba(111, 175, 143, 0.08)',
                        '&:hover': { backgroundColor: 'rgba(111, 175, 143, 0.03)' },
                        transition: 'background-color 0.2s ease',
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#6FAF8F15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <DateRange sx={{ color: '#6FAF8F', fontSize: 20 }} />
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 500, color: '#1E293B' }}>
                            {term.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: '#64748B' }}>
                        {term.startDate ? new Date(term.startDate).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell sx={{ color: '#64748B' }}>
                        {term.endDate ? new Date(term.endDate).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={status.label}
                          size="small"
                          sx={{
                            bgcolor: status.bg,
                            color: status.color,
                            fontWeight: 500,
                            fontSize: '0.7rem',
                          }}
                        />
                      </TableCell>
                      {hasRole('Admin') && (
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                            {!term.isActive && (
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleSetActive(term.id)}
                                sx={{
                                  borderColor: '#6FAF8F',
                                  color: '#6FAF8F',
                                  fontSize: '0.75rem',
                                  borderRadius: 2,
                                }}
                              >
                                Set Active
                              </Button>
                            )}
                            <IconButton
                              size="small"
                              onClick={() => navigate(`${basePath}/terms/${term.id}/edit`)}
                              sx={{ color: '#6FAF8F', '&:hover': { bgcolor: 'rgba(111, 175, 143, 0.1)' } }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(term.id)}
                              sx={{ color: '#EF4444', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default TermList;
