import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button, MenuItem, Grid, Alert, CircularProgress, Snackbar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Collapse,
} from '@mui/material';
import { OpenInNew, ContentCopy, ExpandMore, ExpandLess } from '@mui/icons-material';
import { PageHeader } from '../../components/ui';
import { entranceExamAPI, entranceExamCandidateAPI } from '../../services/api';
import { useNavigate, useSearchParams } from 'react-router-dom';

const LEVELS = ['JuniorSecondary', 'SeniorSecondary'];

const EntranceCandidateRegister = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedExamId = searchParams.get('examId');

  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [existingCandidates, setExistingCandidates] = useState([]);
  const [showExisting, setShowExisting] = useState(false);
  const [form, setForm] = useState({
    level: '', entranceExamId: preselectedExamId || '', firstName: '', lastName: '',
    email: '', phoneNumber: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  useEffect(() => {
    const loadExams = async () => {
      try {
        const res = await entranceExamAPI.getAll();
        if (res.data?.success) setExams(res.data.data || []);
      } catch (_) {} finally {
        setLoading(false);
      }
    };
    loadExams();
  }, []);

  useEffect(() => {
    if (form.level) {
      const filtered = exams.filter(e => e.level === form.level && e.isActive);
      setFilteredExams(filtered);
      if (!filtered.find(e => e.id === form.entranceExamId)) {
        setForm(prev => ({ ...prev, entranceExamId: '' }));
      }
    } else {
      setFilteredExams([]);
      setForm(prev => ({ ...prev, entranceExamId: '' }));
    }
  }, [form.level, exams]);

  useEffect(() => {
    if (form.entranceExamId) {
      loadExistingCandidates(form.entranceExamId);
    } else {
      setExistingCandidates([]);
    }
  }, [form.entranceExamId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const loadExistingCandidates = async (examId) => {
    try {
      const res = await entranceExamCandidateAPI.getByExam(examId);
      if (res.data?.success) setExistingCandidates(res.data.data || []);
    } catch (_) {
      setExistingCandidates([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.entranceExamId) { setError('Please select an exam'); return; }
    if (!form.firstName.trim() || !form.lastName.trim()) { setError('First and last name are required'); return; }

    setSaving(true);
    setError('');
    try {
      const res = await entranceExamCandidateAPI.register({
        entranceExamId: form.entranceExamId,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phoneNumber: form.phoneNumber,
      });
      if (res.data?.success) {
        setResult(res.data.data);
        if (form.entranceExamId) loadExistingCandidates(form.entranceExamId);
      } else setError(res.data?.message || 'Failed to register');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register');
    } finally {
      setSaving(false);
    }
  };

  const examUrl = result ? `${window.location.origin}/entrance-exam/take?token=${result.accessToken}` : '';

  const copyLink = () => {
    navigator.clipboard.writeText(examUrl);
    setSnackbar({ open: true, message: 'Link copied to clipboard' });
  };

  const openExam = () => {
    window.open(examUrl, '_blank');
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <PageHeader title="Register Entrance Exam Candidate" subtitle="Register a new student for entrance examination" />

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {result ? (
        <Card sx={{ bgcolor: '#fff', border: '1px solid #4CAF50' }}>
          <CardContent>
            <Alert severity="success" sx={{ mb: 3, bgcolor: '#E8F5E9' }}>Candidate registered successfully!</Alert>
            <Typography variant="h6" gutterBottom sx={{ color: '#2E7D32' }}>Candidate Details</Typography>
            <Typography><strong>Name:</strong> {result.firstName} {result.lastName}</Typography>
            <Typography><strong>Exam:</strong> {result.examTitle}</Typography>
            <Typography><strong>Status:</strong> {result.statusName}</Typography>
            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button variant="contained" size="large" fullWidth startIcon={<OpenInNew />}
                sx={{ bgcolor: '#2E7D32', '&:hover': { bgcolor: '#1B5E20' }, py: 1.5 }}
                onClick={openExam}>
                Open Exam
              </Button>
              <Button variant="outlined" size="large" fullWidth startIcon={<ContentCopy />}
                sx={{ borderColor: '#4CAF50', color: '#2E7D32', py: 1.5 }}
                onClick={copyLink}>
                Copy Link
              </Button>
            </Box>
            <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button variant="outlined" sx={{ borderColor: '#4CAF50', color: '#2E7D32', flex: 1 }} onClick={() => setResult(null)}>Register Another</Button>
              <Button variant="outlined" sx={{ borderColor: '#4CAF50', color: '#2E7D32', flex: 1 }} onClick={() => navigate('/admin-dashboard/entrance-candidates')}>View All Candidates</Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card sx={{ bgcolor: '#fff', border: '1px solid #4CAF50', mb: 3 }}>
            <CardContent>
              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth required select label="Level" name="level" value={form.level} onChange={handleChange}>
                      <MenuItem value="">Select Level</MenuItem>
                      {LEVELS.map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth required select label="Entrance Exam" name="entranceExamId" value={form.entranceExamId} onChange={handleChange}
                      disabled={!form.level}>
                      <MenuItem value="">{form.level ? 'Select Exam' : 'Select a level first'}</MenuItem>
                      {filteredExams.map(exam => (
                        <MenuItem key={exam.id} value={exam.id}>{exam.title}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth required label="First Name" name="firstName" value={form.firstName} onChange={handleChange} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth required label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Phone Number" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} />
                  </Grid>
                  <Grid item xs={12} sx={{ display: 'flex', gap: 2 }}>
                    <Button type="submit" variant="contained" disabled={saving}
                      sx={{ bgcolor: '#2E7D32', '&:hover': { bgcolor: '#1B5E20' } }}
                      startIcon={saving ? <CircularProgress size={18} /> : null}>
                      {saving ? 'Registering...' : 'Register Candidate'}
                    </Button>
                    <Button variant="outlined" sx={{ borderColor: '#4CAF50', color: '#2E7D32' }} onClick={() => navigate('/admin-dashboard/entrance-candidates')}>Cancel</Button>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>

          {form.entranceExamId && existingCandidates.length > 0 && (
            <Card sx={{ bgcolor: '#fff', border: '1px solid #81C784' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ color: '#2E7D32' }}>
                    Existing Candidates for this Exam ({existingCandidates.length})
                  </Typography>
                  <Button size="small" onClick={() => setShowExisting(!showExisting)}
                    endIcon={showExisting ? <ExpandLess /> : <ExpandMore />}>
                    {showExisting ? 'Hide' : 'Show'}
                  </Button>
                </Box>
                <Collapse in={showExisting}>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#E8F5E9' }}>
                          <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {existingCandidates.map(c => (
                          <TableRow key={c.id}>
                            <TableCell>{c.firstName} {c.lastName}</TableCell>
                            <TableCell>{c.email || '-'}</TableCell>
                            <TableCell><Chip label={c.statusName} size="small" color={c.statusName === 'Passed' ? 'success' : c.statusName === 'Failed' ? 'error' : 'default'} /></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Collapse>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ open: false, message: '' })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message={snackbar.message}
        sx={{ '& .MuiSnackbarContent-root': { bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 600 } }} />
    </Box>
  );
};

export default EntranceCandidateRegister;
