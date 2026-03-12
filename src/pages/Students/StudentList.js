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
  Avatar,
} from '@mui/material';
import {
  Person,
  PersonAdd,
  Edit,
  Add,
  Search,
  School,
  AssignmentTurnedIn,
  MoreVert,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { adminAPI, teacherAPI } from '../../services/api';
import { enumToGender } from '../../utils/dataMapping';
import { PageHeader, StatusBadge } from '../../components/ui';

const StudentList = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
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

          if (uniqueClasses.length === 1 && !selectedClass) {
            setSelectedClass(uniqueClasses[0].id);
          }

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

  const getClasses = () => {
    if (user?.role === 'Admin') return adminClasses;
    if (user?.role === 'Teacher') return teacherClasses;
    return [];
  };

  const classes = getClasses();

  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClass) {
        setStudents([]);
        setLoading(false);
        return;
      }

      if (user?.role === 'Teacher') {
        const allowedIds = teacherClasses.map(c => c.id);
        if (!allowedIds.includes(selectedClass)) {
          setStudents([]);
          setLoading(false);
          return;
        }
      }

      try {
        setLoading(true);
        const api = user?.role === 'Teacher' ? teacherAPI.students : adminAPI.students;
        const response = await api.getByClassPaged(selectedClass, 1, 100);
        
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

  const filteredStudents = students.filter((student) => {
    const searchLower = searchQuery.toLowerCase();
    const firstName = student.firstName || student.user?.firstName || '';
    const lastName = student.lastName || student.user?.lastName || '';
    const fullName = `${firstName} ${lastName}`.toLowerCase();
    const studentNumber = (student.studentNumber || '').toLowerCase();

    return fullName.includes(searchLower) || studentNumber.includes(searchLower);
  });

  if (loading && students.length === 0) {
    return (
      <Box>
        <PageHeader
          title={user?.role === 'Teacher' ? 'My Students' : 'All Students'}
          subtitle="Manage your students"
        />
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
        title={user?.role === 'Teacher' ? 'My Students' : 'All Students'}
        subtitle={`${filteredStudents.length} ${filteredStudents.length === 1 ? 'student' : 'students'} found`}
        actionText={user?.role === 'Admin' ? 'Add Student' : undefined}
        onAction={user?.role === 'Admin' ? () => navigate(`${basePath}/students/new`) : undefined}
      />

      <Card sx={{ borderRadius: 3, border: '1px solid rgba(111, 175, 143, 0.1)', mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControl sx={{ minWidth: { xs: '100%', sm: 250 } }}>
              <InputLabel>Select Class</InputLabel>
              <Select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                label="Select Class"
                sx={{
                  borderRadius: 2.5,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                    backgroundColor: '#F8FAF9',
                  },
                }}
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

            <TextField
              placeholder="Search by name or roll number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                flex: 1,
                minWidth: { xs: '100%', sm: 250 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2.5,
                  backgroundColor: '#F8FAF9',
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: '#6FAF8F' }} />
                  </InputAdornment>
                ),
              }}
            />

            {user?.role === 'Admin' && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<PersonAdd />}
                  onClick={() => navigate(`${basePath}/students/new`)}
                  sx={{
                    background: 'linear-gradient(135deg, #6FAF8F 0%, #4E8C70 100%)',
                    borderRadius: 2.5,
                    px: 2.5,
                    boxShadow: '0 4px 14px rgba(111, 175, 143, 0.3)',
                  }}
                >
                  Add Student
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PersonAdd />}
                  onClick={() => navigate(`${basePath}/students/add-student-parent`)}
                  sx={{
                    borderColor: '#FF3E8A',
                    color: '#FF3E8A',
                    borderRadius: 2.5,
                    px: 2.5,
                    '&:hover': {
                      borderColor: '#FF5DA3',
                      background: 'rgba(255, 62, 138, 0.08)',
                    },
                  }}
                >
                  Add + Parent
                </Button>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {classes.length === 0 && !loading && user?.role === 'Admin' && (
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
            <School sx={{ fontSize: 40, color: '#6FAF8F' }} />
          </Box>
          <Typography variant="h6" sx={{ color: '#1E293B', fontWeight: 600, mb: 1 }}>
            No Classes Available
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
            No classes have been created yet. Please create a class first.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate(`${basePath}/classes/new`)}
            sx={{
              background: 'linear-gradient(135deg, #6FAF8F 0%, #4E8C70 100%)',
              borderRadius: 2.5,
            }}
          >
            Create Class
          </Button>
        </Card>
      )}

      {user?.role === 'Teacher' && teacherClasses.length === 0 && !loading && (
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
            <School sx={{ fontSize: 40, color: '#6FAF8F' }} />
          </Box>
          <Typography variant="h6" sx={{ color: '#1E293B', fontWeight: 600, mb: 1 }}>
            No Classes Assigned
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            You have not been assigned to any classes yet.
          </Typography>
        </Card>
      )}

      {selectedClass && classes.length > 0 && !loading && (
        <Card sx={{ borderRadius: 3, border: '1px solid rgba(111, 175, 143, 0.1)', overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#F8FAF9' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>Student</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>Student Number</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>Gender</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center', py: 8 }}>
                      <Box sx={{ color: '#64748B' }}>
                        <Search sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {searchQuery ? 'No students match your search' : 'No students found in this class'}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student, index) => {
                    const firstName = student.firstName || student.user?.firstName || '';
                    const lastName = student.lastName || student.user?.lastName || '';
                    const fullName = `${firstName} ${lastName}`.trim();
                    const initial = firstName?.charAt(0) || 'S';

                    return (
                      <TableRow
                        key={student.id}
                        sx={{
                          borderBottom: '1px solid rgba(111, 175, 143, 0.08)',
                          '&:hover': { backgroundColor: 'rgba(111, 175, 143, 0.03)' },
                          transition: 'background-color 0.2s ease',
                        }}
                      >
                        <TableCell sx={{ py: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar
                              sx={{
                                width: 40,
                                height: 40,
                                bgcolor: '#6FAF8F',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                              }}
                            >
                              {initial}
                            </Avatar>
                            <Typography variant="body2" sx={{ fontWeight: 500, color: '#1E293B' }}>
                              {fullName || 'Unknown'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: '#64748B', fontSize: '0.875rem' }}>
                          {student.studentNumber || 'N/A'}
                        </TableCell>
                        <TableCell sx={{ color: '#64748B', fontSize: '0.875rem' }}>
                          {enumToGender(student.gender ?? student.Gender) || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={student.isActive ? 'Active' : 'Inactive'} />
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                            <IconButton
                              size="small"
                              onClick={() => navigate(`${basePath}/students/${student.id}/edit`)}
                              sx={{
                                color: '#6FAF8F',
                                '&:hover': { backgroundColor: 'rgba(111, 175, 143, 0.1)' },
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            {hasRole('Admin', 'Teacher') && (
                              <IconButton
                                size="small"
                                onClick={() => navigate(`${basePath}/students/${student.id}/grade`)}
                                sx={{
                                  color: '#10B981',
                                  '&:hover': { backgroundColor: 'rgba(16, 185, 129, 0.1)' },
                                }}
                              >
                                <AssignmentTurnedIn fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Box>
  );
};

export default StudentList;
