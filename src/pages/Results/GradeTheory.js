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
} from '@mui/icons-material';
import { adminAPI, teacherAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const GradeTheory = () => {
  const navigate = useNavigate();
  const { examId } = useParams();
  const { user, hasRole } = useAuth();

  const basePath = hasRole('Admin') ? '/admin-dashboard' : '/teacher-dashboard';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [exam, setExam] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [gradingDialogOpen, setGradingDialogOpen] = useState(false);

  const [gradingForm, setGradingForm] = useState({
    theoryScore: '',
    teacherRemarks: '',
  });

  useEffect(() => {
    fetchExamAndAttempts();
  }, [examId]);

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
        // Filter only attempts that need theory grading (submitted but not completed/graded)
        const attemptsList = attemptsResponse.data.data.items || [];
        const needsGrading = attemptsList.filter(
          (attempt) => attempt.status === 'Submitted' || (attempt.status === 'Completed' && attempt.theoryScore === null)
        );
        setAttempts(needsGrading);
      }
    } catch (err) {
      console.error('Error fetching exam:', err);
      setError('Failed to load exam data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenGrading = (attempt) => {
    setSelectedAttempt(attempt);
    setGradingForm({
      theoryScore: attempt.theoryScore || '',
      teacherRemarks: attempt.teacherRemarks || '',
    });
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
        // Refresh the attempts list
        await fetchExamAndAttempts();
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
          <IconButton onClick={() => navigate(`${basePath}/exams`)} sx={{ color: '#ffffff' }}>
            <ArrowBack />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#ffffff' }}>
              Grade Theory
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              {exam?.title || 'Exam'} - Theory Grading
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
                      <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>Student</TableCell>
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
                    {attempts.map((attempt) => (
                      <TableRow key={attempt.id} hover>
                        <TableCell sx={{ color: '#ffffff' }}>
                          {attempt.studentName || `Student #${attempt.studentProfileId}`}
                        </TableCell>
                        <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Attempt #{attempt.attemptNumber}
                        </TableCell>
                        <TableCell sx={{ color: '#ffffff' }}>
                          {attempt.objectiveScore !== null ? `${attempt.objectiveScore}/${exam?.objectiveMark || 0}` : '-'}
                        </TableCell>
                        <TableCell sx={{ color: '#ffffff' }}>
                          {attempt.theoryScore !== null ? `${attempt.theoryScore}/${exam?.theoryMark || 0}` : 'Not graded'}
                        </TableCell>
                        <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>
                          {attempt.totalScore !== null ? `${attempt.totalScore}/${exam?.totalMarks || 0}` : '-'}
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
                    ))}
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
                  {selectedAttempt.studentName || `Student #${selectedAttempt.studentProfileId}`}
                </Typography>
              </Box>

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
