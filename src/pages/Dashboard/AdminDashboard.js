import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  People,
  School,
  Book,
  Quiz,
  Person,
  TrendingUp,
  ArrowForward,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../services/api';

const AdminDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalSubjects: 0,
    totalParents: 0,
    activeExams: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        const classesResponse = await adminAPI.classes.getAll();
        const classesCount = classesResponse.data?.success ? classesResponse.data.data.length : 0;

        const subjectsResponse = await adminAPI.subjects.getAll();
        const subjectsCount = subjectsResponse.data?.success ? subjectsResponse.data.data.length : 0;

        const studentsResponse = await adminAPI.students.getPaged(1, 1);

        const usersResponse = await adminAPI.users.getAll(1, 100);
        const teachersCount = usersResponse.data?.success && usersResponse.data?.data?.items
          ? usersResponse.data.data.items.filter(u => u.roles?.some(r => r.name === 'Teacher')).length
          : 0;

        // Fetch exams for each class to count active exams
        let activeExamsCount = 0;
        const classesData = classesResponse.data?.data || [];
        
        for (const cls of classesData) {
          try {
            const examResponse = await adminAPI.exams.getByClass(cls.id, 1, 100);
            if (examResponse.data?.success) {
              const examsData = examResponse.data.data?.items || examResponse.data.data || [];
              activeExamsCount += examsData.filter(exam => exam.isActive === true).length;
            }
          } catch (examErr) {
            console.warn(`Failed to fetch exams for class ${cls.id}:`, examErr);
          }
        }

        setStats({
          totalStudents: studentsResponse.data?.data?.totalCount || studentsResponse.data?.data?.items?.length || 0,
          totalTeachers: teachersCount,
          totalClasses: classesCount,
          totalSubjects: subjectsCount,
          totalParents: 0,
          activeExams: activeExamsCount,
        });
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Green theme colors
  const greenPrimary = '#6FAF8F';
  const greenHover = '#4E8C70';

  const dashboardCards = [
    {
      title: 'Students',
      description: 'Manage student records',
      icon: <People sx={{ fontSize: { xs: 28, sm: 32 } }} />,
      route: '/admin-dashboard/students',
      value: stats.totalStudents,
      label: 'Total Students',
      color: greenPrimary,
    },
    {
      title: 'Teachers',
      description: 'Manage teacher accounts',
      icon: <School sx={{ fontSize: { xs: 28, sm: 32 } }} />,
      route: '/admin-dashboard/users',
      value: stats.totalTeachers,
      label: 'Total Teachers',
      color: greenPrimary,
    },
    {
      title: 'Classes',
      description: 'Manage classes and sections',
      icon: <Book sx={{ fontSize: { xs: 28, sm: 32 } }} />,
      route: '/admin-dashboard/classes',
      value: stats.totalClasses,
      label: 'Total Classes',
      color: greenPrimary,
    },
    {
      title: 'Subjects',
      description: 'Manage subjects',
      icon: <TrendingUp sx={{ fontSize: { xs: 28, sm: 32 } }} />,
      route: '/admin-dashboard/subjects',
      value: stats.totalSubjects,
      label: 'Total Subjects',
      color: greenPrimary,
    },
    {
      title: 'Exams',
      description: 'Manage exams and assessments',
      icon: <Quiz sx={{ fontSize: { xs: 28, sm: 32 } }} />,
      route: '/admin-dashboard/exams',
      value: stats.activeExams,
      label: 'Active Exams',
      color: greenPrimary,
    },
    {
      title: 'Parents',
      description: 'Manage parent/guardian info',
      icon: <Person sx={{ fontSize: { xs: 28, sm: 32 } }} />,
      route: '/admin-dashboard/parents',
      value: stats.totalParents,
      label: 'Total Parents',
      color: greenPrimary,
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 0 }}>
      {/* Welcome Header */}
      <Card
        sx={{
          mb: { xs: 2, sm: 3 },
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: { xs: 2, sm: 3 },
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, sm: 3 }, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Box
              sx={{
                width: { xs: 50, sm: 60, md: 70 },
                height: { xs: 50, sm: 60, md: 70 },
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${greenPrimary} 0%, ${greenHover} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <School sx={{ fontSize: { xs: 24, sm: 32, md: 40 }, color: 'white' }} />
            </Box>
            <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: '#1F2937',
                  mb: 0.5,
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' },
                }}
              >
                Welcome back, {user?.name || 'Admin'}!
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: '#6B7280', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
              >
                {user?.email} • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 }, flexDirection: { xs: 'column', sm: 'row' }, width: { xs: '100%', sm: 'auto' } }}>
              <Button
                variant="contained"
                onClick={() => navigate('/admin-dashboard/teacher-assignments')}
                sx={{
                  background: `linear-gradient(135deg, ${greenPrimary} 0%, ${greenHover} 100%)`,
                  '&:hover': { background: `linear-gradient(135deg, ${greenHover} 0%, #3D7B5F 100%)` },
                  px: { xs: 2, sm: 3 },
                  py: { xs: 1, sm: 1.5 },
                  fontWeight: 600,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  boxShadow: '0 4px 14px rgba(111, 175, 143, 0.4)',
                }}
              >
                Assign Teachers
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/admin-dashboard/users/new')}
                sx={{
                  background: `linear-gradient(135deg, ${greenPrimary} 0%, ${greenHover} 100%)`,
                  '&:hover': { background: `linear-gradient(135deg, ${greenHover} 0%, #3D7B5F 100%)` },
                  px: { xs: 2, sm: 3 },
                  py: { xs: 1, sm: 1.5 },
                  fontWeight: 600,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  boxShadow: '0 4px 14px rgba(111, 175, 143, 0.4)',
                }}
              >
                Add Teacher
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Quick Stats */}
      <Grid container spacing={{ xs: 2, sm: 2, md: 2 }}>
        {dashboardCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: { xs: 2, sm: 3 },
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  border: `1px solid ${greenPrimary}`,
                  boxShadow: `0 8px 24px rgba(111, 175, 143, 0.2)`,
                  transform: 'translateY(-4px)',
                },
              }}
              onClick={() => navigate(card.route)}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, sm: 3 } }}>
                  <Box
                    sx={{
                      width: { xs: 50, sm: 60 },
                      height: { xs: 50, sm: 60 },
                      borderRadius: { xs: 2, sm: 3 },
                      background: `${greenPrimary}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: greenPrimary,
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1F2937', mb: 0.5, fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
                      {card.value}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6B7280', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                      {card.label}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ mt: { xs: 1.5, sm: 2 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1" sx={{ color: '#1F2937', fontWeight: 500, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                    {card.title}
                  </Typography>
                  <ArrowForward sx={{ color: greenPrimary }} />
                </Box>
                <Typography variant="caption" sx={{ color: '#6B7280', mt: 0.5, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                  {card.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Card
        sx={{
          mt: { xs: 2, sm: 3 },
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: { xs: 2, sm: 3 },
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" sx={{ color: '#1F2937', fontWeight: 600, mb: { xs: 1.5, sm: 2 }, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
            Quick Actions
          </Typography>
          <Grid container spacing={{ xs: 1.5, sm: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<School />}
                onClick={() => navigate('/admin-dashboard/users/new')}
                sx={{
                  color: greenPrimary,
                  borderColor: greenPrimary,
                  '&:hover': {
                    borderColor: greenHover,
                    background: `${greenPrimary}10`,
                  },
                  py: { xs: 1, sm: 1.5 },
                }}
              >
                Create Teacher
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<People />}
                onClick={() => navigate('/admin-dashboard/students/new')}
                sx={{
                  color: greenPrimary,
                  borderColor: greenPrimary,
                  '&:hover': {
                    borderColor: greenHover,
                    background: `${greenPrimary}10`,
                  },
                  py: { xs: 1, sm: 1.5 },
                }}
              >
                Add Student
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Quiz />}
                onClick={() => navigate('/admin-dashboard/exams/new')}
                sx={{
                  color: greenPrimary,
                  borderColor: greenPrimary,
                  '&:hover': {
                    borderColor: greenHover,
                    background: `${greenPrimary}10`,
                  },
                  py: { xs: 1, sm: 1.5 },
                }}
              >
                Create Exam
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Book />}
                onClick={() => navigate('/admin-dashboard/subjects')}
                sx={{
                  color: greenPrimary,
                  borderColor: greenPrimary,
                  '&:hover': {
                    borderColor: greenHover,
                    background: `${greenPrimary}10`,
                  },
                  py: { xs: 1, sm: 1.5 },
                }}
              >
                View Subjects
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminDashboard;
