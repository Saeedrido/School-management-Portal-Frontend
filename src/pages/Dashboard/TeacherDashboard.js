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
  CircularProgress,
} from '@mui/material';
import {
  Person,
  School,
  Book,
  Assignment,
  Quiz,
  People,
  ArrowForward,
  TrendingUp,
  CalendarToday,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { teacherAPI } from '../../services/api';
import { PageHeader, InfoCard } from '../../components/ui';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [myAssignments, setMyAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [totalStudentCount, setTotalStudentCount] = useState(0);

  const basePath = '/teacher-dashboard';

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

  const stats = {
    totalStudents: totalStudentCount,
    totalClasses: myAssignments.length,
    totalSubjects: [...new Set(myAssignments.map(a => a.subjectId || a.subject?.id))].length,
    upcomingExams: exams.filter(e => new Date(e.startTime) > new Date()).length,
  };

  if (loading) {
    return (
      <Box>
        <PageHeader title="Teacher Dashboard" subtitle="Welcome back" />
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: '#E8F2ED' }} />
                    <Box>
                      <Box sx={{ width: 60, height: 24, bgcolor: '#E8F2ED', borderRadius: 1, mb: 1 }} />
                      <Box sx={{ width: 40, height: 16, bgcolor: '#E8F2ED', borderRadius: 1 }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'Teacher'}`}
        subtitle="Here's your teaching overview for today"
      />

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <Card
            onClick={() => navigate(`${basePath}/students`)}
            sx={{
              borderRadius: 3,
              cursor: 'pointer',
              border: '1px solid rgba(111, 175, 143, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 32px rgba(111, 175, 143, 0.15)' },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500, mb: 0.5 }}>Total Students</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#1E293B' }}>{stats.totalStudents}</Typography>
                </Box>
                <Box sx={{ width: 56, height: 56, borderRadius: 3, background: 'linear-gradient(135deg, #6FAF8F15 0%, #6FAF8F08 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6FAF8F' }}>
                  <People sx={{ fontSize: 28 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card
            onClick={() => navigate(`${basePath}/classes`)}
            sx={{
              borderRadius: 3,
              cursor: 'pointer',
              border: '1px solid rgba(111, 175, 143, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 32px rgba(111, 175, 143, 0.15)' },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500, mb: 0.5 }}>My Classes</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#1E293B' }}>{stats.totalClasses}</Typography>
                </Box>
                <Box sx={{ width: 56, height: 56, borderRadius: 3, background: 'linear-gradient(135deg, #8B5CF615 0%, #8B5CF608 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B5CF6' }}>
                  <School sx={{ fontSize: 28 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card
            onClick={() => navigate(`${basePath}/subjects`)}
            sx={{
              borderRadius: 3,
              cursor: 'pointer',
              border: '1px solid rgba(111, 175, 143, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 32px rgba(111, 175, 143, 0.15)' },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500, mb: 0.5 }}>Subjects</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#1E293B' }}>{stats.totalSubjects}</Typography>
                </Box>
                <Box sx={{ width: 56, height: 56, borderRadius: 3, background: 'linear-gradient(135deg, #F59E0B15 0%, #F59E0B08 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B' }}>
                  <Book sx={{ fontSize: 28 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card
            onClick={() => navigate(`${basePath}/exams`)}
            sx={{
              borderRadius: 3,
              cursor: 'pointer',
              border: '1px solid rgba(111, 175, 143, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 32px rgba(111, 175, 143, 0.15)' },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500, mb: 0.5 }}>Exams</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#1E293B' }}>{exams.length}</Typography>
                </Box>
                <Box sx={{ width: 56, height: 56, borderRadius: 3, background: 'linear-gradient(135deg, #06B6D415 0%, #06B6D408 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06B6D4' }}>
                  <Quiz sx={{ fontSize: 28 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ borderRadius: 3, border: '1px solid rgba(111, 175, 143, 0.1)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E293B' }}>My Classes</Typography>
                <Button size="small" endIcon={<ArrowForward />} onClick={() => navigate(`${basePath}/classes`)}>
                  View All
                </Button>
              </Box>
              
              {myAssignments.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <School sx={{ fontSize: 48, color: '#94A3B8', mb: 2 }} />
                  <Typography variant="body1" sx={{ color: '#64748B' }}>No classes assigned yet</Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#F8FAF9' }}>
                        <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase' }}>Class</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase' }}>Subject</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase' }}>Students</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {myAssignments.slice(0, 5).map((assignment) => (
                        <TableRow key={assignment.id} sx={{ '&:hover': { bgcolor: 'rgba(111, 175, 143, 0.03)' } }}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar sx={{ bgcolor: '#6FAF8F', width: 36, height: 36 }}>
                                <School sx={{ fontSize: 18 }} />
                              </Avatar>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {assignment.class?.displayName || assignment.class?.name || 'N/A'}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={assignment.subject?.name || 'N/A'}
                              size="small"
                              sx={{ bgcolor: '#F1F5F9', color: '#475569' }}
                            />
                          </TableCell>
                          <TableCell sx={{ color: '#64748B' }}>-</TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`${basePath}/classes/${assignment.classId}/students`)}
                              sx={{ color: '#6FAF8F' }}
                            >
                              <People sx={{ fontSize: 18 }} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 3, border: '1px solid rgba(111, 175, 143, 0.1)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E293B', mb: 3 }}>
                Quick Actions
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<Assignment />}
                  onClick={() => navigate(`${basePath}/exams/new`)}
                  sx={{
                    py: 1.5,
                    justifyContent: 'flex-start',
                    background: 'linear-gradient(135deg, #6FAF8F 0%, #4E8C70 100%)',
                    borderRadius: 2.5,
                  }}
                >
                  Create Exam
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<People />}
                  onClick={() => navigate(`${basePath}/students`)}
                  sx={{
                    py: 1.5,
                    justifyContent: 'flex-start',
                    borderColor: '#6FAF8F',
                    color: '#4E8C70',
                    borderRadius: 2.5,
                  }}
                >
                  View Students
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<TrendingUp />}
                  onClick={() => navigate(`${basePath}/results`)}
                  sx={{
                    py: 1.5,
                    justifyContent: 'flex-start',
                    borderColor: '#6FAF8F',
                    color: '#4E8C70',
                    borderRadius: 2.5,
                  }}
                >
                  Upload Results
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TeacherDashboard;
