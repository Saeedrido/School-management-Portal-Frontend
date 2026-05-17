import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Chip, Alert,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  Grid,
} from '@mui/material';
import { Add, Edit, Delete, Quiz, ArrowBack, Upload } from '@mui/icons-material';
import { PageHeader } from '../../components/ui';
import { entranceExamAPI } from '../../services/api';
import { useNavigate, useParams } from 'react-router-dom';

const EntranceExamDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [deleteDialog, setDeleteDialog] = useState({ open: false, questionId: null });

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await entranceExamAPI.getById(id);
      if (res.data?.success) setExam(res.data.data);
      else setError(res.data?.message || 'Failed to load exam');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    try {
      const res = await entranceExamAPI.update(id, { isActive: !exam.isActive });
      if (res.data?.success) {
        setExam(prev => ({ ...prev, isActive: !prev.isActive }));
        setSuccess(exam.isActive ? 'Exam deactivated' : 'Exam activated');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update');
    }
  };

  const handleDeleteQuestion = async () => {
    try {
      const res = await entranceExamAPI.deleteQuestion(deleteDialog.questionId);
      if (res.data?.success) {
        setSuccess('Question deleted');
        setDeleteDialog({ open: false, questionId: null });
        loadData();
      } else setError(res.data?.message || 'Failed to delete');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete');
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  if (!exam) return <Alert severity="error">Exam not found</Alert>;

  return (
    <Box>
      <PageHeader
        title={exam.title}
        subtitle={`${exam.levelName || exam.level} | ${exam.durationMinutes} min | Pass: ${exam.passingScore} marks`}
        action={
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button variant="outlined" startIcon={<ArrowBack />}
              sx={{ borderColor: '#4CAF50', color: '#2E7D32' }}
              onClick={() => navigate('/admin-dashboard/entrance-exams')}>Back</Button>
            <Button variant={exam.isActive ? 'outlined' : 'contained'}
              sx={exam.isActive ? { borderColor: '#EF6C00', color: '#EF6C00' } : { bgcolor: '#2E7D32', '&:hover': { bgcolor: '#1B5E20' } }}
              onClick={handleToggleActive}>
              {exam.isActive ? 'Deactivate' : 'Activate'}
            </Button>
            <Button variant="contained" startIcon={<Add />}
              sx={{ bgcolor: '#2E7D32', '&:hover': { bgcolor: '#1B5E20' } }}
              onClick={() => navigate(`/admin-dashboard/entrance-candidates/register?examId=${id}`)}>
              Register Candidate
            </Button>
          </Box>
        }
      />
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Card sx={{ mb: 3, bgcolor: '#fff', border: '1px solid #4CAF50' }}>
        <CardContent>
          <Typography variant="body1" gutterBottom><strong>Description:</strong> {exam.description || 'N/A'}</Typography>
          <Typography variant="body1" gutterBottom><strong>Instructions:</strong> {exam.instructions || 'N/A'}</Typography>
        </CardContent>
      </Card>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6}>
          <Button variant="contained" fullWidth startIcon={<Quiz />}
            sx={{ bgcolor: '#2E7D32', '&:hover': { bgcolor: '#1B5E20' } }}
            onClick={() => navigate(`/admin-dashboard/entrance-exams/${id}/questions`)}>
            Manage Questions ({exam.totalQuestions})
          </Button>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button variant="contained" fullWidth startIcon={<Upload />}
            sx={{ bgcolor: '#388E3C', '&:hover': { bgcolor: '#2E7D32' } }}
            onClick={() => navigate(`/admin-dashboard/entrance-exams/${id}/questions`)}>
            Upload DOCX Questions
          </Button>
        </Grid>
      </Grid>

      <Card sx={{ bgcolor: '#fff', border: '1px solid #4CAF50' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: '#2E7D32' }}>Questions ({exam.questions?.length || 0})</Typography>
          </Box>

          {(!exam.questions || exam.questions.length === 0) ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
              No questions yet. Click "Manage Questions" to add multiple choice questions.
            </Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#E8F5E9' }}>
                    <TableCell sx={{ fontWeight: 600, width: 50 }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Subject</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Question</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Marks</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Correct</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {exam.questions.map((q, i) => (
                    <TableRow key={q.id}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>{q.subject || '-'}</TableCell>
                      <TableCell sx={{ maxWidth: 350 }}>
                        <Typography noWrap>{q.questionText}</Typography>
                      </TableCell>
                      <TableCell>{q.marks}</TableCell>
                      <TableCell>{q.correctOptionKey}</TableCell>
                      <TableCell align="center">
                        <IconButton size="small" sx={{ color: '#2E7D32' }}
                          onClick={() => navigate(`/admin-dashboard/entrance-exams/${id}/questions?edit=${q.id}`)}><Edit /></IconButton>
                        <IconButton size="small" sx={{ color: '#C62828' }}
                          onClick={() => setDeleteDialog({ open: true, questionId: q.id })}><Delete /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, questionId: null })}>
        <DialogTitle>Delete Question</DialogTitle>
        <DialogContent>Are you sure? This cannot be undone.</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, questionId: null })}>Cancel</Button>
          <Button onClick={handleDeleteQuestion} sx={{ bgcolor: '#C62828', color: '#fff', '&:hover': { bgcolor: '#B71C1C' } }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EntranceExamDetail;
