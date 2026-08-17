import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Grid, FormControl, InputLabel,
  Select, MenuItem, CircularProgress, Alert, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, Snackbar, LinearProgress,
} from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';
import { adminAPI, teacherAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const ACADEMIC_COMMENTS = {
  exceeding: [
    'Consistently demonstrates strong understanding and applies concepts creatively.',
    'Produces work of exceptional quality with attention to detail.',
    'Goes above and beyond assignment requirements.',
    'Asks thoughtful questions that deepen class understanding.',
    'Highly motivated and takes ownership of learning.',
  ],
  meeting: [
    'Consistently meets grade-level expectations in all areas.',
    'Participates actively and respectfully in class.',
    'Works well independently and stays on task.',
    'Shows steady progress and a willingness to learn.',
    'Comes prepared to class with required materials.',
  ],
  progressing: [
    'Making steady progress toward grade-level goals.',
    'Participates more frequently in class discussions - great improvement!',
    'Growing in independence, though still needs occasional reminders to stay on task.',
    'Work is improving in organization and neatness.',
    'Progress is evident, and with continued effort, will meet expectations soon.',
  ],
  needsImprovement: [
    'Struggles to complete work within the given timeframe.',
    'Needs reminders to stay focused and on task during independent work.',
    'Has difficulty following multi-step directions independently.',
    'Would benefit from improved organization of materials and assignments.',
    'Needs to put forth more consistent effort to meet grade-level expectations.',
  ],
};

const BEHAVIOR_COMMENTS = [
  'Demonstrates respect for classmates and teachers.',
  'Takes responsibility for actions and learning.',
  'Demonstrates improved self-control this term.',
  'Is learning to use class time more effectively.',
  'Shows enthusiasm for learning and tries hard daily.',
];

const getCommentCategory = (percentage) => {
  if (percentage >= 90) return 'exceeding';
  if (percentage >= 70) return 'meeting';
  if (percentage >= 50) return 'progressing';
  return 'needsImprovement';
};

const TeacherComments = () => {
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [terms, setTerms] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedTermId, setSelectedTermId] = useState('');
  const [students, setStudents] = useState([]);
  const [resultMap, setResultMap] = useState({});
  const [comments, setComments] = useState({});
  const [behaviorComments, setBehaviorComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [assignmentsRes, termsRes] = await Promise.all([
        teacherAPI.myAssignments.getAll(1, 100),
        adminAPI.terms.getAll(),
      ]);

      const uniqueClasses = [];
      const seen = new Set();
      if (assignmentsRes.data?.success) {
        const items = assignmentsRes.data.data?.items || assignmentsRes.data.data || [];
        for (const item of items) {
          const classId = item.classId || item.ClassId;
          const className = item.class?.name || item.Class?.name || item.className || item.ClassName;
          if (classId && !seen.has(classId)) {
            seen.add(classId);
            uniqueClasses.push({ id: classId, name: className || 'Unknown' });
          }
        }
      }
      setClasses(uniqueClasses);

      if (termsRes.data?.success) {
        const termList = termsRes.data.data?.items || termsRes.data.data || [];
        setTerms(Array.isArray(termList) ? termList : []);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClassId && selectedTermId) {
      loadStudentsAndResults();
    }
  }, [selectedClassId, selectedTermId]);

  const loadStudentsAndResults = async () => {
    setLoading(true);
    setProgress('Loading students...');
    try {
      const studentsRes = await adminAPI.students.getByClass(selectedClassId);
      const studentList = studentsRes.data?.success ? (studentsRes.data.data || []) : [];
      setStudents(studentList);

      if (studentList.length === 0) {
        setLoading(false);
        setProgress('');
        return;
      }

      setProgress('Loading results...');
      const resultsData = {};
      for (let i = 0; i < studentList.length; i++) {
        const s = studentList[i];
        const sid = s.id || s.studentProfileId || s.Id;
        setProgress(`Loading ${s.firstName || s.user?.firstName || 'student'}...`);
        try {
          const res = await adminAPI.results.getByStudentAndTerm(sid, selectedTermId, true, selectedClassId);
          const data = Array.isArray(res.data?.data) ? res.data.data[0] : res.data?.data;
          if (data) resultsData[sid] = data;
        } catch { }
      }

      setResultMap(resultsData);

      const initialComments = {};
      const initialBehavior = {};
      for (const s of studentList) {
        const sid = s.id || s.studentProfileId || s.Id;
        const result = resultsData[sid];
        initialComments[sid] = result?.teacherComment || result?.TeacherComment || '';
        initialBehavior[sid] = result?.behaviorComment || result?.BehaviorComment || '';
      }
      setComments(initialComments);
      setBehaviorComments(initialBehavior);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load students');
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  const handleSave = async (studentId) => {
    const result = resultMap[studentId];
    if (!result) {
      setSnackbar({ open: true, message: 'No result found for this student' });
      return;
    }

    setSaving(true);
    try {
      const res = await adminAPI.results.updateTeacherComment(result.id || result.Id, {
        teacherComment: comments[studentId] || '',
        behaviorComment: behaviorComments[studentId] || '',
      });
      if (res.data?.success) {
        setSnackbar({ open: true, message: 'Comment saved successfully' });
      } else {
        setError(res.data?.message || 'Failed to save');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setError('');
    let saved = 0;
    let failed = 0;
    for (const student of students) {
      const sid = student.id || student.studentProfileId || student.Id;
      const result = resultMap[sid];
      if (!result) { failed++; continue; }
      try {
        const res = await adminAPI.results.updateTeacherComment(result.id || result.Id, {
          teacherComment: comments[sid] || '',
          behaviorComment: behaviorComments[sid] || '',
        });
        if (res.data?.success) saved++;
        else failed++;
      } catch { failed++; }
    }
    setSaving(false);
    setSnackbar({ open: true, message: `Saved ${saved} comment(s)` + (failed ? `, ${failed} failed` : '') });
  };

  if (loading && !selectedClassId) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/teacher-dashboard')}
          sx={{ color: '#1B5E20' }}>Back</Button>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#1B5E20' }}>
          Student Report Comments
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Class</InputLabel>
                <Select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)} label="Class">
                  <MenuItem value="">Select Class</MenuItem>
                  {classes.map(c => (
                    <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Term</InputLabel>
                <Select value={selectedTermId} onChange={(e) => setSelectedTermId(e.target.value)} label="Term">
                  <MenuItem value="">Select Term</MenuItem>
                  {terms.map(t => (
                    <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {loading && selectedClassId && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <LinearProgress sx={{ mb: 1 }} />
          <Typography variant="body2" color="text.secondary">{progress}</Typography>
        </Box>
      )}

      {!loading && selectedClassId && students.length === 0 && (
        <Alert severity="info">No students found in this class.</Alert>
      )}

      {!loading && students.length > 0 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button variant="contained" startIcon={<Save />} onClick={handleSaveAll} disabled={saving}
              sx={{ bgcolor: '#2E7D32', '&:hover': { bgcolor: '#1B5E20' } }}>
              {saving ? 'Saving...' : 'Save All Comments'}
            </Button>
          </Box>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#E8F5E9' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Student</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Percentage</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Grade</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Academic Comment</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Behavior Comment</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map(student => {
                  const sid = student.id || student.studentProfileId || student.Id;
                  const result = resultMap[sid];
                  const percentage = result?.overallPercentage ?? result?.OverallPercentage ?? 0;
                  const gradeLetter = result?.overallGradeLetter ?? result?.OverallGradeLetter ?? '-';
                  const category = getCommentCategory(percentage);
                  const commentOptions = ACADEMIC_COMMENTS[category];

                  return (
                    <TableRow key={sid}>
                      <TableCell>
                        {student.firstName || student.user?.firstName} {student.lastName || student.user?.lastName}
                      </TableCell>
                      <TableCell>
                        {percentage > 0 ? (
                          <Chip label={`${Math.round(percentage)}%`}
                            color={percentage >= 70 ? 'success' : percentage >= 50 ? 'warning' : 'error'} size="small" />
                        ) : (
                          <Chip label="No result" size="small" variant="outlined" />
                        )}
                      </TableCell>
                      <TableCell>{gradeLetter}</TableCell>
                      <TableCell sx={{ minWidth: 300 }}>
                        <FormControl fullWidth size="small">
                          <Select
                            value={comments[sid] || ''}
                            onChange={(e) => setComments({ ...comments, [sid]: e.target.value })}
                            displayEmpty
                          >
                            <MenuItem value=""><em>Select comment</em></MenuItem>
                            {commentOptions.map((text, i) => (
                              <MenuItem key={i} value={text}>{text}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell sx={{ minWidth: 300 }}>
                        <FormControl fullWidth size="small">
                          <Select
                            value={behaviorComments[sid] || ''}
                            onChange={(e) => setBehaviorComments({ ...behaviorComments, [sid]: e.target.value })}
                            displayEmpty
                          >
                            <MenuItem value=""><em>Select behavior</em></MenuItem>
                            {BEHAVIOR_COMMENTS.map((text, i) => (
                              <MenuItem key={i} value={text}>{text}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell align="center">
                        <Button size="small" variant="outlined" startIcon={<Save />}
                          onClick={() => handleSave(sid)}
                          disabled={saving || !result}
                          sx={{ borderColor: '#4CAF50', color: '#2E7D32' }}>
                          Save
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ open: false, message: '' })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message={snackbar.message}
        sx={{ '& .MuiSnackbarContent-root': { bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 600 } }} />
    </Box>
  );
};

export default TeacherComments;
