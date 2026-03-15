import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
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
  CardContent,
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
  Schedule,
  CheckCircle,
  Pending,
  Edit,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { adminAPI, teacherAPI, studentAPI } from '../../services/api';
import { enumToExamType } from '../../utils/dataMapping';
import { PageHeader, StatusBadge } from '../../components/ui';
import ConfirmDialog from '../../components/ConfirmDialog';

const ExamList = () => {
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

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteExamId, setDeleteExamId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const classId = params.get('classId');
    if (classId) {
      setSelectedClassId(classId);
    }
  }, [location]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        if (user?.role === 'Admin') {
          const response = await adminAPI.classes.getAll();
          if (response.data?.success && response.data?.data) {
            setClasses(response.data.data);
          }
        } else if (user?.role === 'Teacher') {
          // Fetch teacher's assigned classes
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
            setClasses(uniqueClasses);
            // Auto-select first class if only one
            if (uniqueClasses.length === 1) {
              setSelectedClassId(uniqueClasses[0].id);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching classes:', err);
      }
    };

    fetchClasses();
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
        try {
          // First get teacher's assigned classes
          const assignmentsRes = await teacherAPI.myAssignments.getAll(1, 100);
          if (assignmentsRes.data?.success && assignmentsRes.data?.data?.items) {
            const assignments = assignmentsRes.data.data.items;
            
            // Get unique class IDs
            const classIds = [...new Set(assignments.map(a => a.classId))];
            
            // Fetch ONLY exams created by this teacher (filter by teacherId)
            const allExams = [];
            for (const classId of classIds) {
              try {
                // Filter by teacherId so teacher only sees their own exams
                const examRes = await adminAPI.exams.getByClass(classId, 1, 100, user?.id);
                if (examRes.data?.success) {
                  const examData = examRes.data.data?.items || examRes.data.data || [];
                  // Add class info and ownership to each exam
                  const classAssignment = assignments.find(a => a.classId === classId);
                  
                  const examsWithClass = examData.map(exam => {
                    const isOwner = exam.createdBy?.toLowerCase() === user?.id?.toLowerCase();
                    return {
                      ...exam,
                      isOwner: isOwner,
                      class: { 
                        id: classId, 
                        name: classAssignment?.class?.name || '', 
                        displayName: classAssignment?.class?.displayName || '' 
                      }
                    };
                  });
                  allExams.push(...examsWithClass);
                }
              } catch (e) {
                console.warn(`Failed to fetch exams for class ${classId}:`, e);
              }
            }
            
            // Filter by selected class if one is selected
            const filteredExams = selectedClassId 
              ? allExams.filter(e => e.class?.id === selectedClassId)
              : allExams;
              
            setExams(filteredExams);
          } else {
            setExams([]);
          }
        } catch (err) {
          console.error('Error fetching teacher exams:', err);
          setExams([]);
        }
      } else if (user?.role === 'Admin') {
        if (!selectedClassId) {
          setError('Please select a class to view exams');
          setExams([]);
        } else {
          const response = await adminAPI.exams.getByClass(selectedClassId, 1, 100);
          if (response.data?.success) {
            const examData = response.data.data?.items || response.data.data || [];
            // Admin can do everything, mark all as owner
            const examsWithOwner = examData.map(exam => ({
              ...exam,
              isOwner: true
            }));
            if (response.data.data?.items) {
              setExams(examsWithOwner);
            } else if (Array.isArray(response.data.data)) {
              setExams(examsWithOwner);
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

  const handleDeleteClick = (examId) => {
    setDeleteExamId(examId);
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setConfirmOpen(false);
    if (!deleteExamId) return;
    try {
      const response = await adminAPI.exams.delete(deleteExamId);
      if (response.data?.success) {
        setExams(exams.filter((e) => e.id !== deleteExamId));
      } else {
        setError(response.data?.message || 'Failed to delete exam');
      }
    } catch (err) {
      console.error('Error deleting exam:', err);
      setError(err.response?.data?.message || 'Failed to delete exam');
    }
    setDeleteExamId(null);
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

  const filteredExams = exams.filter((exam) => {
    const matches = exam.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.class?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.classSubject?.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matches;
  });

  const getExamTypeColor = (type) => {
    switch (type) {
      case 'Theory': return { bg: '#DBEAFE', color: '#1E40AF' };
      case 'Objective': return { bg: '#DCFCE7', color: '#166534' };
      case 'Practical': return { bg: '#FEF3C7', color: '#92400E' };
      case 'Final': return { bg: '#FEE2E2', color: '#991B1B' };
      default: return { bg: '#F3E8FF', color: '#7C3AED' };
    }
  };

  const getExamStatus = (exam) => {
    if (exam.isActive) return { label: 'In Progress', color: '#166534', bg: '#DCFCE7' };
    if (exam.actualEndTime) return { label: 'Completed', color: '#92400E', bg: '#FEF3C7' };
    return { label: 'Scheduled', color: '#1E40AF', bg: '#DBEAFE' };
  };

  const activeExams = exams.filter((e) => e.isActive).length;
  const scheduledExams = exams.filter((e) => !e.isActive && !e.actualEndTime).length;
  const completedExams = exams.filter((e) => e.actualEndTime).length;

  return (
    <Box>
      <PageHeader
        title="Exams Management"
        subtitle={user?.role === 'Teacher' ? 'Manage your class exams' : user?.role === 'Student' ? 'Active exams for your class' : 'Create and manage exams for students'}
        actionText={hasRole(['Admin', 'Teacher']) ? 'Create Exam' : undefined}
        onAction={hasRole(['Admin', 'Teacher']) ? () => navigate(`${basePath}/exams/new`) : undefined}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid rgba(111, 175, 143, 0.1)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500, mb: 0.5 }}>Total Exams</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1E293B' }}>{exams.length}</Typography>
                </Box>
                <Box sx={{ width: 48, height: 48, borderRadius: 2.5, background: 'linear-gradient(135deg, #6FAF8F15 0%, #6FAF8F08 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6FAF8F' }}>
                  <Quiz sx={{ fontSize: 24 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid rgba(111, 175, 143, 0.1)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500, mb: 0.5 }}>Active</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#10B981' }}>{activeExams}</Typography>
                </Box>
                <Box sx={{ width: 48, height: 48, borderRadius: 2.5, background: 'linear-gradient(135deg, #10B98115 0%, #10B98108 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
                  <PlayArrow sx={{ fontSize: 24 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid rgba(111, 175, 143, 0.1)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500, mb: 0.5 }}>Scheduled</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#F59E0B' }}>{scheduledExams}</Typography>
                </Box>
                <Box sx={{ width: 48, height: 48, borderRadius: 2.5, background: 'linear-gradient(135deg, #F59E0B15 0%, #F59E0B08 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B' }}>
                  <Schedule sx={{ fontSize: 24 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid rgba(111, 175, 143, 0.1)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500, mb: 0.5 }}>Completed</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#8B5CF6' }}>{completedExams}</Typography>
                </Box>
                <Box sx={{ width: 48, height: 48, borderRadius: 2.5, background: 'linear-gradient(135deg, #8B5CF615 0%, #8B5CF608 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B5CF6' }}>
                  <CheckCircle sx={{ fontSize: 24 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ borderRadius: 3, border: '1px solid rgba(111, 175, 143, 0.1)', mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            {user?.role !== 'Student' && (
              <TextField
                placeholder="Search exams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{
                  flex: 1,
                  minWidth: 250,
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
            )}
            {user?.role === 'Admin' && (
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Select Class</InputLabel>
                <Select
                  value={selectedClassId}
                  label="Select Class"
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  sx={{ borderRadius: 2.5, backgroundColor: '#F8FAF9' }}
                >
                  <MenuItem value=""><em>Select a class</em></MenuItem>
                  {classes.map((cls) => (
                    <MenuItem key={cls.id} value={cls.id}>{cls.displayName || cls.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            {user?.role === 'Teacher' && classes.length > 0 && (
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Select Class</InputLabel>
                <Select
                  value={selectedClassId}
                  label="Select Class"
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  sx={{ borderRadius: 2.5, backgroundColor: '#F8FAF9' }}
                >
                  <MenuItem value=""><em>All My Classes</em></MenuItem>
                  {classes.map((cls) => (
                    <MenuItem key={cls.id} value={cls.id}>{cls.displayName || cls.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Exam Table */}
      <Card sx={{ borderRadius: 3, border: '1px solid rgba(111, 175, 143, 0.1)', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F8FAF9' }}>
                <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>Exam</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>Subject</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>Class</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>Duration</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredExams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Quiz sx={{ fontSize: 48, color: '#94A3B8', mb: 2 }} />
                      <Typography variant="body1" sx={{ color: '#64748B', fontWeight: 500 }}>
                        No exams found
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredExams.map((exam) => {
                  const status = getExamStatus(exam);
                  const examType = enumToExamType(exam.examType);
                  const typeColors = getExamTypeColor(examType);
                  
                  return (
                    <TableRow
                      key={exam.id}
                      sx={{
                        borderBottom: '1px solid rgba(111, 175, 143, 0.08)',
                        '&:hover': { backgroundColor: 'rgba(111, 175, 143, 0.03)' },
                        transition: 'background-color 0.2s ease',
                      }}
                    >
                      <TableCell sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: typeColors.bg, color: typeColors.color }}>
                            <Quiz sx={{ fontSize: 20 }} />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500, color: '#1E293B' }}>
                              {exam.title}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B' }}>
                              {exam.classSubject?.subject?.name || 'Unknown Subject'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: '#64748B' }}>
                        {exam.classSubject?.subject?.name || '-'}
                      </TableCell>
                      <TableCell sx={{ color: '#64748B' }}>
                        {exam.class?.displayName || exam.class?.name || '-'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={examType}
                          size="small"
                          sx={{
                            bgcolor: typeColors.bg,
                            color: typeColors.color,
                            fontWeight: 500,
                            fontSize: '0.7rem',
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#64748B' }}>
                        {exam.examDate ? new Date(exam.examDate).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell sx={{ color: '#64748B' }}>
                        {exam.durationMinutes ? `${exam.durationMinutes} min` : '-'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={status.label}
                          size="small"
                          sx={{
                            bgcolor: status.bg,
                            color: status.color,
                            fontWeight: 500,
                            fontSize: '0.7rem',
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        {user?.role === 'Student' && exam.isActive && (
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<PlayArrow />}
                            onClick={() => navigate(`/student/exam/${exam.id}`)}
                            sx={{
                              bgcolor: '#10B981',
                              borderRadius: 2,
                              '&:hover': { bgcolor: '#059669' },
                            }}
                          >
                            Take Exam
                          </Button>
                        )}
                        {hasRole(['Admin', 'Teacher']) && (
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                            {/* Grade - show for Admin OR Teacher (any exam they can see) */}
                            <IconButton
                              size="small"
                              onClick={() => navigate(`${basePath}/exams/${exam.id}/grade`)}
                              sx={{ color: '#10B981', '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.1)' } }}
                              title="Grade"
                            >
                              <AssignmentTurnedIn fontSize="small" />
                            </IconButton>
                            {/* Edit - show for Admin OR Teacher who owns the exam AND exam not started */}
                            {(hasRole('Admin') || (exam.isOwner && !exam.isActive && !exam.actualEndTime)) && (
                              <IconButton
                                size="small"
                                onClick={() => navigate(`${basePath}/exams/${exam.id}/edit`)}
                                sx={{ color: '#3B82F6', '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.1)' } }}
                                title="Edit"
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            )}
                            {/* Start/End - ONLY Admin can control exam start/end */}
                            {hasRole('Admin') && !exam.isActive && !exam.actualEndTime && (
                              <IconButton
                                size="small"
                                onClick={() => handleStartExam(exam.id)}
                                sx={{ color: '#10B981', '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.1)' } }}
                                title="Start Exam"
                              >
                                <PlayArrow fontSize="small" />
                              </IconButton>
                            )}
                            {hasRole('Admin') && exam.isActive && (
                              <IconButton
                                size="small"
                                onClick={() => handleEndExam(exam.id)}
                                sx={{ color: '#EF4444', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}
                                title="End Exam"
                              >
                                <Stop fontSize="small" />
                              </IconButton>
                            )}
                            {/* Questions - show for Admin OR Teacher who owns the exam AND exam not started */}
                            {(hasRole('Admin') || (exam.isOwner && !exam.isActive && !exam.actualEndTime)) && (
                              <IconButton
                                size="small"
                                onClick={() => navigate(`${basePath}/exams/${exam.id}/questions`)}
                                sx={{ color: '#6FAF8F', '&:hover': { bgcolor: 'rgba(111, 175, 143, 0.1)' } }}
                                title="Questions"
                              >
                                <Quiz fontSize="small" />
                              </IconButton>
                            )}
                            {/* Delete - Admin can always delete (if not active), Teacher only if owner and not active */}
                            {(hasRole('Admin') || (exam.isOwner && !exam.isActive)) && (
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteClick(exam.id)}
                                disabled={exam.isActive}
                                sx={{ color: '#EF4444', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}
                                title={exam.isOwner && !hasRole('Admin') ? "Cannot delete - exam has started" : "Delete"}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Exam"
        message="Are you sure you want to delete this exam? This action cannot be undone."
        confirmText="Delete"
      />
    </Box>
  );
};

export default ExamList;
