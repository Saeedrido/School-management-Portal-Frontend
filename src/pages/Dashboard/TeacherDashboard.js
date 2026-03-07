import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Avatar,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Person,
  School,
  Book,
  Assignment,
  Quiz,
  Event,
  AccessTime,
  People,
  ArrowForward,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { teacherAPI } from '../../services/api';
import { enumToGender } from '../../utils/dataMapping';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [myAssignments, setMyAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [totalStudentCount, setTotalStudentCount] = useState(0);

  const greenPrimary = '#6FAF8F';
  const greenHover = '#4E8C70';

  const stats = {
    totalStudents: totalStudentCount,
    totalClasses: myAssignments.length,
    totalSubjects: [...new Set(myAssignments.map(a => a.subjectId || a.subject?.id))].length,
    upcomingExams: exams.filter(e => new Date(e.startTime) > new Date()).length,
  };

  useEffect(() => {
    const fetchMyAssignments = async () => {
      try {
        setLoading(true);
        const response = await teacherAPI.myAssignments.getAll(1, 50);
        let assignments = [];
        if (response.data?.success) {
          if (response.data.data?.items) {
            assignments = response.data.data.items;
          } else if (Array.isArray(response.data.data)) {
            assignments = response.data.data;
          }
        }
        setMyAssignments(assignments);
        const uniqueClassIds = [...new Set(assignments.map(a => a.classId).filter(Boolean))];
        let total = 0;
        for (const classId of uniqueClassIds) {
          try {
            const res = await teacherAPI.students.getByClassPaged(classId, 1, 1);
            if (res.data?.success && res.data?.data?.totalCount != null) {
              total += res.data.data.totalCount;
            } else if (res.data?.success && res.data?.data?.items) {
              total += res.data.data.items.length;
            }
          } catch (_) {}
        }
        setTotalStudentCount(total);
      } catch (err) {
        console.error('Error fetching assignments:', err);
        setError('Failed to load your class assignments');
        setMyAssignments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMyAssignments();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      const fetchStudents = async () => {
        try {
          const response = await teacherAPI.students.getByClassPaged(selectedClass, 1, 100);
          if (response.data?.success && response.data?.data?.items) {
            setStudents(response.data.data.items);
          } else {
            setStudents([]);
          }
        } catch (err) {
          console.error('Error fetching students:', err);
        }
      };
      const fetchExams = async () => {
        try {
          const response = await teacherAPI.exams.getByClass(selectedClass, 1, 20);
          if (response.data?.success && response.data?.data?.items) {
            setExams(response.data.data.items);
          } else {
            setExams([]);
          }
        } catch (err) {
          console.error('Error fetching exams:', err);
        }
      };
      fetchStudents();
      fetchExams();
    }
  }, [selectedClass]);

  const getExamStatusColor = (startTime, endTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (now < start) return { bgcolor: `${greenPrimary}20`, color: greenPrimary, label: 'Upcoming' };
    if (now >= start && now <= end) return { bgcolor: '#FEF3C7', color: '#D97706', label: 'In Progress' };
    return { bgcolor: `${greenPrimary}20`, color: greenPrimary, label: 'Completed' };
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 0 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} icon={<ErrorIcon />}>
          {error}
        </Alert>
      )}

      {/* Welcome Header */}
      <Card sx={{ mb: 2, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 3 }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar
              src={user?.profilePicture}
              sx={{
                width: { xs: 56, sm: 64, md: 70 },
                height: { xs: 56, sm: 64, md: 70 },
                border: `3px solid ${greenPrimary}`,
                boxShadow: `0 4px 14px rgba(111, 175, 143, 0.3)`,
                bgcolor: '#EAF3EE',
              }}
            >
              {!user?.profilePicture && (
                <Person sx={{ fontSize: { xs: 28, sm: 32, md: 35 }, color: greenPrimary }} />
              )}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1F2937', mb: 0.5, fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}>
                Welcome back, {user?.name || 'Teacher'}!
              </Typography>
              <Typography variant="body2" sx={{ color: '#6B7280' }}>
                {user?.email} • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Quiz />}
              onClick={() => navigate('/teacher-dashboard/exams/new')}
              sx={{
                background: `linear-gradient(135deg, ${greenPrimary} 0%, ${greenHover} 100%)`,
                '&:hover': { background: `linear-gradient(135deg, ${greenHover} 0%, #3D7B5F 100%)` },
                px: { xs: 1.52 },
                py: 1,
                fontWeight: 600,
                boxShadow: '0 4px 14px rgba(111, 175, 143, 0.4)',
              }}
            >
              {window.innerWidth < 600 ? 'Create' : 'Create Exam'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Quick Stats - Big cards like Admin Dashboard */}
      <Grid container spacing={{ xs: 2, sm: 2, md: 2 }} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: { xs: 2, sm: 3 }, height: '100%', cursor: 'pointer', transition: 'all 0.3s ease', '&:hover': { border: `1px solid ${greenPrimary}`, boxShadow: `0 8px 24px rgba(111, 175, 143, 0.2)`, transform: 'translateY(-4px)' } }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, sm: 3 } }}>
                <Box sx={{ width: { xs: 50, sm: 60 }, height: { xs: 50, sm: 60 }, borderRadius: { xs: 2, sm: 3 }, background: `${greenPrimary}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: greenPrimary }}>
                  <People sx={{ fontSize: { xs: 28, sm: 32 } }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1F2937', mb: 0.5, fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>{stats.totalStudents}</Typography>
                  <Typography variant="body2" sx={{ color: '#6B7280', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Students</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: { xs: 2, sm: 3 }, height: '100%', cursor: 'pointer', transition: 'all 0.3s ease', '&:hover': { border: `1px solid ${greenPrimary}`, boxShadow: `0 8px 24px rgba(111, 175, 143, 0.2)`, transform: 'translateY(-4px)' } }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, sm: 3 } }}>
                <Box sx={{ width: { xs: 50, sm: 60 }, height: { xs: 50, sm: 60 }, borderRadius: { xs: 2, sm: 3 }, background: `${greenPrimary}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: greenPrimary }}>
                  <School sx={{ fontSize: { xs: 28, sm: 32 } }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1F2937', mb: 0.5, fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>{stats.totalClasses}</Typography>
                  <Typography variant="body2" sx={{ color: '#6B7280', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>My Classes</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: { xs: 2, sm: 3 }, height: '100%', cursor: 'pointer', transition: 'all 0.3s ease', '&:hover': { border: `1px solid ${greenPrimary}`, boxShadow: `0 8px 24px rgba(111, 175, 143, 0.2)`, transform: 'translateY(-4px)' } }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, sm: 3 } }}>
                <Box sx={{ width: { xs: 50, sm: 60 }, height: { xs: 50, sm: 60 }, borderRadius: { xs: 2, sm: 3 }, background: `${greenPrimary}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: greenPrimary }}>
                  <Book sx={{ fontSize: { xs: 28, sm: 32 } }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1F2937', mb: 0.5, fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>{stats.totalSubjects}</Typography>
                  <Typography variant="body2" sx={{ color: '#6B7280', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Subjects</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: { xs: 2, sm: 3 }, height: '100%', cursor: 'pointer', transition: 'all 0.3s ease', '&:hover': { border: `1px solid ${greenPrimary}`, boxShadow: `0 8px 24px rgba(111, 175, 143, 0.2)`, transform: 'translateY(-4px)' } }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, sm: 3 } }}>
                <Box sx={{ width: { xs: 50, sm: 60 }, height: { xs: 50, sm: 60 }, borderRadius: { xs: 2, sm: 3 }, background: `${greenPrimary}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: greenPrimary }}>
                  <Quiz sx={{ fontSize: { xs: 28, sm: 32 } }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1F2937', mb: 0.5, fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>{stats.upcomingExams}</Typography>
                  <Typography variant="body2" sx={{ color: '#6B7280', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Upcoming Exams</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: { xs: 2, sm: 3 }, height: '100%', cursor: 'pointer', transition: 'all 0.3s ease', '&:hover': { border: `1px solid ${greenPrimary}`, boxShadow: `0 8px 24px rgba(111, 175, 143, 0.2)`, transform: 'translateY(-4px)' } }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, sm: 3 } }}>
                <Box sx={{ width: { xs: 50, sm: 60 }, height: { xs: 50, sm: 60 }, borderRadius: { xs: 2, sm: 3 }, background: `${greenPrimary}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: greenPrimary }}>
                  <Assignment sx={{ fontSize: { xs: 28, sm: 32 } }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1F2937', mb: 0.5, fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>{exams.filter(e => e.isActive).length}</Typography>
                  <Typography variant="body2" sx={{ color: '#6B7280', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Active Exams</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: '#E2E8F0', mb: 2 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ '& .MuiTabs-indicator': { backgroundColor: greenPrimary } }}>
          <Tab label="My Classes" />
          <Tab label="Students" />
          <Tab label="Exams" />
        </Tabs>
      </Box>

      {/* My Classes Tab */}
      <Box sx={{ display: tabValue === 0 ? 'block' : 'none' }}>
        {myAssignments.length === 0 ? (
          <Card sx={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 3, p: 4, textAlign: 'center' }}>
            <Typography sx={{ color: '#6B7280' }}>No class assignments found.</Typography>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {myAssignments.map((assignment) => (
              <Grid item xs={12} sm={6} md={4} key={assignment.id}>
                <Card sx={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 3, cursor: 'pointer', transition: 'all 0.3s ease', '&:hover': { border: `1px solid ${greenPrimary}`, boxShadow: `0 8px 24px rgba(111, 175, 143, 0.2)` } }} onClick={() => { setSelectedClass(assignment.classId); setTabValue(1); }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Box>
                        <Typography variant="h6" sx={{ color: '#1F2937', fontWeight: 600, mb: 0.25 }}>{assignment.class?.name || `Class ${assignment.classId}`}</Typography>
                        <Typography variant="caption" sx={{ color: '#6B7280' }}>{assignment.subject?.name || `Subject ${assignment.subjectId}`}</Typography>
                      </Box>
                      <Chip label={assignment.term?.name || 'Current Term'} size="small" sx={{ background: `${greenPrimary}20`, color: greenPrimary }} />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Button size="small" variant="outlined" startIcon={<People />} onClick={(e) => { e.stopPropagation(); setSelectedClass(assignment.classId); setTabValue(1); }} sx={{ flex: 1, color: greenPrimary, borderColor: greenPrimary, fontSize: '0.8rem' }}>View Students</Button>
                      <Button size="small" variant="outlined" startIcon={<Quiz />} onClick={(e) => { e.stopPropagation(); setSelectedClass(assignment.classId); setTabValue(2); }} sx={{ flex: 1, color: greenPrimary, borderColor: greenPrimary, fontSize: '0.8rem' }}>View Exams</Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Students Tab */}
      <Box sx={{ display: tabValue === 1 ? 'block' : 'none' }}>
        {!selectedClass ? (
          <Card sx={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 3, p: 4, textAlign: 'center' }}>
            <Typography sx={{ color: '#6B7280' }}>Please select a class from the "My Classes" tab.</Typography>
          </Card>
        ) : (
          <TableContainer component={Card} sx={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ background: `${greenPrimary}10` }}>
                  <TableCell sx={{ color: '#1F2937', fontWeight: 600 }}>Student</TableCell>
                  <TableCell sx={{ color: '#1F2937', fontWeight: 600 }}>Roll Number</TableCell>
                  <TableCell sx={{ color: '#1F2937', fontWeight: 600 }}>Gender</TableCell>
                  <TableCell sx={{ color: '#1F2937', fontWeight: 600 }}>Status</TableCell>
                  <TableCell align="right" sx={{ color: '#1F2937', fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.length === 0 ? (
                  <TableRow><TableCell colSpan={5} sx={{ color: '#6B7280', textAlign: 'center', py: 4 }}>No students found</TableCell></TableRow>
                ) : (
                  students.map((student) => (
                    <TableRow key={student.id} sx={{ '&:hover': { background: `${greenPrimary}05` } }}>
                      <TableCell sx={{ color: '#1F2937', borderBottom: '1px solid #E2E8F0' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar src={student.profilePictureUrl} sx={{ width: 32, height: 32, bgcolor: '#EAF3EE' }}><Person /></Avatar>
                          <Typography variant="body2" sx={{ color: '#1F2937', fontWeight: 500 }}>{student.user?.firstName || student.firstName} {student.user?.lastName || student.lastName}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: '#6B7280', borderBottom: '1px solid #E2E8F0' }}>{student.studentNumber || student.rollNumber || 'N/A'}</TableCell>
                      <TableCell sx={{ color: '#6B7280', borderBottom: '1px solid #E2E8F0' }}>{enumToGender(student.gender) || 'N/A'}</TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #E2E8F0' }}>
                        <Chip label={student.isActive ? 'Active' : 'Inactive'} size="small" sx={{ background: student.isActive ? `${greenPrimary}20` : '#FEE2E2', color: student.isActive ? greenPrimary : '#DC2626' }} />
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #E2E8F0' }}>
                        <IconButton size="small" sx={{ color: greenPrimary }} onClick={() => navigate(`/teacher-dashboard/students/${student.id}`)}><ArrowForward fontSize="small" /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Exams Tab */}
      <Box sx={{ display: tabValue === 2 ? 'block' : 'none' }}>
        {!selectedClass ? (
          <Card sx={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 3, p: 4, textAlign: 'center' }}>
            <Typography sx={{ color: '#6B7280' }}>Please select a class from the "My Classes" tab.</Typography>
          </Card>
        ) : (
          <>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              {exams.length === 0 ? (
                <Grid item xs={12}><Card sx={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 3, p: 4, textAlign: 'center' }}><Typography sx={{ color: '#6B7280' }}>No exams found</Typography></Card></Grid>
              ) : (
                exams.map((exam) => {
                  const status = getExamStatusColor(exam.startTime, exam.endTime);
                  return (
                    <Grid item xs={12} md={4} key={exam.id}>
                      <Card sx={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 3, height: '100%', cursor: 'pointer', transition: 'all 0.3s ease', '&:hover': { border: `1px solid ${greenPrimary}`, boxShadow: `0 8px 24px rgba(111, 175, 143, 0.2)` } }} onClick={() => navigate(`/teacher-dashboard/exams/${exam.id}`)}>
                        <CardContent sx={{ p: 2.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                            <Avatar sx={{ background: status.bgcolor, color: status.color }}><Quiz /></Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body1" sx={{ color: '#1F2937', fontWeight: 600, mb: 0.5 }}>{exam.title}</Typography>
                              <Typography variant="caption" sx={{ color: '#6B7280' }}>{exam.classSubject?.subject?.name || 'Exam'}</Typography>
                            </Box>
                            <Chip label={status.label} size="small" sx={{ background: status.bgcolor, color: status.color }} />
                          </Box>
                          <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Event sx={{ fontSize: 16, color: '#6B7280' }} /><Typography variant="caption" sx={{ color: '#6B7280' }}>{new Date(exam.startTime).toLocaleDateString()}</Typography></Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><AccessTime sx={{ fontSize: 16, color: '#6B7280' }} /><Typography variant="caption" sx={{ color: '#6B7280' }}>{exam.durationMinutes} mins</Typography></Box>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', pt: 1 }}>
                            <Typography variant="caption" sx={{ color: '#6B7280' }}>{exam.examType || 'Exam'}</Typography>
                            <Button size="small" variant="contained" sx={{ background: `linear-gradient(135deg, ${greenPrimary} 0%, ${greenHover} 100%)`, '&:hover': { background: `linear-gradient(135deg, ${greenHover} 0%, #3D7B5F 100%)` } }}>View Details</Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })
              )}
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button variant="contained" startIcon={<Quiz />} onClick={() => navigate('/teacher-dashboard/exams/new')} sx={{ background: `linear-gradient(135deg, ${greenPrimary} 0%, ${greenHover} 100%)`, '&:hover': { background: `linear-gradient(135deg, ${greenHover} 0%, #3D7B5F 100%)` }, px: 3, py: 1.5, fontWeight: 600, borderRadius: 2, boxShadow: '0 4px 14px rgba(111, 175, 143, 0.4)' }}>Create New Exam</Button>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default TeacherDashboard;
