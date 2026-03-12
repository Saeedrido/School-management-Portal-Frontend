import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  CheckCircle,
  Cancel,
  Visibility,
  AssignmentTurnedIn,
} from '@mui/icons-material';
import { adminAPI, teacherAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const GradeTheory = () => {
  const navigate = useNavigate();
  const { examId, studentId } = useParams();
  const { user, hasRole } = useAuth();

  const basePath = hasRole('Admin') ? '/admin-dashboard' : '/teacher-dashboard';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [student, setStudent] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [gradingDialogOpen, setGradingDialogOpen] = useState(false);
  const [exam, setExam] = useState(null);

  const [gradingForm, setGradingForm] = useState({
    theoryScore: '',
    teacherRemarks: '',
  });

  useEffect(() => {
    if (examId) {
      fetchExamAndAttempts();
    } else if (studentId) {
      fetchStudentAttempts();
    }
  }, [examId, studentId]);

  const fetchExamAndAttempts = async () => {
    try {
      setLoading(true);

      // Fetch exam details
      const examResponse = await teacherAPI.exams.getById(examId);
      if (examResponse.data?.success) {
        setExam(examResponse.data.data);
      }

      // Fetch attempts for this exam
      const attemptsResponse = await teacherAPI.examAttempts.getByExam(examId);
      if (attemptsResponse.data?.success) {
        // For exam-based grading, show all submitted attempts (with or without theory score)
        const attemptsList = attemptsResponse.data.data.items || [];
        console.log('=== RAW EXAM ATTEMPTS ===', attemptsList);
        
        // Filter attempts that have been submitted
        const needsGrading = attemptsList.filter((attempt) => {
          const isSubmitted = attempt.status === 'Submitted' || attempt.status === 'Completed';
          const needsTheoryGrading = attempt.theoryScore === null || attempt.theoryScore === undefined;
          
          console.log('=== EXAM FILTER CHECK ===', {
            id: attempt.id,
            studentName: attempt.studentName,
            status: attempt.status,
            theoryScore: attempt.theoryScore,
            needsTheoryGrading
          });
          
          // Show all submitted attempts - they may need grading
          return isSubmitted;
        });
        
        console.log('=== FILTERED EXAM ATTEMPTS ===', needsGrading);
        setAttempts(needsGrading);
      }
    } catch (err) {
      console.error('Error fetching exam:', err);
      setError('Failed to load exam data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentAttempts = async () => {
    try {
      setLoading(true);

      // Fetch student details
      const studentResponse = await adminAPI.students.getById(studentId);
      if (studentResponse.data?.success) {
        setStudent(studentResponse.data.data);
      }

      // Fetch all exam attempts for this student
      const attemptsResponse = await teacherAPI.examAttempts.getByStudent(studentId);
      if (attemptsResponse.data?.success) {
        const attemptsList = attemptsResponse.data.data.items || [];
        console.log('=== RAW ATTEMPTS ===', attemptsList);
        
        // Filter attempts that have theory component and need grading
        // Only show attempts that: have been submitted AND have theory questions that aren't graded
        const needsGrading = attemptsList.filter((attempt) => {
          // Now we have examType directly from the response
          // ExamType enum: Objective=1, Theory=2, Mixed=3
          // If examType is not set (0/null), treat as Objective (no theory grading needed)
          const examType = attempt.examType || 1; // Default to Objective if not set
          const hasTheory = examType === 2 || examType === 3; // Theory or Mixed (Objective+Theory)
          const needsTheoryGrading = attempt.theoryScore === null || attempt.theoryScore === undefined;
          const isSubmitted = attempt.status === 'Submitted' || attempt.status === 'Completed';
          
          console.log('=== FILTER CHECK ===', {
            id: attempt.id,
            examType,
            hasTheory,
            needsTheoryGrading,
            theoryScore: attempt.theoryScore,
            status: attempt.status
          });
          
          return hasTheory && needsTheoryGrading && isSubmitted;
        });
        
        console.log('=== FILTERED ATTEMPTS ===', needsGrading);
        setAttempts(needsGrading);
      }
    } catch (err) {
      console.error('Error fetching student attempts:', err);
      setError('Failed to load student data');
    } finally {
      setLoading(false);
    }
  };

  const fetchExamForAttempt = async (attemptId) => {
    try {
      const response = await teacherAPI.examAttempts.getById(attemptId);
      if (response.data?.success) {
        setExam(response.data.data.exam);
      }
    } catch (err) {
      console.error('Error fetching exam:', err);
    }
  };

  const handleOpenGrading = async (attempt) => {
    setSelectedAttempt(attempt);
    setGradingForm({
      theoryScore: attempt.theoryScore || '',
      teacherRemarks: attempt.teacherRemarks || '',
    });
    
    // For exam-based grading (examId), use the already fetched exam
    // For student-based grading (studentId), we may need to fetch exam details
    if (studentId && !exam) {
      // Try to fetch exam details
      try {
        const response = await teacherAPI.examAttempts.getById(attempt.id);
        if (response.data?.success) {
          setExam(response.data.data.exam);
        }
      } catch (err) {
        console.error('Error fetching exam:', err);
      }
    }
    
    setGradingDialogOpen(true);
    setError('');
    setSuccess('');
  };

  const handleCloseGrading = () => {
    setGradingDialogOpen(false);
    setSelectedAttempt(null);
    setGradingForm({ theoryScore: '', teacherRemarks: '' });
  };

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!gradingForm.theoryScore && gradingForm.theoryScore !== 0) {
      setError('Theory score is required');
      return;
    }

    const score = parseFloat(gradingForm.theoryScore);
    if (isNaN(score) || score < 0) {
      setError('Please enter a valid score');
      return;
    }

    if (exam && exam.theoryMark && score > exam.theoryMark) {
      setError(`Score cannot exceed theory marks (${exam.theoryMark})`);
      return;
    }

    setSaving(true);

    try {
      const response = await teacherAPI.examAttempts.gradeTheory({
        attemptId: selectedAttempt.id,
        theoryScore: score,
        teacherRemarks: gradingForm.teacherRemarks,
      });

      if (response.data?.success) {
        setSuccess('Theory graded successfully! Result has been updated.');
        // Refresh the attempts list based on current view
        if (studentId) {
          await fetchStudentAttempts();
        } else {
          await fetchExamAndAttempts();
        }
        // Close dialog after short delay
        setTimeout(() => {
          handleCloseGrading();
          setSuccess('');
        }, 1500);
      } else {
        setError(response.data?.message || 'Failed to grade theory');
      }
    } catch (err) {
      console.error('Error grading theory:', err);
      setError(err.response?.data?.message || 'Failed to grade theory. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusChip = (status) => {
    const statusMap = {
      'InProgress': { label: 'In Progress', color: 'default' },
      'Submitted': { label: 'Submitted', color: 'warning' },
      'Completed': { label: 'Completed', color: 'success' },
      'Graded': { label: 'Graded', color: 'info' },
    };
    const config = statusMap[status] || { label: status, color: 'default' };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress sx={{ color: '#FF3E8A' }} />
      </Box>
    );
  }

  const getPageTitle = () => {
    if (studentId && student) {
      const firstName = student.firstName || student.user?.firstName || '';
      const lastName = student.lastName || student.user?.lastName || '';
      return `${firstName} ${lastName} - Theory Grading`;
    }
    return exam?.title ? `${exam.title} - Theory Grading` : 'Grade Theory';
  };

  const getBackLink = () => {
    if (studentId) {
      return `${basePath}/students`;
    }
    return `${basePath}/exams`;
  };

  // Check if we need to show student column (only in exam view)
  const showStudentColumn = !studentId;

  // Helper to get exam for each attempt 
  const getExamForAttempt = (attempt) => {
    // If we have examId (exam-based grading), create exam object from attempt data
    if (examId) {
      return {
        title: attempt.subjectName || exam?.title,
        examType: attempt.examType,
        objectiveMark: attempt.objectiveMark || exam?.objectiveMark,
        theoryMark: attempt.theoryMark || exam?.theoryMark,
        totalMarks: attempt.totalMarks || exam?.totalMarks
      };
    }
    // If we have studentId (student-based grading), use attempt data
    if (studentId) {
      return {
        title: attempt.subjectName,
        examType: attempt.examType,
        objectiveMark: attempt.objectiveMark,
        theoryMark: attempt.theoryMark,
        totalMarks: attempt.totalMarks
      };
    }
    return exam;
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0a192f 0%, #0d1b2a 40%, #000000 100%)',
        p: 4,
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
          <IconButton onClick={() => navigate(getBackLink())} sx={{ color: '#ffffff' }}>
            <ArrowBack />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#ffffff' }}>
              <AssignmentTurnedIn sx={{ mr: 1, verticalAlign: 'middle' }} />
              {studentId ? 'Student Theory Grades' : 'Grade Theory'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              {getPageTitle()}
            </Typography>
          </Box>
        </Box>

        {/* Info Alert */}
        {exam && exam.theoryMark > 0 && (
          <Alert
            severity="info"
            sx={{
              mb: 3,
              borderRadius: 2,
              backgroundColor: 'rgba(33, 150, 243, 0.15)',
              color: '#64B5F6',
              border: '1px solid rgba(33, 150, 243, 0.3)',
            }}
          >
            This exam has a theory component worth <strong>{exam.theoryMark} marks</strong>. Objective scores are auto-graded.
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Success Alert */}
        {success && (
          <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {/* No Attempts Message */}
        {attempts.length === 0 && !loading && (
          <Card
            sx={{
              background: 'rgba(17, 17, 17, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 3,
              p: 6,
              textAlign: 'center',
            }}
          >
            <CheckCircle sx={{ fontSize: 60, color: '#66BB6A', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#ffffff', mb: 1 }}>
              All Caught Up!
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              No submissions waiting for theory grading.
            </Typography>
          </Card>
        )}

        {/* Attempts Table */}
        {attempts.length > 0 && (
          <Card
            sx={{
              background: 'rgba(17, 17, 17, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 62, 138, 0.3)',
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <TableContainer component={Paper} sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      {showStudentColumn && (
                        <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>Student</TableCell>
                      )}
                      {!studentId && (
                        <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>Exam</TableCell>
                      )}
                      <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>Attempt</TableCell>
                      <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>Objective Score</TableCell>
                      <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>Theory Score</TableCell>
                      <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>Total Score</TableCell>
                      <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>Submitted</TableCell>
                      <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attempts.map((attempt) => {
                      const attemptExam = getExamForAttempt(attempt);
                      return (
                      <TableRow key={attempt.id} hover>
                        {showStudentColumn && (
                          <TableCell sx={{ color: '#ffffff' }}>
                            {attempt.studentName || `Student #${attempt.studentProfileId}`}
                          </TableCell>
                        )}
                        {!studentId && (
                          <TableCell sx={{ color: '#ffffff' }}>
                            {attemptExam?.title || 'Unknown Exam'}
                          </TableCell>
                        )}
                        <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Attempt #{attempt.attemptNumber}
                        </TableCell>
                        <TableCell sx={{ color: '#ffffff' }}>
                          {attempt.objectiveScore !== null ? `${attempt.objectiveScore}/${attemptExam?.objectiveMark || 0}` : '-'}
                        </TableCell>
                        <TableCell sx={{ color: '#ffffff' }}>
                          {attempt.theoryScore !== null ? `${attempt.theoryScore}/${attemptExam?.theoryMark || 0}` : 'Not graded'}
                        </TableCell>
                        <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>
                          {attempt.totalScore !== null ? `${attempt.totalScore}/${attemptExam?.totalMarks || 0}` : '-'}
                        </TableCell>
                        <TableCell>{getStatusChip(attempt.status)}</TableCell>
                        <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          {attempt.completedAt ? new Date(attempt.completedAt).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() => handleOpenGrading(attempt)}
                            sx={{ color: '#FF3E8A' }}
                            title="Grade Theory"
                          >
                            <Visibility />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Grading Dialog */}
      <Dialog
        open={gradingDialogOpen}
        onClose={handleCloseGrading}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#111111',
            border: '1px solid rgba(255, 62, 138, 0.3)',
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ color: '#ffffff' }}>
          Grade Theory - Attempt #{selectedAttempt?.attemptNumber}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {selectedAttempt && (
            <Box sx={{ mt: 2 }}>
              {/* Student Info */}
              <Box sx={{ mb: 3, p: 2, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 2 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 0.5 }}>
                  Student
                </Typography>
                <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 600 }}>
                  {studentId 
                    ? `${student?.firstName || student?.user?.firstName || ''} ${student?.lastName || student?.user?.lastName || ''}`
                    : selectedAttempt.studentName || `Student #${selectedAttempt.studentProfileId}`}
                </Typography>
              </Box>

              {/* Exam Info (show when viewing from student) */}
              {studentId && exam && (
                <Box sx={{ mb: 3, p: 2, backgroundColor: 'rgba(33, 150, 243, 0.1)', borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ color: '#64B5F6', mb: 0.5 }}>
                    Exam
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 600 }}>
                    {exam.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    Theory Marks: {exam.theoryMark} | Objective Marks: {exam.objectiveMark}
                  </Typography>
                </Box>
              )}

              {/* Objective Score Display */}
              <Box sx={{ mb: 3, p: 2, backgroundColor: 'rgba(102, 187, 106, 0.1)', borderRadius: 2 }}>
                <Typography variant="body2" sx={{ color: '#66BB6A', mb: 0.5 }}>
                  Objective Score (Auto-graded)
                </Typography>
                <Typography variant="h5" sx={{ color: '#66BB6A', fontWeight: 700 }}>
                  {selectedAttempt.objectiveScore !== null
                    ? `${selectedAttempt.objectiveScore} / ${exam?.objectiveMark || 0}`
                    : 'Not graded'}
                </Typography>
              </Box>

              {/* Theory Score Input */}
              <TextField
                fullWidth
                label="Theory Score"
                type="number"
                value={gradingForm.theoryScore}
                onChange={(e) => setGradingForm({ ...gradingForm, theoryScore: e.target.value })}
                inputProps={{
                  min: 0,
                  max: exam?.theoryMark || 100,
                  step: 0.5,
                }}
                sx={{ mb: 3 }}
                helperText={`Max: ${exam?.theoryMark || 100} marks`}
                error={
                  gradingForm.theoryScore !== '' &&
                  parseFloat(gradingForm.theoryScore) > (exam?.theoryMark || 100)
                }
              />

              {/* Remarks Input */}
              <TextField
                fullWidth
                label="Teacher's Remarks (Optional)"
                multiline
                rows={4}
                value={gradingForm.teacherRemarks}
                onChange={(e) => setGradingForm({ ...gradingForm, teacherRemarks: e.target.value })}
                placeholder="Add feedback for the student..."
                sx={{ mb: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={handleCloseGrading} disabled={saving} sx={{ color: '#ffffff' }}>
            Cancel
          </Button>
          <Button
            onClick={handleGradeSubmit}
            disabled={saving}
            variant="contained"
            startIcon={saving ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <Save />}
            sx={{
              background: '#FF3E8A',
              '&:hover': { background: '#FF5DA3' },
            }}
          >
            {saving ? 'Saving...' : 'Submit Grade'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GradeTheory;
