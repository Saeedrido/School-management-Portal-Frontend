import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button, MenuItem, Grid, Alert, CircularProgress,
} from '@mui/material';
import { PageHeader } from '../../components/ui';
import { entranceExamAPI } from '../../services/api';
import { useNavigate, useParams } from 'react-router-dom';

const EntranceExamForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '', description: '', level: 'JuniorSecondary', durationMinutes: 30,
    passingScore: 10, instructions: '',
  });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [createdId, setCreatedId] = useState(null);

  useEffect(() => {
    if (isEdit) loadExam();
  }, [id]);

  const loadExam = async () => {
    try {
      const res = await entranceExamAPI.getById(id);
      if (res.data?.success && res.data.data) {
        const exam = res.data.data;
        setForm({
          title: exam.title || '', description: exam.description || '',
          level: exam.level || 'JuniorSecondary', durationMinutes: exam.durationMinutes || 30,
          passingScore: exam.passingScore || 10, instructions: exam.instructions || '',
        });
      } else setError(res.data?.message || 'Failed to load exam');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load exam');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required'); return; }
    if (form.durationMinutes < 1) { setError('Duration must be at least 1 minute'); return; }
    if (form.passingScore < 1) { setError('Passing score must be at least 1'); return; }

    setSaving(true);
    setError('');
    try {
      const res = isEdit
        ? await entranceExamAPI.update(id, form)
        : await entranceExamAPI.create(form);
      if (res.data?.success) {
        if (isEdit) {
          setSuccess('Exam updated successfully');
          setTimeout(() => navigate(`/admin-dashboard/entrance-exams/${id}`), 1500);
        } else {
          const newId = res.data.data.id;
          setSuccess('Exam created successfully! Now add questions.');
          setTimeout(() => navigate(`/admin-dashboard/entrance-exams/${newId}/questions`), 1500);
        }
      } else setError(res.data?.message || 'Failed to save');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <PageHeader title={isEdit ? 'Edit Entrance Exam' : 'Create Entrance Exam'} subtitle="Configure the entrance examination settings" />
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Card sx={{ bgcolor: '#fff', border: '1px solid #4CAF50' }}>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField fullWidth required label="Exam Title" name="title" value={form.title} onChange={handleChange} placeholder="e.g. JSS Entrance Examination" />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth multiline rows={2} label="Description" name="description" value={form.description} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth required select label="Level" name="level" value={form.level} onChange={handleChange}>
                  <MenuItem value="JuniorSecondary">Junior Secondary (JSS)</MenuItem>
                  <MenuItem value="SeniorSecondary">Senior Secondary (SS)</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth required type="number" label="Duration (minutes)" name="durationMinutes" value={form.durationMinutes} onChange={handleChange} inputProps={{ min: 1 }} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth required type="number" label="Passing Score" name="passingScore" value={form.passingScore} onChange={handleChange} inputProps={{ min: 1 }} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth multiline rows={4} label="Instructions (shown before exam starts)" name="instructions" value={form.instructions} onChange={handleChange} placeholder="Read each question carefully before answering..." />
              </Grid>
              <Grid item xs={12} sx={{ display: 'flex', gap: 2 }}>
                <Button type="submit" variant="contained" disabled={saving}
                  sx={{ bgcolor: '#2E7D32', '&:hover': { bgcolor: '#1B5E20' } }}
                  startIcon={saving ? <CircularProgress size={18} /> : null}>
                  {saving ? 'Saving...' : isEdit ? 'Update Exam' : 'Create Exam'}
                </Button>
                <Button variant="outlined" sx={{ borderColor: '#4CAF50', color: '#2E7D32' }} onClick={() => navigate('/admin-dashboard/entrance-exams')}>Cancel</Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EntranceExamForm;
