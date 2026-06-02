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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
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
  CloudUpload,
  Description,
  Info,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { adminAPI, teacherAPI } from '../../services/api';
import api from '../../services/api';
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
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [academicYearId, setAcademicYearId] = useState('');
  const [uploadInfoOpen, setUploadInfoOpen] = useState(false);

  const handleBulkUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!selectedClass) {
      setError('Please select a class first before uploading students');
      event.target.value = '';
      return;
    }

    if (!academicYearId) {
      setError('No active academic year found. Please set an academic year first.');
      event.target.value = '';
      return;
    }

    setUploadLoading(true);
    setError(null);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('File', file);
    formData.append('academicYearId', academicYearId);

    try {
      const response = await adminAPI.classes.bulkUploadStudents(selectedClass, formData);

      if (response.data?.success) {
        const result = response.data.data;
        setUploadResult(result);
        if (result.successRecords?.length > 0) {
          fetchStudents();
        }
      } else {
        setError(response.data?.message || 'Failed to upload students');
      }
    } catch (err) {
      console.error('Error uploading students:', err);
      setError(err.response?.data?.message || 'An error occurred while uploading students');
    } finally {
      setUploadLoading(false);
      event.target.value = '';
    }
  };

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

    const fetchActiveAcademicYear = async () => {
      try {
        const response = await api.get('/api/academicyears/active');
        console.log('Academic year response:', response);
        if (response.data?.success && response.data?.data) {
          setAcademicYearId(response.data.data.id);
        } else {
          console.log('Academic year error:', response.data);
        }
      } catch (err) {
        console.error('Error fetching academic year:', err);
      }
    };

    fetchAdminClasses();
    fetchActiveAcademicYear();
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
      const response = await api.getByClassPaged(selectedClass, 1, 100, academicYearId);
      
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

  useEffect(() => {
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

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {uploadResult && (
        <Alert severity="success" onClose={() => setUploadResult(null)} sx={{ mb: 2, borderRadius: 2 }}>
          Successfully uploaded {uploadResult.successCount || 0} students.
          {uploadResult.failedCount > 0 && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Failed: {uploadResult.failedCount} students
            </Typography>
          )}
        </Alert>
      )}

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
              <>
                <input
                  accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  style={{ display: 'none' }}
                  id="bulk-student-upload"
                  type="file"
                  onChange={handleBulkUpload}
                />
                <Box sx={{ 
                  display: 'flex', 
                  gap: 1, 
                  flexWrap: 'wrap',
                  width: { xs: '100%', sm: 'auto' },
                }}>
                  <Button
                    variant="contained"
                    startIcon={<PersonAdd />}
                    onClick={() => navigate(`${basePath}/students/new`)}
                    size="small"
                    sx={{
                      background: 'linear-gradient(135deg, #6FAF8F 0%, #4E8C70 100%)',
                      borderRadius: 2.5,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      whiteSpace: 'nowrap',
                      boxShadow: '0 4px 14px rgba(111, 175, 143, 0.3)',
                    }}
                  >
                    Add Student
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<PersonAdd />}
                    onClick={() => navigate(`${basePath}/students/add-student-parent`)}
                    size="small"
                    sx={{
                      borderColor: '#FF3E8A',
                      color: '#FF3E8A',
                      borderRadius: 2.5,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      whiteSpace: 'nowrap',
                      '&:hover': {
                        borderColor: '#FF5DA3',
                        background: 'rgba(255, 62, 138, 0.08)',
                      },
                    }}
                  >
                    Add + Parent
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CloudUpload />}
                    disabled={uploadLoading}
                    size="small"
                    onClick={() => setUploadInfoOpen(true)}
                    sx={{
                      borderColor: '#6FAF8F',
                      color: '#6FAF8F',
                      borderRadius: 2.5,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      whiteSpace: 'nowrap',
                      '&:hover': {
                        borderColor: '#4E8C70',
                        background: 'rgba(111, 175, 143, 0.08)',
                      },
                    }}
                  >
                    {uploadLoading ? 'Uploading...' : 'Bulk Upload'}
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Upload Info Modal */}
      <Dialog open={uploadInfoOpen} onClose={() => setUploadInfoOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Description sx={{ color: '#6FAF8F' }} />
          Student Upload Guide
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3, p: 2.5, borderRadius: '12px', background: 'rgba(111, 175, 143, 0.06)', border: '1px solid rgba(111, 175, 143, 0.15)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Info sx={{ color: '#6FAF8F', fontSize: 20 }} />
              <Typography sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                Accepted File Format
              </Typography>
            </Box>
            <Typography sx={{ color: '#666', fontSize: '0.9rem' }}>
              Only <strong>.docx</strong> (Word Document) files are accepted.
              Please prepare your student list in a Word document before uploading.
            </Typography>
          </Box>

          <Typography sx={{ fontWeight: 600, color: '#1a1a1a', mb: 2 }}>
            How to prepare your document:
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
            {[
              'Open Microsoft Word and create a new document.',
              'List each student with their details in the format: <strong>Full Name, Gender, Date of Birth, Address, Phone Number</strong>.',
              'Separate each student on a new line.',
              'Save the document as a .docx file and upload it using the button below.',
            ].map((step, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1.5 }}>
                <Box sx={{
                  width: 24, height: 24, borderRadius: '50%', background: '#6FAF8F',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0, mt: 0.3,
                }}>
                  {i + 1}
                </Box>
                <Typography sx={{ color: '#555', fontSize: '0.9rem', lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: step }} />
              </Box>
            ))}
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
            <Button onClick={() => setUploadInfoOpen(false)} sx={{ color: '#666', borderRadius: 2.5 }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<CloudUpload />}
              onClick={() => {
                setUploadInfoOpen(false);
                setTimeout(() => document.getElementById('bulk-student-upload')?.click(), 200);
              }}
              sx={{
                background: 'linear-gradient(135deg, #6FAF8F 0%, #4E8C70 100%)',
                borderRadius: 2.5,
                px: 3,
              }}
            >
              Choose File
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

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
