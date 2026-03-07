import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Grid,
  Card,
  useTheme,
  CircularProgress,
  Alert,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import {
  Add,
  Delete,
  Search,
  Quiz,
  PlayArrow,
  Stop,
  AssignmentTurnedIn,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { adminAPI, teacherAPI, studentAPI } from '../../services/api';
import { enumToExamType } from '../../utils/dataMapping';

const ExamList = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, hasRole } = useAuth();

  const basePath = user?.role === 'Admin'
    ? '/admin-dashboard'
    : user?.role === 'Teacher'
      ? '/teacher-dashboard'
      : '';

  const [exams, setExams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const classId = params.get('classId');
    if (classId) {
      setSelectedClassId(classId);
    }
  }, [location]);

  useEffect(() => {
    if (user?.role === 'Admin') {
      const fetchClasses = async () => {
        try {
          const response = await adminAPI.classes.getAll();
          if (response.data?.success && response.data?.data) {
            setClasses(response.data.data);
          }
        } catch (err) {
          console.error('Error fetching classes:', err);
        }
      };
      fetchClasses();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchExams();
    }
  }, [user, selectedClassId]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      setError('');

      if (user?.role === 'Teacher') {
        const response = await teacherAPI.exams.getMyExams(1, 100);
        if (response.data?.success) {
          if (response.data.data?.items) {
            setExams(response.data.data.items);
          } else if (Array.isArray(response.data.data)) {
            setExams(response.data.data);
          } else {
            setExams([]);
          }
        } else {
          setExams([]);
        }
      } else if (user?.role === 'Admin') {
        if (!selectedClassId) {
          setError('Please select a class to view exams');
          setExams([]);
        } else {
          const response = await adminAPI.exams.getByClass(selectedClassId, 1, 100);
          if (response.data?.success) {
            if (response.data.data?.items) {
              setExams(response.data.data.items);
            } else if (Array.isArray(response.data.data)) {
              setExams(response.data.data);
            } else {
              setExams([]);
            }
          } else {
            setExams([]);
          }
        }
      } else if (user?.role === 'Student') {
        const response = await studentAPI.myExams.getAvailable();
        if (response.data?.success && response.data?.data) {
          setExams(response.data.data);
        } else {
          setExams([]);
        }
      } else {
        setExams([]);
      }
    } catch (err) {
      console.error('Error fetching exams:', err);
      if (err.response?.status === 400) {
        setError('No exams available. Create one or select a class.');
      } else {
        setError(err.response?.data?.message || 'Failed to load exams');
      }
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (examId) => {
    if (!window.confirm('Are you sure you want to delete this exam?')) {
      return;
    }
    try {
      const response = await adminAPI.exams.delete(examId);
      if (response.data?.success) {
        setExams(exams.filter((e) => e.id !== examId));
      } else {
        setError(response.data?.message || 'Failed to delete exam');
      }
    } catch (err) {
      console.error('Error deleting exam:', err);
      setError(err.response?.data?.message || 'Failed to delete exam');
    }
  };

  const handleStartExam = async (examId) => {
    try {
      const response = await adminAPI.exams.start(examId);
      if (response.data?.success) {
        fetchExams();
      } else {
        setError(response.data?.message || 'Failed to start exam');
      }
    } catch (err) {
      console.error('Error starting exam:', err);
      setError(err.response?.data?.message || 'Failed to start exam');
    }
  };

  const handleEndExam = async (examId) => {
    try {
      const response = await adminAPI.exams.end(examId);
      if (response.data?.success) {
        fetchExams();
      } else {
        setError(response.data?.message || 'Failed to end exam');
      }
    } catch (err) {
      console.error('Error ending exam:', err);
      setError(err.response?.data?.message || 'Failed to end exam');
    }
  };

  const filteredExams = exams.filter((exam) =>
    exam.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.class?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.classSubject?.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getExamTypeColor = (type) => {
    switch (type) {
      case 'Theory': return '#2196F3';
      case 'Objective': return '#66BB6A';
      case 'Practical': return '#FFA726';
      case 'Final': return '#EF5350';
      default: return '#AB47BC';
    }
  };

  const getExamStatus = (exam) => {
    if (exam.isActive) return { label: 'In Progress', color: '#2E7D32', bgcolor: '#E8F5E9' };
    if (exam.actualEndTime) return { label: 'Ended', color: '#F57C00', bgcolor: '#FFF3E0' };
    return { label: 'Scheduled', color: '#1976D2', bgcolor: '#E3F2FD' };
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ mb: { xs: 3, md: 4 }, background: 'linear-gradient(135deg, #EF5350 0%, #FFA726 100%)', borderRadius: { xs: 2, sm: 3, md: 4 }, p: { xs: 2, sm: 3, md: 4 }, color: 'white', position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 2, sm: 0 } }}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>📝 Exams Management</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {user?.role === 'Teacher' ? 'Manage your class exams' : user?.role === 'Student' ? 'Active exams for your class' : 'Create and manage exams for students'}
            </Typography>
          </Box>
          {hasRole('Admin', 'Teacher') && (
            <Button variant="contained" startIcon={<Add />} onClick={() => navigate(`${basePath}/exams/new`)} sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}>
              Create Exam
            </Button>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3 }}>{error}</Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ p: 3, borderRadius: 4, background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)', color: 'white' }}>
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>Total Exams</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>{exams.length}</Typography>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ p: 3, borderRadius: 4, background: 'linear-gradient(135deg, #66BB6A 0%, #388E3C 100%)', color: 'white' }}>
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>Active Exams</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>{exams.filter((e) => e.isActive).length}</Typography>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ p: 3, borderRadius: 4, background: 'linear-gradient(135deg, #FFA726 0%, #F57C00 100%)', color: 'white' }}>
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>Scheduled</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>{exams.filter((e) => !e.isActive && !e.actualEndTime).length}</Typography>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ p: 3, borderRadius: 4, background: 'linear-gradient(135deg, #AB47BC 0%, #7B1FA2 100%)', color: 'white' }}>
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>Completed</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>{exams.filter((e) => e.actualEndTime).length}</Typography>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ mb: 3, p: 2, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
        {user?.role !== 'Student' && (
          <TextField
            fullWidth
            placeholder="Search exams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ color: '#FFA726' }} /></InputAdornment> }}
            sx={{ flexGrow: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        )}
        {user?.role === 'Admin' && (
          <FormControl sx={{ minWidth: 200, width: { xs: '100%', md: 'auto' } }}>
            <InputLabel>Select Class</InputLabel>
            <Select value={selectedClassId} label="Select Class" onChange={(e) => setSelectedClassId(e.target.value)} sx={{ borderRadius: 2 }}>
              <MenuItem value=""><em>None</em></MenuItem>
              {classes.map((cls) => (
                <MenuItem key={cls.id} value={cls.id}>{cls.displayName || cls.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: 'linear-gradient(90deg, #EF5350 0%, #FFA726 100%)' }}>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Exam</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Subject</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Class</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Type</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Date</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Duration</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} align="center" sx={{ py: 8 }}><CircularProgress /></TableCell></TableRow>
            ) : filteredExams.length === 0 ? (
              <TableRow><TableCell colSpan={8} align="center" sx={{ py: 8 }}><Typography>No exams found</Typography></TableCell></TableRow>
            ) : (
              filteredExams.map((exam) => {
                const status = getExamStatus(exam);
                return (
                  <TableRow key={exam.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: getExamTypeColor(enumToExamType(exam.examType)) }}><Quiz /></Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{exam.title}</Typography>
                          <Typography variant="caption">{exam.classSubject?.subject?.name || 'Unknown Subject'}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{exam.classSubject?.subject?.name || '-'}</TableCell>
                    <TableCell>{exam.class?.displayName || exam.class?.name || '-'}</TableCell>
                    <TableCell>
                      <Chip label={enumToExamType(exam.examType)} size="small" sx={{ bgcolor: getExamTypeColor(enumToExamType(exam.examType)) + '20', fontWeight: 600 }} />
                    </TableCell>
                    <TableCell>{new Date(exam.examDate).toLocaleDateString()}</TableCell>
                    <TableCell>{exam.durationMinutes} min</TableCell>
                    <TableCell><Chip label={status.label} size="small" sx={{ bgcolor: status.bgcolor, color: status.color, fontWeight: 600 }} /></TableCell>
                    <TableCell align="right">
                      {user?.role === 'Student' && exam.isActive && (
                        <Button variant="contained" startIcon={<PlayArrow />} onClick={() => navigate(`/student/exam/${exam.id}`)} sx={{ bgcolor: '#4CAF50', '&:hover': { bgcolor: '#45a049' } }}>
                          Take Exam
                        </Button>
                      )}
                      {hasRole('Admin', 'Teacher') && (
                        <>
                          {hasRole('Admin') && !exam.isActive && !exam.actualEndTime && (
                            <IconButton size="small" onClick={() => handleStartExam(exam.id)} sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', mr: 1 }} title="Start Exam">
                              <PlayArrow fontSize="small" />
                            </IconButton>
                          )}
                          {hasRole('Admin') && exam.isActive && (
                            <IconButton size="small" onClick={() => handleEndExam(exam.id)} sx={{ bgcolor: '#FFEBEE', color: '#C62828', mr: 1 }} title="End Exam">
                              <Stop fontSize="small" />
                            </IconButton>
                          )}
                          <IconButton size="small" onClick={() => navigate(`${basePath}/exams/${exam.id}/questions`)} sx={{ bgcolor: '#E3F2FD', color: '#2196F3', mr: 1 }} title="Manage Questions">
                            <Quiz fontSize="small" />
                          </IconButton>
                          {(enumToExamType(exam.examType) === 'Objective+Theory' || enumToExamType(exam.examType) === 'Theory') && (
                            <IconButton size="small" onClick={() => navigate(`${basePath}/exams/${exam.id}/grade`)} sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', mr: 1 }} title="Grade Theory">
                              <AssignmentTurnedIn fontSize="small" />
                            </IconButton>
                          )}
                          <IconButton size="small" onClick={() => handleDelete(exam.id)} disabled={!hasRole('Admin') || exam.isActive} sx={{ bgcolor: '#FFEBEE', color: '#EF5350' }} title="Delete Exam">
                            <Delete fontSize="small" />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default ExamList;
