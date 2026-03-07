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
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  Class as ClassIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { adminAPI, teacherAPI } from '../../services/api';

const ClassList = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch classes based on user role
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        // If teacher, fetch their assigned classes
        if (user?.role === 'Teacher') {
          const response = await teacherAPI.myAssignments.getAll(1, 100);
          if (response.data?.success && response.data?.data?.items) {
            // Extract unique classes from assignments
            const assignments = response.data.data.items;
            const uniqueClasses = [];
            const seenClassIds = new Set();

            assignments.forEach(assignment => {
              if (assignment.class && !seenClassIds.has(assignment.classId)) {
                seenClassIds.add(assignment.classId);
                uniqueClasses.push({
                  id: assignment.classId,
                  name: assignment.class.name || 'Class',
                  displayName: assignment.class.displayName,
                  schoolLevel: assignment.class.schoolLevel,
                  classOrder: assignment.class.classOrder,
                  subjects: assignments
                    .filter(a => a.classId === assignment.classId)
                    .map(a => a.subject?.name)
                    .filter(Boolean)
                    .join(', '),
                });
              }
            });
            setClasses(uniqueClasses);
          }
        } else {
          // Admin fetches all classes
          const response = await adminAPI.classes.getAll();
          if (response.data?.success && response.data?.data) {
            setClasses(response.data.data);
          }
        }
      } catch (err) {
        console.error('Error fetching classes:', err);
        setError('Failed to load classes');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role) {
      fetchClasses();
    }
  }, [user?.role]);

  // Filter classes based on search query
  const filteredClasses = classes.filter((classItem) =>
    classItem.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classItem.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const getClassColor = (name) => {
    const colors = ['#2196F3', '#66BB6A', '#EF5350', '#FFA726', '#AB47BC', '#26C6DA', '#E91E63', '#9C27B0'];
    const index = name?.charCodeAt(0) % colors.length || 0;
    return colors[index];
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="error">{error}</Typography>
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
              {user?.role === 'Teacher' ? '📚 My Classes' : '📚 Classes Management'}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              {user?.role === 'Teacher'
                ? 'View your assigned classes and students'
                : 'Manage all classes and sections'}
            </Typography>
          </Box>
          {user?.role !== 'Teacher' && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/dashboard/classes/new')}
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                px: { xs: 2, sm: 3 },
                py: { xs: 1, sm: 1.5 },
                fontWeight: 600,
                fontSize: { xs: '0.875rem', sm: '1rem' },
              }}
            >
              {window.innerWidth < 600 ? 'Add' : 'Add Class'}
            </Button>
          )}
        </Box>
      </Box>

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
          placeholder="Search classes by name..."
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

      {/* Classes Table */}
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
                  Class
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.85rem' } }}>
                  {user?.role === 'Teacher' ? 'Subjects' : 'Section'}
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.85rem' } }}>
                  Level
                </TableCell>
                {user?.role !== 'Teacher' && (
                  <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.85rem' } }}>
                    Status
                  </TableCell>
                )}
                <TableCell align="right" sx={{ color: 'white', fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.85rem' } }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredClasses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={user?.role === 'Teacher' ? 4 : 5} align="center" sx={{ py: { xs: 6, sm: 8 } }}>
                    <ClassIcon sx={{ fontSize: { xs: 48, sm: 64 }, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                      No classes found
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                      {user?.role === 'Teacher'
                        ? 'You have not been assigned to any classes yet. Please contact the administrator.'
                        : searchTerm
                          ? 'Try a different search term'
                          : 'Add your first class to get started'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredClasses.map((classItem, index) => (
                  <TableRow
                    key={classItem.id}
                    hover
                    sx={getRowStyle(index)}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
                        <Avatar
                          sx={{
                            bgcolor: getClassColor(classItem.name),
                            fontWeight: 600,
                            width: { xs: 32, sm: 40 },
                            height: { xs: 32, sm: 40 },
                          }}
                        >
                          {classItem.name?.charAt(0).toUpperCase() || 'C'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                            {classItem.displayName || classItem.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                            {classItem.name}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {user?.role === 'Teacher' ? (
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                          {classItem.subjects || 'N/A'}
                        </Typography>
                      ) : (
                        <Chip
                          label={classItem.section || 'N/A'}
                          size="small"
                          sx={{
                            bgcolor: 'primary.main',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                            opacity: 0.15,
                          }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={classItem.schoolLevel || 'N/A'}
                        size="small"
                        sx={{
                          bgcolor: 'success.main',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          opacity: 0.15,
                        }}
                      />
                    </TableCell>
                    {user?.role !== 'Teacher' && (
                      <TableCell>
                        <Chip
                          label={classItem.isActive ? 'Active' : 'Inactive'}
                          size="small"
                          sx={{
                            bgcolor: classItem.isActive ? 'success.main' : 'error.main',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                            opacity: 0.8,
                          }}
                        />
                      </TableCell>
                    )}
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          const route = user?.role === 'Admin' ? '/admin-dashboard' : '/teacher-dashboard';
                          navigate(`${route}/exams?classId=${classItem.id}`);
                        }}
                        sx={{
                          color: '#AB47BC',
                          borderColor: '#AB47BC',
                          mr: 1,
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          '&:hover': { bgcolor: '#AB47BC', color: 'white', borderColor: '#AB47BC' },
                        }}
                      >
                        {window.innerWidth < 600 ? 'Exams' : 'View Exams'}
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => navigate(`/dashboard/students?classId=${classItem.id}`)}
                        sx={{
                          color: 'primary.main',
                          borderColor: 'primary.main',
                          mr: 1,
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          '&:hover': { bgcolor: 'primary.main', color: 'white' },
                        }}
                      >
                        {window.innerWidth < 600 ? 'Students' : 'View Students'}
                      </Button>
                      {user?.role !== 'Teacher' && (
                        <>
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/dashboard/classes/${classItem.id}/edit`)}
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
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this class?')) {
                                adminAPI.classes.delete(classItem.id).then(() => {
                                  setClasses(classes.filter(c => c.id !== classItem.id));
                                });
                              }
                            }}
                            sx={{
                              bgcolor: 'error.main',
                              color: 'white',
                              opacity: 0.15,
                              '&:hover': { bgcolor: 'error.main', opacity: 1 },
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
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

export default ClassList;
