import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Chip, Alert, CircularProgress,
  Grid, Snackbar, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import { ArrowBack, CheckCircle, Cancel, OpenInNew, ContentCopy, Download, Replay } from '@mui/icons-material';
import { PageHeader } from '../../components/ui';
import { entranceExamCandidateAPI } from '../../services/api';
import { useNavigate, useParams } from 'react-router-dom';

const EntranceCandidateResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [reEnrollDialog, setReEnrollDialog] = useState(false);
  const [reEnrolling, setReEnrolling] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await entranceExamCandidateAPI.getById(id);
        if (res.data?.success) setCandidate(res.data.data);
        else setError(res.data?.message || 'Failed to load');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!candidate) return <Alert severity="warning">Candidate not found</Alert>;

  const statusColors = {
    Pending: 'default', InProgress: 'info', Completed: 'warning', Passed: 'success', Failed: 'error',
  };
  const hasScore = candidate.totalScore != null;
  const isPassed = candidate.statusName === 'Passed';
  const examUrl = `${window.location.origin}/entrance-exam/take?token=${candidate.accessToken}`;

  const copyLink = () => {
    navigator.clipboard.writeText(examUrl);
    setSnackbar({ open: true, message: 'Link copied to clipboard' });
  };

  const openExam = () => {
    window.open(examUrl, '_blank');
  };

  const handleReEnroll = async () => {
    setReEnrolling(true);
    try {
      const res = await entranceExamCandidateAPI.reset(id);
      if (res.data?.success) {
        setCandidate(res.data.data);
        setReEnrollDialog(false);
        setSnackbar({ open: true, message: 'Candidate re-enrolled successfully' });
      } else setError(res.data?.message || 'Failed to re-enroll');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to re-enroll');
    } finally {
      setReEnrolling(false);
    }
  };

  const downloadResult = () => {
    const lines = [
      'ENTRANCE EXAM RESULT',
      '===================',
      '',
      `Candidate: ${candidate.firstName} ${candidate.lastName}`,
      `Email: ${candidate.email || 'N/A'}`,
      `Phone: ${candidate.phoneNumber || 'N/A'}`,
      `Exam: ${candidate.examTitle || 'N/A'}`,
      `Status: ${candidate.statusName}`,
      '',
      '--- SCORE ---',
      `Total Score: ${candidate.totalScore} / ${candidate.passingScore} (passing)`,
      `Result: ${isPassed ? 'PASSED' : 'FAILED'}`,
      '',
      `Date: ${new Date().toLocaleDateString()}`,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${candidate.firstName}_${candidate.lastName}_EntranceResult.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <PageHeader title={`${candidate.firstName} ${candidate.lastName}`}
        subtitle="Entrance Exam Candidate Details"
        action={
          <Button variant="outlined" startIcon={<ArrowBack />}
            sx={{ borderColor: '#4CAF50', color: '#2E7D32' }}
            onClick={() => navigate('/admin-dashboard/entrance-candidates')}>
            Back to Candidates
          </Button>
        }
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: '#fff', border: '1px solid #4CAF50' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#2E7D32' }}>Personal Information</Typography>
              <Typography><strong>Name:</strong> {candidate.firstName} {candidate.lastName}</Typography>
              <Typography><strong>Email:</strong> {candidate.email || '-'}</Typography>
              <Typography><strong>Phone:</strong> {candidate.phoneNumber || '-'}</Typography>
              <Typography><strong>Registered:</strong> {new Date(candidate.createdAt).toLocaleDateString()}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: '#fff', border: '1px solid #4CAF50' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#2E7D32' }}>Exam Information</Typography>
              <Typography><strong>Exam:</strong> {candidate.examTitle || '-'}</Typography>
              <Typography><strong>Status:</strong> <Chip label={candidate.statusName} size="small" color={statusColors[candidate.statusName] || 'default'} /></Typography>
              {hasScore && (
                <>
                  <Typography><strong>Total Score:</strong> {candidate.totalScore} / {candidate.passingScore}</Typography>
                  <Typography><strong>Result:</strong> {isPassed ? 'Passed' : 'Failed'}</Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {!candidate.completedAt && (
          <Grid item xs={12}>
            <Card sx={{ bgcolor: '#F1F8E9', border: '1px solid #81C784' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#2E7D32' }}>Exam Access</Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button variant="contained" startIcon={<OpenInNew />}
                    sx={{ bgcolor: '#2E7D32', '&:hover': { bgcolor: '#1B5E20' }, flex: 1 }}
                    onClick={openExam}>Open Exam</Button>
                  <Button variant="outlined" startIcon={<ContentCopy />}
                    sx={{ borderColor: '#4CAF50', color: '#2E7D32', flex: 1 }}
                    onClick={copyLink}>Copy Link</Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {hasScore && (
          <Grid item xs={12}>
            <Card sx={{ bgcolor: '#fff', border: `1px solid ${isPassed ? '#4CAF50' : '#EF5350'}` }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Typography variant="h6" sx={{ color: '#2E7D32' }}>Result</Typography>
                  {isPassed
                    ? <Chip icon={<CheckCircle />} label="PASSED" sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 600 }} />
                    : <Chip icon={<Cancel />} label="FAILED" sx={{ bgcolor: '#FFEBEE', color: '#C62828', fontWeight: 600 }} />
                  }
                </Box>
                <Alert severity={isPassed ? 'success' : 'error'} sx={{ mb: 2 }}>
                  {isPassed
                    ? 'This candidate has passed the entrance exam and can be registered as a full student.'
                    : 'This candidate did not pass the entrance exam. A retake may be arranged.'
                  }
                </Alert>
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="h3" sx={{ color: isPassed ? '#2E7D32' : '#C62828', fontWeight: 700 }}>
                    {candidate.totalScore}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    out of {candidate.passingScore} passing score
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button variant="contained" startIcon={<Download />}
                    sx={{ bgcolor: '#2E7D32', '&:hover': { bgcolor: '#1B5E20' } }}
                    onClick={downloadResult}>Download Result</Button>
                  <Button variant="outlined" startIcon={<Replay />}
                    sx={{ borderColor: '#1565C0', color: '#1565C0' }}
                    onClick={() => setReEnrollDialog(true)}>Re-enroll Candidate</Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      <Dialog open={reEnrollDialog} onClose={() => setReEnrollDialog(false)}>
        <DialogTitle>Re-enroll Candidate</DialogTitle>
        <DialogContent>
          <Typography>
            This will reset <strong>{candidate.firstName} {candidate.lastName}</strong>'s status to Pending,
            clearing their previous score. They will be able to retake the entrance exam.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReEnrollDialog(false)}>Cancel</Button>
          <Button onClick={handleReEnroll} variant="contained" disabled={reEnrolling}
            sx={{ bgcolor: '#1565C0', '&:hover': { bgcolor: '#0D47A1' } }}>
            {reEnrolling ? <CircularProgress size={18} /> : 'Confirm Re-enroll'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ open: false, message: '' })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message={snackbar.message}
        sx={{ '& .MuiSnackbarContent-root': { bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 600 } }} />
    </Box>
  );
};

export default EntranceCandidateResult;
