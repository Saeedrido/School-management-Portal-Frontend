import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import {
  Container,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  CircularProgress,
  Grid,
  Card,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  Book,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../services/api';

// School Level mapping
const SCHOOL_LEVELS = {
  0: 'Primary',
  1: 'Junior Secondary',
  2: 'Senior Secondary',
};

const SCHOOL_LEVEL_COLORS = {
  0: '#4CAF50',    // Primary - Green
  1: '#2196F3',    // Junior Secondary - Blue
  2: '#FF9800',    // Senior Secondary - Orange
};

const SubjectList = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const response = await adminAPI.subjects.getAll();
        if (response.data?.success && response.data?.data) {
          setSubjects(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching subjects:', err);
        setError('Failed to load subjects');
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  // Filter subjects based on search query
  const filteredSubjects = subjects.filter((subject) =>
    subject.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (subjectId) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) {
      return;
    }

    try {
      await adminAPI.subjects.delete(subjectId);
      setSubjects(subjects.filter((s) => s.id !== subjectId));
    } catch (err) {
      console.error('Error deleting subject:', err);
      setError('Failed to delete subject');
    }
  };

  const getRowStyle = (index) => ({
    background: index % 2 === 0
      ? (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)')
      : 'transparent',
    borderBottom: '1px solid',
    borderColor: 'divider',
    '&:hover': {
      background: 'primary.main',
      opacity: 0.05,
    },
  });

  const getSubjectColor = (name) => {
    const colors = ['#2196F3', '#66BB6A', '#EF5350', '#FFA726', '#AB47BC', '#26C6DA', '#E91E63', '#9C27B0'];
    const index = name?.charCodeAt(0) % colors.length || 0;
    return colors[index];
  };

  // Count subjects by school level
  const primaryCount = subjects.filter(s => s.schoolLevel === 0).length;
  const juniorCount = subjects.filter(s => s.schoolLevel === 1).length;
  const seniorCount = subjects.filter(s => s.schoolLevel === 2).length;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Box
        sx={{
          mb: { xs: 2, sm: 3, md: 4 },
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.success.main} 100%)`,
          borderRadius: { xs: 2, sm: 3, md: 4 },
          p: { xs: 2, sm: 3, md: 4 },
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: { xs: -30, sm: -50 },
            right: { xs: -30, sm: -50 },
            width: { xs: 150, sm: 200 },
            height: { xs: 150, sm: 200 },
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, position: 'relative', zIndex: 1, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 2, sm: 0 } }}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' } }}>
              📚 Subjects Management
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              View and manage all subjects (Seeded from backend)
            </Typography>
          </Box>
          {user?.role === 'Admin' && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/dashboard/subjects/new')}
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                px: { xs: 2, sm: 3 },
                py: { xs: 1, sm: 1.5 },
                fontWeight: 600,
                fontSize: { xs: '0.875rem', sm: '1rem' },
              }}
            >
              {window.innerWidth < 600 ? 'Add' : 'Add Subject'}
            </Button>
          )}
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: { xs: 2, sm: 3, md: 4 },
              background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
              color: 'white',
            }}
          >
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 1, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
              Primary School
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
              {primaryCount}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: { xs: 2, sm: 3, md: 4 },
              background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
              color: 'white',
            }}
          >
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 1, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
              Junior Secondary
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
              {juniorCount}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: { xs: 2, sm: 3, md: 4 },
              background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
              color: 'white',
            }}
          >
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 1, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
              Senior Secondary
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
              {seniorCount}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: { xs: 2, sm: 3, md: 4 },
              background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
              color: 'white',
            }}
          >
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 1, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
              Total Subjects
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
              {subjects.length}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Search Bar */}
      <Paper
        sx={{
          mb: { xs: 2, sm: 3 },
          p: { xs: 1.5, sm: 2 },
          borderRadius: { xs: 2, sm: 3 },
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <TextField
          fullWidth
          placeholder="Search subjects by name or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: 'primary.main' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: { xs: 1.5, sm: 2 },
              '&:hover fieldset': { borderColor: 'primary.main' },
              '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: 2 },
            },
          }}
        />
      </Paper>

      {/* Subjects Table */}
      <Box sx={{ overflowX: 'auto' }}>
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: { xs: 2, sm: 3, md: 4 },
            boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.08)',
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.success.main} 100%)` }}>
                <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.85rem' } }}>
                  Subject
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.85rem' } }}>
                  Code
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.85rem' } }}>
                  School Level
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.85rem' } }}>
                  Order
                </TableCell>
                {user?.role === 'Admin' && (
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.85rem' } }}>
                    Actions
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSubjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={user?.role === 'Admin' ? 5 : 4} align="center" sx={{ py: { xs: 6, sm: 8 } }}>
                    <Book sx={{ fontSize: { xs: 48, sm: 64 }, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                      No subjects found
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                      {searchTerm ? 'Try a different search term' : 'Subjects are seeded from the backend'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubjects.map((subject, index) => (
                  <TableRow
                    key={subject.id}
                    hover
                    sx={getRowStyle(index)}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
                        <Avatar
                          sx={{
                            bgcolor: getSubjectColor(subject.name),
                            fontWeight: 600,
                            width: { xs: 32, sm: 40 },
                            height: { xs: 32, sm: 40 },
                          }}
                        >
                          {subject.name?.charAt(0).toUpperCase() || 'S'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                            {subject.name}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={subject.code || 'N/A'}
                        size="small"
                        sx={{
                          bgcolor: 'primary.main',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          opacity: 0.15,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={SCHOOL_LEVELS[subject.schoolLevel] || 'Unknown'}
                        size="small"
                        sx={{
                          bgcolor: SCHOOL_LEVEL_COLORS[subject.schoolLevel] || '#757575',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          opacity: 0.8,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                        {subject.subjectOrder || 'N/A'}
                      </Typography>
                    </TableCell>
                    {user?.role === 'Admin' && (
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/dashboard/subjects/${subject.id}/edit`)}
                          sx={{
                            bgcolor: 'primary.main',
                            color: 'white',
                            mr: 1,
                            opacity: 0.15,
                            '&:hover': { bgcolor: 'primary.main', opacity: 1 },
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(subject.id)}
                          sx={{
                            bgcolor: 'error.main',
                            color: 'white',
                            opacity: 0.15,
                            '&:hover': { bgcolor: 'error.main', opacity: 1 },
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default SubjectList;
