import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { ArrowBack, DateRange } from '@mui/icons-material';
import { termsAPI, academicYearsAPI } from '../../services/api';

const TermForm = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    academicYearId: '',
    termType: '',
  });
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);
  const [error, setError] = useState('');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchAcademicYears();
    if (isEdit) {
      fetchTerm();
    }
  }, [id]);

  const fetchTerm = async () => {
    try {
      setFetchLoading(true);
      const response = await termsAPI.getById(id);
      const term = response.data.data;
      setFormData({
        name: term.name || '',
        startDate: term.startDate ? term.startDate.split('T')[0] : '',
        endDate: term.endDate ? term.endDate.split('T')[0] : '',
        academicYearId: term.academicYearId || '',
        termType: term.termType || '',
      });
    } catch (err) {
      setError('Failed to fetch term');
      console.error(err);
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchAcademicYears = async () => {
    try {
      const response = await academicYearsAPI.getAll();
      setAcademicYears(response.data.data || []);
      if (!isEdit && response.data.data?.length > 0) {
        const activeYear = response.data.data.find((y) => y.isActive);
        if (activeYear) {
          setFormData((prev) => ({ ...prev, academicYearId: activeYear.id }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch academic years:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.startDate || !formData.endDate || !formData.academicYearId || !formData.termType) {
      setError('All fields are required');
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setError('End date must be after start date');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Include termType in the payload
      const payload = {
        ...formData,
        termType: parseInt(formData.termType, 10),
      };
      
      if (isEdit) {
        await termsAPI.update(id, payload);
      } else {
        await termsAPI.create(payload);
      }
      navigate('/dashboard/terms');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save term');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
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
            alignItems: 'center',
            mb: { xs: 3, md: 4 },
            gap: 2,
            flexDirection: { xs: 'column', sm: 'row' },
            textAlign: { xs: 'center', sm: 'left' },
          }}
        >
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/dashboard/terms')}
            sx={{ borderRadius: 2 }}
          >
            {window.innerWidth < 600 ? 'Back' : 'Back to Terms'}
          </Button>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DateRange sx={{ fontSize: { xs: 24, md: 28 }, color: 'primary.main' }} />
            <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 700 }}>
              {isEdit ? 'Edit Term' : 'Add New Term'}
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Term Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
                required
                placeholder="e.g., First Term, Second Term"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Start Date"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                disabled={loading}
                required
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="End Date"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                disabled={loading}
                required
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Academic Year"
                name="academicYearId"
                value={formData.academicYearId}
                onChange={handleChange}
                disabled={loading}
                required
                SelectProps={{ native: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              >
                <option value="">Select Academic Year</option>
                {academicYears.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.name} ({year.startDate?.split('T')[0]} - {year.endDate?.split('T')[0]})
                  </option>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Term Type"
                name="termType"
                value={formData.termType}
                onChange={handleChange}
                disabled={loading}
                required
                SelectProps={{ native: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              >
                <option value="">Select Term Type</option>
                <option value={1}>First Term</option>
                <option value={2}>Second Term</option>
                <option value={3}>Third Term</option>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  justifyContent: 'flex-end',
                  mt: 2,
                }}
              >
                <Button
                  variant="outlined"
                  onClick={() => navigate('/dashboard/terms')}
                  disabled={loading}
                  sx={{ borderRadius: 2 }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                  sx={{
                    bgcolor: 'success.main',
                    '&:hover': { bgcolor: 'success.dark' },
                    borderRadius: 2,
                    minWidth: { xs: 100, sm: 120 },
                  }}
                >
                  {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default TermForm;
