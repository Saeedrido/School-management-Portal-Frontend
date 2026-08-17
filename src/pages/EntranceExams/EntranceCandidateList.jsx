import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Chip, Alert,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Grid, Snackbar,
} from '@mui/material';
import { Add, Delete, DeleteForever, ContentCopy, OpenInNew, SwapHoriz } from '@mui/icons-material';
import { PageHeader } from '../../components/ui';
import { entranceExamAPI, entranceExamCandidateAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const LEVELS = ['JuniorSecondary', 'SeniorSecondary'];

const statusColors = {
  Pending: 'default', InProgress: 'info', Completed: 'warning', Passed: 'success', Failed: 'error',
};

const EntranceCandidateList = () => {
  const navigate = useNavigate();
  const [level, setLevel] = useState('');
  const [examId, setExamId] = useState('');
  const [exams, setExams] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, hard: false });
  const [reassignDialog, setReassignDialog] = useState({ open: false, candidate: null, exams: [], newExamId: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  useEffect(() => {
    if (level) {
      loadExamsByLevel(level);
      setExamId('');
    } else {
      setExams([]);
      setExamId('');
      setCandidates([]);
    }
  }, [level]);

  useEffect(() => {
    if (examId) loadCandidatesByExam(examId);
    else if (level) loadCandidatesByLevel(level);
    else setCandidates([]);
  }, [examId, level]);

  const loadExamsByLevel = async (lvl) => {
    try {
      const res = await entranceExamAPI.getByLevel(lvl);
      if (res.data?.success) setExams(res.data.data || []);
    } catch (_) {
      setExams([]);
    }
  };

  const loadCandidatesByLevel = async (lvl) => {
    setLoading(true);
    try {
      const res = await entranceExamCandidateAPI.getByLevel(lvl);
      if (res.data?.success) setCandidates(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const loadCandidatesByExam = async (id) => {
    setLoading(true);
    try {
      const res = await entranceExamCandidateAPI.getByExam(id);
      if (res.data?.success) setCandidates(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const apiCall = deleteDialog.hard
        ? entranceExamCandidateAPI.hardDelete(deleteDialog.id)
        : entranceExamCandidateAPI.delete(deleteDialog.id);
      const res = await apiCall;
      if (res.data?.success) {
        setCandidates(prev => prev.filter(c => c.id !== deleteDialog.id));
        setDeleteDialog({ open: false, id: null, hard: false });
        setSuccess(deleteDialog.hard ? 'Candidate permanently deleted' : 'Candidate deleted');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete');
    }
  };

  const openReassign = async (candidate) => {
    try {
      const res = await entranceExamAPI.getByLevel(level);
      if (res.data?.success) {
        const otherExams = (res.data.data || []).filter(e => e.id !== candidate.entranceExamId && e.isActive);
        setReassignDialog({ open: true, candidate, exams: otherExams, newExamId: '' });
      }
    } catch (_) {
      setError('Failed to load exams');
    }
  };

  const handleReassign = async () => {
    const { candidate, newExamId } = reassignDialog;
    if (!newExamId) { setError('Please select an exam'); return; }
    try {
      const res = await entranceExamCandidateAPI.update(candidate.id, { newExamId });
      if (res.data?.success) {
        setSuccess(`Candidate reassigned to new exam`);
        setReassignDialog({ open: false, candidate: null, exams: [], newExamId: '' });
        loadCandidatesByExam(examId || '') || loadCandidatesByLevel(level);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reassign');
    }
  };

  const copyLink = (token) => {
    navigator.clipboard.writeText(`${window.location.origin}/#/entrance-exam/take?token=${token}`);
    setSnackbar({ open: true, message: 'Link copied to clipboard' });
  };

  const openExam = (token) => {
    window.open(`${window.location.origin}/#/entrance-exam/take?token=${token}`, '_blank');
  };

  const selectedExam = exams.find(e => e.id === examId);
  const registerPath = examId
    ? `/admin-dashboard/entrance-candidates/register?examId=${examId}`
    : '/admin-dashboard/entrance-candidates/register';

  return (
    <Box>
      <PageHeader title="Entrance Exam Candidates" subtitle="View and manage candidates across all exams"
        action={
          <Button variant="contained" startIcon={<Add />}
            sx={{ bgcolor: '#2E7D32', '&:hover': { bgcolor: '#1B5E20' } }}
            onClick={() => navigate(registerPath)}>
            Register New Candidate
          </Button>
        }
      />
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Card sx={{ bgcolor: '#fff', border: '1px solid #4CAF50' }}>
        <CardContent>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth select label="Select Level" value={level}
                onChange={(e) => setLevel(e.target.value)}>
                <MenuItem value="">All Levels</MenuItem>
                {LEVELS.map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth select label="Select Exam" value={examId}
                onChange={(e) => setExamId(e.target.value)}
                disabled={!level}>
                <MenuItem value="">All Exams at this Level</MenuItem>
                {exams.map(e => (
                  <MenuItem key={e.id} value={e.id}>{e.title} ({e.candidateCount} candidates)</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
          ) : !level ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              Select a level to view candidates.
            </Typography>
          ) : examId && candidates.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                No candidates registered for <strong>{selectedExam?.title}</strong> yet.
              </Typography>
              <Button variant="outlined" startIcon={<Add />}
                sx={{ borderColor: '#4CAF50', color: '#2E7D32' }}
                onClick={() => navigate(registerPath)}>
                Register Candidate for this Exam
              </Button>
            </Box>
          ) : level && !examId && candidates.length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No candidates found for this level.
            </Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#E8F5E9' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Exam</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Score</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Registered</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {candidates.map(c => (
                    <TableRow key={c.id}>
                      <TableCell>{c.firstName} {c.lastName}</TableCell>
                      <TableCell>{c.examTitle || '-'}</TableCell>
                      <TableCell>{c.email || '-'}</TableCell>
                      <TableCell>
                        <Chip label={c.statusName} size="small" color={statusColors[c.statusName] || 'default'} />
                      </TableCell>
                      <TableCell>{c.totalScore != null ? c.totalScore : '-'}</TableCell>
                      <TableCell>{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <IconButton size="small" sx={{ color: '#2E7D32' }}
                            onClick={() => openExam(c.accessToken)} title="Open Exam">
                            <OpenInNew fontSize="small" />
                          </IconButton>
                          <IconButton size="small" sx={{ color: '#2E7D32' }}
                            onClick={() => copyLink(c.accessToken)} title="Copy Link">
                            <ContentCopy fontSize="small" />
                          </IconButton>
                          <IconButton size="small" sx={{ color: '#1565C0' }}
                            onClick={() => openReassign(c)} title="Reassign to Another Exam">
                            <SwapHoriz fontSize="small" />
                          </IconButton>
                          <Button size="small" variant="outlined"
                            sx={{ borderColor: '#4CAF50', color: '#2E7D32', minWidth: 40, fontSize: '0.7rem' }}
                            onClick={() => navigate(`/admin-dashboard/entrance-candidates/${c.id}`)}>
                            View
                          </Button>
                          <IconButton size="small" sx={{ color: '#C62828' }}
                            onClick={() => setDeleteDialog({ open: true, id: c.id, hard: false })} title="Soft Delete">
                            <Delete fontSize="small" />
                          </IconButton>
                          <IconButton size="small" sx={{ color: '#B71C1C' }}
                            onClick={() => setDeleteDialog({ open: true, id: c.id, hard: true })} title="Permanently Delete">
                            <DeleteForever fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ open: false, message: '' })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message={snackbar.message}
        sx={{ '& .MuiSnackbarContent-root': { bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 600 } }} />

      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null, hard: false })}>
        <DialogTitle>{deleteDialog.hard ? 'Permanently Delete Candidate' : 'Delete Candidate'}</DialogTitle>
        <DialogContent>
          {deleteDialog.hard
            ? 'This will permanently remove the candidate from the database. This action cannot be undone.'
            : 'This will soft-delete the candidate. They will no longer appear in lists.'}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, id: null, hard: false })}>Cancel</Button>
          <Button onClick={handleDelete}
            sx={{ bgcolor: deleteDialog.hard ? '#B71C1C' : '#C62828', color: '#fff', '&:hover': { bgcolor: deleteDialog.hard ? '#880000' : '#B71C1C' } }}>
            {deleteDialog.hard ? 'Delete Permanently' : 'Soft Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={reassignDialog.open} onClose={() => setReassignDialog({ open: false, candidate: null, exams: [], newExamId: '' })} maxWidth="sm" fullWidth>
        <DialogTitle>Reassign Candidate to Another Exam</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Reassign <strong>{reassignDialog.candidate?.firstName} {reassignDialog.candidate?.lastName}</strong> to a new exam.
            Their status will be reset to Pending.
          </Typography>
          {reassignDialog.exams.length === 0 ? (
            <Alert severity="info">No other active exams available at this level.</Alert>
          ) : (
            <TextField fullWidth select label="Select New Exam" value={reassignDialog.newExamId}
              onChange={(e) => setReassignDialog({ ...reassignDialog, newExamId: e.target.value })}>
              <MenuItem value="">Select Exam</MenuItem>
              {reassignDialog.exams.map(exam => (
                <MenuItem key={exam.id} value={exam.id}>{exam.title} ({exam.level})</MenuItem>
              ))}
            </TextField>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReassignDialog({ open: false, candidate: null, exams: [], newExamId: '' })}>Cancel</Button>
          <Button onClick={handleReassign} variant="contained" disabled={!reassignDialog.newExamId}
            sx={{ bgcolor: '#2E7D32', '&:hover': { bgcolor: '#1B5E20' } }}>
            Reassign
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EntranceCandidateList;
