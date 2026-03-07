import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
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
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import {
  Person,
  Edit,
  Add,
  Search,
  School,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { adminAPI, teacherAPI } from '../../services/api';
import { enumToGender } from '../../utils/dataMapping';

const StudentList = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const classIdFromUrl = searchParams.get('classId');
  const basePath = user?.role === 'Admin' ? '/admin-dashboard' : '/teacher-dashboard';

  const [students, setStudents] = useState([]);
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [adminClasses, setAdminClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(classIdFromUrl || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch Admin classes
  useEffect(() => {
    const fetchAdminClasses = async () => {
      if (user?.role !== 'Admin') return;

      try {
        const response = await adminAPI.classes.getAll();
        if (response.data?.success && response.data?.data) {
          setAdminClasses(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching admin classes:', err);
      }
    };

    fetchAdminClasses();
  }, [user?.role]);

  // Fetch teacher's assigned classes
  useEffect(() => {
    const fetchTeacherClasses = async () => {
      if (user?.role !== 'Teacher') return;

      try {
        const response = await teacherAPI.myAssignments.getAll(1, 100);
        if (response.data?.success && response.data?.data?.items) {
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
              });
            }
          });

          setTeacherClasses(uniqueClasses);

          // Auto-select if only one class
          if (uniqueClasses.length === 1 && !selectedClass) {
            setSelectedClass(uniqueClasses[0].id);
          }

          // if the url gave us a class id that isn't in the list, clear it
          if (selectedClass && !uniqueClasses.find(c => c.id === selectedClass)) {
            setSelectedClass('');
          }
        }
      } catch (err) {
        console.error('Error fetching teacher classes:', err);
      }
    };

    fetchTeacherClasses();
  }, [user?.role]);

  // Determine which classes to show based on role
  const getClasses = () => {
    if (user?.role === 'Admin') return adminClasses;
    if (user?.role === 'Teacher') return teacherClasses;
    return [];
  };

  const classes = getClasses();

  // Fetch students when class is selected
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClass) {
        setStudents([]);
        setLoading(false);
        return;
      }

      // teachers must only request their own classes
      if (user?.role === 'Teacher') {
        const allowedIds = teacherClasses.map(c => c.id);
        if (!allowedIds.includes(selectedClass)) {
          // reset list; maybe user tampered with URL
          setStudents([]);
          setLoading(false);
          return;
        }
      }

      try {
        setLoading(true);
        const api = user?.role === 'Teacher' ? teacherAPI.students : adminAPI.students;
        console.log('=== FETCHING STUDENTS BY CLASS ===');
        console.log('classId:', selectedClass);
        console.log('API:', user?.role === 'Teacher' ? 'teacherAPI.students' : 'adminAPI.students');
        const response = await api.getByClassPaged(selectedClass, 1, 100);
        
        console.log('=== RESPONSE ===');
        console.log('Success:', response.data?.success);
        console.log('TotalCount:', response.data?.data?.totalCount);
        console.log('Items:', response.data?.data?.items);

        if (response.data?.success && response.data?.data?.items) {
          setStudents(response.data.data.items);
        } else {
          setStudents([]);
        }
      } catch (err) {
        console.error('Error fetching students:', err);
        setError('Failed to load students');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedClass, teacherClasses, user?.role]);

  // Filter students based on search query
  const filteredStudents = students.filter((student) => {
    const searchLower = searchQuery.toLowerCase();
    // Handle both cases: when User is null (registered via register endpoint)
    // and when User exists (registered via create endpoint)
    const firstName = student.firstName || student.user?.firstName || '';
    const lastName = student.lastName || student.user?.lastName || '';
    const fullName = `${firstName} ${lastName}`.toLowerCase();
    const studentNumber = (student.studentNumber || '').toLowerCase();

    return (
      fullName.includes(searchLower) ||
      studentNumber.includes(searchLower)
    );
  });

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

  if (loading && students.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 0 }}>
      {/* Header */}
      <Card
        sx={{
          mb: { xs: 2, sm: 3 },
          background: theme.palette.mode === 'dark'
            ? 'rgba(30, 30, 30, 0.8)'
            : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: { xs: 2, sm: 3 },
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: { xs: 1.5, sm: 2 }, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 2, sm: 0 } }}>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  mb: 0.5,
                  fontSize: { xs: '1.5rem', sm: '2rem' },
                }}
              >
                {user?.role === 'Teacher' ? 'My Students' : 'All Students'}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
              >
                {students.length} {students.length === 1 ? 'student' : 'students'} found
              </Typography>
            </Box>
            {/* only admins are allowed to create new students */}
            {user?.role === 'Admin' && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate(`${basePath}/students/new`)}
                sx={{
                  background: 'primary.main',
                  '&:hover': { background: 'primary.dark' },
                  px: { xs: 2, sm: 2.5 },
                  py: { xs: 1, sm: 1.5 },
                  fontWeight: 600,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  borderRadius: { xs: 1.5, sm: 2 },
                }}
              >
                {window.innerWidth < 600 ? 'Add' : 'Add Student'}
              </Button>
            )}
          </Box>

          {/* Class Selector for Admin and Teachers */}
          {classes.length > 0 && (
            <FormControl
              fullWidth
              sx={{ minWidth: { xs: '100%', sm: 300 }, mb: 2 }}
            >
              <InputLabel>Select Class</InputLabel>
              <Select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                label="Select Class"
              >
                <MenuItem value="">
                  <em>Select a class</em>
                </MenuItem>
                {classes.map((cls) => (
                  <MenuItem key={cls.id} value={cls.id}>
                    {cls.displayName || cls.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Search */}
          <TextField
            fullWidth
            placeholder="Search students by name or roll number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
          />
        </CardContent>
      </Card>

      {/* No classes available message */}
      {classes.length === 0 && !loading && user?.role === 'Admin' && (
        <Card
          sx={{
            background: theme.palette.mode === 'dark'
              ? 'rgba(30, 30, 30, 0.8)'
              : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: { xs: 2, sm: 3 },
            p: { xs: 4, sm: 6 },
            textAlign: 'center',
          }}
        >
          <School sx={{ fontSize: { xs: 48, sm: 64 }, color: 'text.disabled', mb: 2 }} />
          <Typography
            variant="h6"
            sx={{ color: 'text.primary', mb: 1, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
          >
            No Classes Available
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
          >
            No classes have been created yet. Please create a class first.
          </Typography>
        </Card>
      )}

      {/* Teacher with no classes message */}
      {user?.role === 'Teacher' && teacherClasses.length === 0 && !loading && (
        <Card
          sx={{
            background: theme.palette.mode === 'dark'
              ? 'rgba(30, 30, 30, 0.8)'
              : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: { xs: 2, sm: 3 },
            p: { xs: 4, sm: 6 },
            textAlign: 'center',
          }}
        >
          <School sx={{ fontSize: { xs: 48, sm: 64 }, color: 'text.disabled', mb: 2 }} />
          <Typography
            variant="h6"
            sx={{ color: 'text.primary', mb: 1, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
          >
            No Classes Assigned
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
          >
            You have not been assigned to any classes yet. Please contact the administrator to get assigned to classes.
          </Typography>
        </Card>
      )}

      {/* No class selected message */}
      {selectedClass && classes.length > 0 && !loading && (
        <Box sx={{ overflowX: 'auto' }}>
          <TableContainer
            component={Card}
            sx={{
              background: theme.palette.mode === 'dark'
                ? 'rgba(30, 30, 30, 0.8)'
                : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: { xs: 2, sm: 3 },
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'primary.main', opacity: 0.1 }}>
                  <TableCell sx={{ color: 'text.primary', fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Student</TableCell>
                  <TableCell sx={{ color: 'text.primary', fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Student Number</TableCell>
                  <TableCell sx={{ color: 'text.primary', fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Gender</TableCell>
                  <TableCell sx={{ color: 'text.primary', fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Status</TableCell>
                  <TableCell align="right" sx={{ color: 'text.primary', fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ color: 'text.secondary', textAlign: 'center', py: { xs: 3, sm: 4 }, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                      {searchQuery
                        ? 'No students match your search'
                        : loading
                          ? 'Loading students...'
                          : 'No students found in this class'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student, index) => (
                    <TableRow
                      key={student.id}
                      sx={getRowStyle(index)}
                    >
                      <TableCell sx={{ color: 'text.primary', borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
                          <Box
                            sx={{
                              width: { xs: 28, sm: 32 },
                              height: { xs: 28, sm: 32 },
                              borderRadius: '50%',
                              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            }}
                          >
                            {(student.firstName || student.user?.firstName || 'S')?.charAt(0) || 'S'}
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                              {student.firstName || student.user?.firstName || ''} {student.lastName || student.user?.lastName || ''}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary', borderBottom: '1px solid', borderColor: 'divider', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                        {student.studentNumber || 'N/A'}
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary', borderBottom: '1px solid', borderColor: 'divider', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
{enumToGender(student.gender ?? student.Gender) || 'N/A'}
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Chip
                          label={student.isActive ? 'Active' : 'Inactive'}
                          size="small"
                          sx={{
                            background: student.isActive ? 'success.main' : 'error.main',
                            color: 'white',
                            opacity: 0.8,
                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                        <IconButton
                          size="small"
                          sx={{ color: 'primary.main' }}
                          onClick={() => navigate(`/dashboard/students/${student.id}/edit`)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
};

export default StudentList;
