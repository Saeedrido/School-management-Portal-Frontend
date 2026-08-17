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
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  People,
  School,
  Book,
  Quiz,
  Person,
  TrendingUp,
  ArrowForward,
  PersonAdd,
  Assignment,
  CalendarToday,
  School as SchoolIcon,
  SupervisedUserCircle,
  Comment,
  RateReview,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../services/api';
import { PageHeader, InfoCard } from '../../components/ui';

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

        const parentsCount = usersResponse.data?.success && usersResponse.data?.data?.items
          ? usersResponse.data.data.items.filter(u => u.roles?.some(r => r.name === 'Parent')).length
          : 0;

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
          totalParents: parentsCount,
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

  const greenPrimary = '#6FAF8F';
  const greenHover = '#4E8C70';

  const dashboardCards = [
    {
      title: 'Students',
      description: 'Manage student records and enrollments',
      icon: <People sx={{ fontSize: 28 }} />,
      route: '/admin-dashboard/students',
      value: stats.totalStudents,
      label: 'Total Students',
      color: greenPrimary,
    },
    {
      title: 'Teachers',
      description: 'Manage teacher accounts and assignments',
      icon: <School sx={{ fontSize: 28 }} />,
      route: '/admin-dashboard/users',
      value: stats.totalTeachers,
      label: 'Total Teachers',
      color: '#8B5CF6',
    },
    {
      title: 'Classes',
      description: 'Manage classes and sections',
      icon: <Book sx={{ fontSize: 28 }} />,
      route: '/admin-dashboard/classes',
      value: stats.totalClasses,
      label: 'Total Classes',
      color: '#F59E0B',
    },
    {
      title: 'Subjects',
      description: 'Manage subjects and curricula',
      icon: <TrendingUp sx={{ fontSize: 28 }} />,
      route: '/admin-dashboard/subjects',
      value: stats.totalSubjects,
      label: 'Total Subjects',
      color: '#EC4899',
    },
    {
      title: 'Exams',
      description: 'Manage exams and assessments',
      icon: <Quiz sx={{ fontSize: 28 }} />,
      route: '/admin-dashboard/exams',
      value: stats.activeExams,
      label: 'Active Exams',
      color: '#06B6D4',
    },
    {
      title: 'Parents',
      description: 'Manage parent/guardian info',
      icon: <Person sx={{ fontSize: 28 }} />,
      route: '/admin-dashboard/parents',
      value: stats.totalParents,
      label: 'Total Parents',
      color: '#84CC16',
    },
  ];

  const quickActions = [
    { label: 'Assign Teacher', icon: <SupervisedUserCircle />, path: '/admin-dashboard/teacher-assignments', color: '#8B5CF6' },
    { label: 'Add Student', icon: <People />, path: '/admin-dashboard/students/new', color: greenPrimary },
    { label: 'Create Exam', icon: <Assignment />, path: '/admin-dashboard/exams/new', color: '#F59E0B' },
    { label: 'Add Class', icon: <SchoolIcon />, path: '/admin-dashboard/classes/new', color: '#06B6D4' },
    { label: 'Teacher Remarks', icon: <RateReview />, path: '/admin-dashboard/teacher-remarks', color: '#10B981' },
    { label: 'Headmaster Comments', icon: <Comment />, path: '/admin-dashboard/headmaster-comments', color: '#F97316' },
  ];

  if (loading) {
    return (
      <Box>
        <PageHeader
          title="Dashboard"
          subtitle={`Welcome back, ${user?.name || 'Admin'}`}
        />
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: '#E8F2ED' }} />
                    <Box>
                      <Box sx={{ width: 80, height: 24, bgcolor: '#E8F2ED', borderRadius: 1, mb: 1 }} />
                      <Box sx={{ width: 60, height: 16, bgcolor: '#E8F2ED', borderRadius: 1 }} />
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
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'Admin'}`}
        subtitle="Here's what's happening with your school today"
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {dashboardCards.map((card, index) => (
          <Grid item xs={12} sm={6} lg={4} key={index}>
            <Card
              onClick={() => navigate(card.route)}
              sx={{
                background: '#FFFFFF',
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: '1px solid rgba(111, 175, 143, 0.08)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px rgba(111, 175, 143, 0.12)',
                  border: `1px solid ${card.color}30`,
                },
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#64748B',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontSize: '0.7rem',
                        mb: 1,
                      }}
                    >
                      {card.label}
                    </Typography>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 700,
                        color: '#1E293B',
                        fontSize: '1.75rem',
                        lineHeight: 1.2,
                        mb: 0.5,
                      }}
                    >
                      {card.value}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: '#64748B', fontSize: '0.75rem' }}
                    >
                      {card.description}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      background: `linear-gradient(135deg, ${card.color}15 0%, ${card.color}08 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: card.color,
                    }}
                  >
                    {card.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions & Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ borderRadius: 3, border: '1px solid rgba(111, 175, 143, 0.08)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ color: '#1E293B', fontWeight: 700, fontSize: '1.1rem' }}>
                  Quick Actions
                </Typography>
              </Box>
              <Grid container spacing={2}>
                {quickActions.map((action, index) => (
                  <Grid item xs={6} sm={3} key={index}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => navigate(action.path)}
                      sx={{
                        py: 2,
                        px: 1,
                        flexDirection: 'column',
                        gap: 1,
                        borderRadius: 2.5,
                        borderColor: `${action.color}30`,
                        color: action.color,
                        backgroundColor: `${action.color}05`,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: action.color,
                          backgroundColor: `${action.color}12`,
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      <Box sx={{ fontSize: 24 }}>{action.icon}</Box>
                      <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                        {action.label}
                      </Typography>
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={3.5}>
          <Card sx={{ borderRadius: 3, border: '1px solid rgba(111, 175, 143, 0.08)' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ color: '#1E293B', fontWeight: 700, fontSize: '1rem', mb: 1 }}>
                School Overview
              </Typography>
              
              <Box sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500 }}>
                    Students
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 600 }}>
                    {stats.totalStudents}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={stats.totalStudents > 0 ? 85 : 0}
                  sx={{
                    height: 5,
                    borderRadius: 2.5,
                    bgcolor: 'rgba(111, 175, 143, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 2.5,
                      background: 'linear-gradient(90deg, #6FAF8F 0%, #4E8C70 100%)',
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500 }}>
                    Teachers
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 600 }}>
                    {stats.totalTeachers}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={stats.totalTeachers > 0 ? 60 : 0}
                  sx={{
                    height: 5,
                    borderRadius: 2.5,
                    bgcolor: 'rgba(139, 92, 246, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 2.5,
                      background: 'linear-gradient(90deg, #8B5CF6 0%, #7C3AED 100%)',
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500 }}>
                    Classes
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 600 }}>
                    {stats.totalClasses}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={stats.totalClasses > 0 ? 45 : 0}
                  sx={{
                    height: 5,
                    borderRadius: 2.5,
                    bgcolor: 'rgba(245, 158, 11, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 2.5,
                      background: 'linear-gradient(90deg, #F59E0B 0%, #D97706 100%)',
                    },
                  }}
                />
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500 }}>
                    Active Exams
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 600 }}>
                    {stats.activeExams}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={stats.activeExams > 0 ? 30 : 0}
                  sx={{
                    height: 5,
                    borderRadius: 2.5,
                    bgcolor: 'rgba(6, 182, 212, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 2.5,
                      background: 'linear-gradient(90deg, #06B6D4 0%, #0891B2 100%)',
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
