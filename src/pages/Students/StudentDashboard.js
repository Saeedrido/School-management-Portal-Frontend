import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  School,
  Schedule,
  Quiz,
  CheckCircle,
  Warning,
  Timer,
  Assignment,
  Gavel,
  Logout,
  ArrowForward,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { studentAPI } from '../../services/api';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
    navigate('/student-login');
  };

  useEffect(() => {
    fetchAvailableExams();
  }, []);

  const fetchAvailableExams = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔄 Fetching available exams...');
      const response = await studentAPI.myExams.getAvailable();
      console.log('📨 Exams response:', response.data);
      
      if (response.data?.success && response.data?.data) {
        setExams(response.data.data);
      } else {
        // Show the specific error message from backend
        const errorMsg = response.data?.message || 'No exams available at this time';
        setError(errorMsg);
        setExams([]);
      }
    } catch (err) {
      console.error('Error fetching exams:', err);
      console.error('Error response:', err.response?.data);
      
      // Handle specific backend error messages (case-insensitive)
      const errorMessage = err.response?.data?.message || '';
      const lowerErrorMessage = errorMessage.toLowerCase();
      
      if (lowerErrorMessage.includes('profile not found')) {
        setError('Your student profile is not set up. Please contact your administrator.');
      } else if (lowerErrorMessage.includes('not assigned to any class')) {
        setError('You are not assigned to any class. Please contact your administrator.');
      } else if (errorMessage) {
        setError(errorMessage);
      } else {
        setError('Failed to load exams. Please try again later.');
      }
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTakeExam = (examId) => {
    navigate(`/student/exam/${examId}`);
  };

  const examRules = [
    {
      icon: <Timer />,
      title: 'Exam Duration',
      description: 'Once exam duration ends, it auto-submits. The timer cannot be paused or reset.',
    },
    {
      icon: <CheckCircle />,
      title: 'No Retakes',
      description: 'Student cannot retake the exam once submitted unless explicitly allowed by the administrator.',
    },
    {
      icon: <Warning />,
      title: 'Page Refresh',
      description: 'Do not refresh the page during the exam. Refreshing may result in loss of answers.',
    },
    {
      icon: <School />,
      title: 'Browser Tab',
      description: 'Do not close the browser tab during the exam. Closing the tab will terminate the exam session.',
    },
    {
      icon: <Schedule />,
      title: 'Fixed Duration',
      description: 'Each exam has a fixed duration. Plan your time accordingly to answer all questions.',
    },
    {
      icon: <Assignment />,
      title: 'Immediate Recording',
      description: 'Attempt is recorded immediately after submission. No changes can be made after submission.',
    },
    {
      icon: <Gavel />,
      title: 'Academic Integrity',
      description: 'Malpractice may disqualify student from the exam. Follow all exam regulations strictly.',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Paper
        sx={{
          mb: 4,
          p: 3,
          background: 'linear-gradient(135deg, #6FAF8F 0%, #4E8C70 100%)',
          color: 'white',
          borderRadius: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <School sx={{ fontSize: 48 }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Welcome, {user?.name || 'Student'}!
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Student Dashboard - Exam Portal
              </Typography>
            </Box>
          </Box>
          
          {/* User Menu */}
          <Box>
            <IconButton
              onClick={handleMenuOpen}
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                p: 1
              }}
            >
              <Avatar sx={{ bgcolor: '#fff', color: '#6FAF8F', width: 40, height: 40 }}>
                {user?.name?.charAt(0)?.toUpperCase() || 'S'}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{
                sx: { mt: 1, minWidth: 150 }
              }}
            >
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </Paper>

      {/* Exam Rules Section */}
      <Paper sx={{ mb: 4, p: 4, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Quiz sx={{ fontSize: 32, color: '#6FAF8F' }} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#6FAF8F' }}>
            📌 Exam Rules & Regulations
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={2}>
          {examRules.map((rule, index) => (
            <Grid size={{ xs: 12, md: 6 }} key={index}>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: '#F5F7F6',
                    height: '100%',
                  }}
                >
                  <Box sx={{ color: '#6FAF8F', mt: 0.5 }}>
                  {rule.icon}
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {rule.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {rule.description}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Active Exams Section */}
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <CheckCircle sx={{ fontSize: 32, color: '#6FAF8F' }} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#6FAF8F' }}>
            📝 Available Exams
          </Typography>
          {exams.length > 0 && (
            <Chip 
              label={`${exams.length} exam${exams.length > 1 ? 's' : ''} available`} 
              color="success" 
              size="small" 
            />
          )}
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : exams.length === 0 ? (
          <Box 
            sx={{ 
              textAlign: 'center', 
              py: 8,
              bgcolor: '#F5F7F6',
              borderRadius: 2,
            }}
          >
            <Quiz sx={{ fontSize: 64, color: '#9e9e9e', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Exams Available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              There are no active exams at the moment. Please check back later.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {exams.map((exam) => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={exam.id}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, flex: 1, mr: 1 }}>
                        {exam.title}
                      </Typography>
                      <Chip 
                        icon={<CheckCircle />} 
                        label="Active" 
                        color="success" 
                        size="small" 
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {exam.classSubject?.subject?.name || exam.subjectName || 'Subject'}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                      <Chip 
                        icon={<Timer />} 
                        label={`${exam.durationMinutes} min`} 
                        variant="outlined" 
                        size="small" 
                      />
                      <Chip 
                        icon={<Assignment />} 
                        label={`${exam.totalMarks} marks`} 
                        variant="outlined" 
                        size="small" 
                      />
                    </Box>
                    
                    {exam.instructions && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
                        {exam.instructions.length > 100 
                          ? `${exam.instructions.substring(0, 100)}...` 
                          : exam.instructions}
                      </Typography>
                    )}
                    
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => handleTakeExam(exam.id)}
                    sx={{
                      mt: 'auto',
                      py: 1.5,
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #6FAF8F 0%, #4E8C70 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #4E8C70 0%, #3D7B5F 100%)',
                      },
                    }}
                  >
                      👉 Take Exam
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Container>
  );
};

export default StudentDashboard;
