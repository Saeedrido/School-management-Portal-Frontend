import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Chip, Alert, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import { Add, Delete, Visibility } from '@mui/icons-material';
import { PageHeader } from '../../components/ui';
import { entranceExamAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const EntranceExamList = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });

  useEffect(() => { loadExams(); }, []);

  const loadExams = async () => {
    setLoading(true);
    try {
      const res = await entranceExamAPI.getAll();
      if (res.data?.success) setExams(res.data.data || []);
      else setError(res.data?.message || 'Failed to load exams');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await entranceExamAPI.delete(deleteDialog.id);
      if (res.data?.success) {
        setExams(prev => prev.filter(e => e.id !== deleteDialog.id));
        setDeleteDialog({ open: false, id: null });
      } else setError(res.data?.message || 'Failed to delete');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete');
    }
  };

  const levelColors = { JuniorSecondary: '#2E7D32', SeniorSecondary: '#1B5E20' };

  return (
    <Box>
      <PageHeader title="Entrance Exams" subtitle="Manage entrance examinations for new students" />
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Card sx={{ bgcolor: '#fff', border: '1px solid #4CAF50' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button variant="contained" startIcon={<Add />}
              sx={{ bgcolor: '#2E7D32', '&:hover': { bgcolor: '#1B5E20' } }}
              onClick={() => navigate('/admin-dashboard/entrance-exams/create')}>
              Create Entrance Exam
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
          ) : exams.length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>No entrance exams created yet.</Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#E8F5E9' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Level</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Passing Score</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Questions</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Candidates</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {exams.map(exam => (
                    <TableRow key={exam.id}>
                      <TableCell>{exam.title}</TableCell>
                      <TableCell>
                        <Chip label={exam.level} size="small" sx={{ color: '#fff', bgcolor: levelColors[exam.level] || '#4CAF50' }} />
                      </TableCell>
                      <TableCell>{exam.durationMinutes} min</TableCell>
                      <TableCell>{exam.passingScore}</TableCell>
                      <TableCell>{exam.totalQuestions}</TableCell>
                      <TableCell>{exam.candidateCount}</TableCell>
                      <TableCell>
                        <Chip label={exam.isActive ? 'Active' : 'Inactive'} size="small"
                          sx={{ bgcolor: exam.isActive ? '#E8F5E9' : '#F5F5F5', color: exam.isActive ? '#2E7D32' : '#9E9E9E', fontWeight: 600 }} />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" sx={{ color: '#2E7D32' }} onClick={() => navigate(`/admin-dashboard/entrance-exams/${exam.id}`)}><Visibility /></IconButton>
                        <IconButton size="small" sx={{ color: '#C62828' }} onClick={() => setDeleteDialog({ open: true, id: exam.id })}><Delete /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null })}>
        <DialogTitle>Delete Entrance Exam</DialogTitle>
        <DialogContent>Are you sure you want to delete this entrance exam? This action cannot be undone.</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, id: null })}>Cancel</Button>
          <Button onClick={handleDelete} sx={{ bgcolor: '#C62828', color: '#fff', '&:hover': { bgcolor: '#B71C1C' } }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EntranceExamList;
