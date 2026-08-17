import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  useTheme,
} from '@mui/material';
import {
  AccessTime,
  School,
  Book,
  LocationOn,
  Event,
  Today,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { teacherAPI } from '../../services/api';

const TeacherSchedule = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [myAssignments, setMyAssignments] = useState([]);

  // Fetch teacher's class assignments (this is what we have in the backend)
  useEffect(() => {
    const fetchMyAssignments = async () => {
      try {
        setLoading(true);
        const response = await teacherAPI.myAssignments.getAll(1, 50);

        if (response.data?.success && response.data?.data?.items) {
          setMyAssignments(response.data.data.items);
        } else {
          setMyAssignments([]);
        }
      } catch (err) {
        console.error('Error fetching assignments:', err);
        setError('Failed to load your class assignments');
      } finally {
        setLoading(false);
      }
    };

    fetchMyAssignments();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
      {/* Header */}
      <Box
        sx={{
          mb: { xs: 3, md: 4 },
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(102, 187, 106, 0.8) 0%, rgba(33, 150, 243, 0.8) 100%)'
            : 'linear-gradient(135deg, #66BB6A 0%, #2196F3 100%)',
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
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
          }}
        />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}>
            📅 My Schedule
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            View your class assignments and teaching schedule
          </Typography>
        </Box>
      </Box>

      {/* Info Alert */}
      <Alert
        severity="info"
        sx={{ mb: 3 }}
        icon={<InfoIcon />}
      >
        <Typography variant="body2">
          <strong>Weekly Timetable Feature Coming Soon!</strong> The detailed weekly schedule with time slots and rooms will be available in a future update.
          For now, you can view your class assignments below.
        </Typography>
      </Alert>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} icon={<ErrorIcon />}>
          {error}
        </Alert>
      )}

      {/* My Class Assignments */}
      <Card
        sx={{
          background: 'rgba(17, 17, 17, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 600, mb: 3 }}>
            My Class Assignments
          </Typography>

          {myAssignments.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <School sx={{ fontSize: 60, color: 'rgba(255, 255, 255, 0.2)', mb: 2 }} />
              <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                No class assignments found
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                Please contact the administrator to get assigned to classes.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {myAssignments.map((assignment) => (
                <Grid item xs={12} sm={6} md={4} key={assignment.id}>
                  <Card
                    sx={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 3,
                      height: '100%',
                      '&:hover': {
                        border: '1px solid rgba(102, 187, 106, 0.3)',
                        boxShadow: '0 0 20px rgba(102, 187, 106, 0.2)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                        <Avatar sx={{ background: 'rgba(102, 187, 106, 0.2)', color: '#66BB6A' }}>
                          <School />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 600, mb: 0.5 }}>
                            {assignment.class?.name || `Class ${assignment.classId}`}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                            {assignment.subject?.name || `Subject ${assignment.subjectId}`}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                        <Chip
                          icon={<Book sx={{ fontSize: 16 }} />}
                          label={assignment.subject?.name || 'Subject'}
                          size="small"
                          sx={{
                            background: 'rgba(33, 150, 243, 0.2)',
                            color: '#2196F3',
                          }}
                        />
                        <Chip
                          icon={<Event sx={{ fontSize: 16 }} />}
                          label={assignment.term?.name || 'Current Term'}
                          size="small"
                          sx={{
                            background: 'rgba(255, 167, 38, 0.2)',
                            color: '#FFA726',
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default TeacherSchedule;
