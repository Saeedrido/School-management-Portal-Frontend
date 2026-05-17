import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Button, TextField, Grid, MenuItem, IconButton,
  Alert, Dialog, DialogTitle, DialogContent, DialogActions, Chip,
  Accordion, AccordionSummary, AccordionDetails, Divider, CircularProgress,
} from '@mui/material';
import { Add, Edit, Delete, ArrowBack, ExpandMore, CheckCircle, Quiz, Description } from '@mui/icons-material';
import { PageHeader } from '../../components/ui';
import { entranceExamAPI } from '../../services/api';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

const OPTION_KEYS = ['A', 'B', 'C', 'D'];

const EntranceExamQuestions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputId = 'entrance-docx-upload-input';

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, index: null });
  const [uploadFormatDialog, setUploadFormatDialog] = useState(false);
  const [uploadingDocx, setUploadingDocx] = useState(false);

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await entranceExamAPI.getById(id);
      if (res.data?.success) {
        setExam(res.data.data);
        setQuestions(res.data.data.questions || []);
      } else setError(res.data?.message || 'Failed to load');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const resetCurrentQuestion = () => {
    setCurrentQuestion({
      questionText: '', marks: 1, correctOptionKey: 'A',
      options: OPTION_KEYS.map(k => ({ key: k, value: '' })),
      subject: '', explanation: '',
    });
    setEditingIndex(null);
  };

  const handleAddQuestion = () => {
    resetCurrentQuestion();
  };

  const handleEditQuestion = (index) => {
    const q = questions[index];
    const options = OPTION_KEYS.map(k => {
      const existing = q.options?.find(o => o.key === k);
      return { key: k, value: existing?.value || '' };
    });
    setCurrentQuestion({
      questionText: q.questionText, marks: q.marks, correctOptionKey: q.correctOptionKey || 'A',
      options, subject: q.subject || '', explanation: q.explanation || '',
    });
    setEditingIndex(index);
  };

  const handleSaveQuestion = async () => {
    if (!currentQuestion.questionText.trim()) { setError('Question text is required'); return; }
    const emptyOptions = currentQuestion.options.filter(o => !o.value.trim());
    if (emptyOptions.length > 0) { setError('All option fields must have a value'); return; }
    if (currentQuestion.marks < 1) { setError('Marks must be at least 1'); return; }

    const payload = {
      questionText: currentQuestion.questionText,
      marks: currentQuestion.marks,
      correctOptionKey: currentQuestion.correctOptionKey,
      options: currentQuestion.options,
      subject: currentQuestion.subject,
      explanation: currentQuestion.explanation,
    };

    try {
      if (editingIndex !== null) {
        const questionId = questions[editingIndex].id;
        const res = await entranceExamAPI.updateQuestion(questionId, payload);
        if (res.data?.success) {
          setSuccess('Question updated successfully!');
          setCurrentQuestion(null);
          setEditingIndex(null);
          loadData();
        } else setError(res.data?.message || 'Failed to update');
      } else {
        const res = await entranceExamAPI.addQuestion(id, payload);
        if (res.data?.success) {
          setSuccess('Question added successfully!');
          setCurrentQuestion(null);
          loadData();
        } else setError(res.data?.message || 'Failed to add');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    }
  };

  const handleDeleteClick = (index) => {
    setDeleteDialog({ open: true, index });
  };

  const handleDeleteConfirm = async () => {
    try {
      const questionId = questions[deleteDialog.index].id;
      const res = await entranceExamAPI.deleteQuestion(questionId);
      if (res.data?.success) {
        setSuccess('Question deleted');
        setDeleteDialog({ open: false, index: null });
        loadData();
      } else setError(res.data?.message || 'Failed to delete');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleUploadClick = () => {
    setUploadFormatDialog(true);
  };

  const handleUploadConfirm = () => {
    setUploadFormatDialog(false);
    setTimeout(() => {
      const fileInput = document.getElementById(fileInputId);
      if (fileInput) fileInput.click();
    }, 300);
  };

  const handleOptionChange = (optionIndex, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[optionIndex] = { ...newOptions[optionIndex], value };
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#E8F5E9' }}>
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 3, md: 4 }, gap: 2, flexDirection: { xs: 'column', sm: 'row' }, textAlign: { xs: 'center', sm: 'left' } }}>
          <IconButton onClick={() => navigate(`/admin-dashboard/entrance-exams/${id}`)} sx={{ color: 'text.primary' }}>
            <ArrowBack />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}>
              {exam?.title || 'Entrance Exam'} - Questions
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Create and manage entrance exam questions
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Chip label={`${questions.length} Questions`} sx={{ background: 'rgba(111, 175, 143, 0.2)', color: '#2E7D32', fontWeight: 600 }} />
            <Chip label={`${totalMarks} Total Marks`} sx={{ background: 'rgba(33, 150, 243, 0.2)', color: '#1565C0', fontWeight: 600 }} />
          </Box>
        </Box>

        {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 3 }}>{success}</Alert>}

        {/* Question Editor */}
        {currentQuestion && (
          <Card sx={{ mb: 4, background: '#C8E6C9', border: '1px solid rgba(111, 175, 143, 0.3)', borderRadius: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#2E7D32', mb: 3 }}>
                {editingIndex !== null ? 'Edit Question' : 'Add New Question'}
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth label="Subject/Category" value={currentQuestion.subject}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, subject: e.target.value })}
                    placeholder="e.g. Mathematics, English"
                    sx={{ '& .MuiOutlinedInput-root': { color: '#1B5E20', backgroundColor: 'rgba(255,255,255,0.7)' } }} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth required multiline rows={3} label="Question Text *"
                    value={currentQuestion.questionText}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, questionText: e.target.value })}
                    placeholder="Enter your question here..."
                    sx={{ '& .MuiOutlinedInput-root': { color: '#1B5E20', backgroundColor: 'rgba(255,255,255,0.7)' } }} />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ color: '#2E7D32', mb: 2, fontWeight: 600 }}>Answer Options</Typography>
                  <Grid container spacing={2}>
                    {currentQuestion.options.map((opt, i) => (
                      <Grid item xs={12} sm={6} key={opt.key}>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <TextField fullWidth label={`Option ${opt.key}`} value={opt.value}
                            onChange={(e) => handleOptionChange(i, e.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { color: '#1B5E20', backgroundColor: 'rgba(255,255,255,0.7)' } }} />
                          <Button variant={currentQuestion.correctOptionKey === opt.key ? 'contained' : 'outlined'} size="small"
                            onClick={() => setCurrentQuestion({ ...currentQuestion, correctOptionKey: opt.key })}
                            sx={currentQuestion.correctOptionKey === opt.key
                              ? { bgcolor: '#2E7D32', color: '#fff', '&:hover': { bgcolor: '#1B5E20' }, minWidth: 40 }
                              : { borderColor: '#4CAF50', color: '#2E7D32', minWidth: 40 }}>
                            {currentQuestion.correctOptionKey === opt.key ? <CheckCircle fontSize="small" /> : '✓'}
                          </Button>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth type="number" label="Marks *" value={currentQuestion.marks}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, marks: parseInt(e.target.value) || 0 })}
                    inputProps={{ min: 1 }}
                    sx={{ '& .MuiOutlinedInput-root': { color: '#1B5E20', backgroundColor: 'rgba(255,255,255,0.7)' } }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth select label="Correct Answer" value={currentQuestion.correctOptionKey}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctOptionKey: e.target.value })}
                    sx={{ '& .MuiOutlinedInput-root': { color: '#1B5E20', backgroundColor: 'rgba(255,255,255,0.7)' } }}>
                    {OPTION_KEYS.map(k => <MenuItem key={k} value={k}>Option {k}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth multiline rows={2} label="Explanation (Optional)" value={currentQuestion.explanation}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })}
                    placeholder="Explain why this is the correct answer..."
                    sx={{ '& .MuiOutlinedInput-root': { color: '#1B5E20', backgroundColor: 'rgba(255,255,255,0.7)' } }} />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button variant="outlined" onClick={() => { setCurrentQuestion(null); setEditingIndex(null); }}
                      sx={{ borderColor: '#4CAF50', color: '#2E7D32' }}>Cancel</Button>
                    <Button variant="contained" startIcon={<Add />} onClick={handleSaveQuestion}
                      sx={{ bgcolor: '#2E7D32', '&:hover': { bgcolor: '#1B5E20' } }}>
                      {editingIndex !== null ? 'Update Question' : 'Add Question'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Hidden File Input */}
        <input id={fileInputId} accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          style={{ display: 'none' }} type="file"
          onChange={async (event) => {
            const file = event.target.files[0];
            if (!file) return;
            setUploadingDocx(true);
            const formData = new FormData();
            formData.append('File', file);
            try {
              const res = await entranceExamAPI.uploadDocx(id, formData);
              if (res.data?.success) {
                loadData();
                setSuccess('Questions uploaded successfully!');
                if (res.data.data?.validationErrors?.length > 0) {
                  setError('Uploaded with warnings: ' + res.data.data.validationErrors.join('; '));
                }
              } else setError(res.data?.message || 'Failed to upload questions');
            } catch (err) {
              setError(err.response?.data?.message || 'Failed to upload');
            } finally {
              setUploadingDocx(false);
              event.target.value = '';
            }
          }} />

        {/* Questions List */}
        {questions.length > 0 && (
          <Card sx={{ mb: 4, background: '#C8E6C9', border: '1px solid rgba(111, 175, 143, 0.3)', borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1B5E20' }}>Questions ({questions.length})</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button variant="outlined" startIcon={uploadingDocx ? <CircularProgress size={18} /> : <Description />}
                    onClick={handleUploadClick} disabled={uploadingDocx}
                    sx={{ borderColor: '#4CAF50', color: '#2E7D32' }}>
                    {uploadingDocx ? 'Uploading...' : 'Upload DOCX'}
                  </Button>
                  <Button variant="contained" startIcon={<Add />} onClick={handleAddQuestion}
                    sx={{ bgcolor: '#2E7D32', '&:hover': { bgcolor: '#1B5E20' } }}>
                    Add Question
                  </Button>
                </Box>
              </Box>

              {questions.map((q, index) => (
                <Accordion key={q.id} sx={{ background: '#C8E6C9', borderRadius: 2, mb: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  '&:before': { display: 'none' }, '&.Mui-expanded': { my: 1 } }}>
                  <AccordionSummary expandIcon={<ExpandMore sx={{ color: '#1B5E20', fontSize: '1.5rem' }} />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Chip label={`Q${index + 1}`} size="small" sx={{ background: '#4CAF50', color: '#fff', fontWeight: 600 }} />
                      {q.subject && <Chip label={q.subject} size="small" sx={{ background: '#E8F5E9', color: '#1B5E20', fontWeight: 600 }} />}
                      <Chip label={`${q.marks} marks`} size="small" sx={{ background: 'rgba(102, 187, 106, 0.2)', color: '#2E7D32' }} />
                    </Box>
                    <Typography variant="body2" sx={{ color: '#1B5E20', flex: 1, ml: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: { xs: 'none', md: 'block' } }}>
                      {q.questionText}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ bgcolor: '#C8E6C9' }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body1" sx={{ color: '#1B5E20', fontWeight: 500, mb: 2 }}>{q.questionText}</Typography>
                      <Grid container spacing={1} sx={{ mb: 2 }}>
                        {(q.options || []).map((opt, optIndex) => (
                          <Grid item xs={12} sm={6} key={optIndex}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, borderRadius: 1,
                              background: opt.key === q.correctOptionKey ? 'rgba(102, 187, 106, 0.2)' : 'rgba(0, 0, 0, 0.05)',
                              border: opt.key === q.correctOptionKey ? '1px solid #4CAF50' : '1px solid rgba(0, 0, 0, 0.1)' }}>
                              <Typography variant="body2" sx={{ color: '#1B5E20', minWidth: 24, fontWeight: 600 }}>{opt.key}.</Typography>
                              <Typography variant="body2" sx={{ color: opt.key === q.correctOptionKey ? '#2E7D32' : '#1B5E20', fontWeight: opt.key === q.correctOptionKey ? 600 : 400, flex: 1 }}>
                                {opt.value}
                              </Typography>
                              {opt.key === q.correctOptionKey && <CheckCircle sx={{ color: '#4CAF50', fontSize: 18 }} />}
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                      {q.explanation && (
                        <Box sx={{ mt: 2, p: 2, background: 'rgba(255, 193, 7, 0.1)', border: '1px solid rgba(255, 193, 7, 0.3)', borderRadius: 1 }}>
                          <Typography variant="body2" sx={{ color: '#1B5E20' }}><strong>Explanation:</strong> {q.explanation}</Typography>
                        </Box>
                      )}
                    </Box>
                    <Divider sx={{ mb: 2, borderColor: 'rgba(0, 0, 0, 0.15)' }} />
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button variant="outlined" size="small" startIcon={<Edit />} onClick={() => handleEditQuestion(index)}
                        sx={{ borderColor: '#4CAF50', color: '#2E7D32' }}>Edit</Button>
                      <Button variant="outlined" size="small" startIcon={<Delete />} onClick={() => handleDeleteClick(index)}
                        sx={{ borderColor: '#C62828', color: '#C62828' }}>Delete</Button>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {questions.length === 0 && !currentQuestion && (
          <Card sx={{ mb: 4, background: '#C8E6C9', border: '1px solid rgba(111, 175, 143, 0.3)', borderRadius: 3 }}>
            <CardContent sx={{ p: 6, textAlign: 'center' }}>
              <Quiz sx={{ fontSize: 60, color: 'rgba(0, 0, 0, 0.3)', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#1B5E20', mb: 2 }}>No Questions Yet</Typography>
              <Typography variant="body1" sx={{ color: 'rgba(0, 0, 0, 0.6)', mb: 3 }}>Start building your exam by adding questions</Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button variant="contained" startIcon={<Add />} onClick={handleAddQuestion}
                  sx={{ bgcolor: '#2E7D32', '&:hover': { bgcolor: '#1B5E20' } }}>Add First Question</Button>
                <Button variant="outlined" startIcon={uploadingDocx ? <CircularProgress size={18} /> : <Description />}
                  onClick={handleUploadClick} disabled={uploadingDocx}
                  sx={{ borderColor: '#4CAF50', color: '#2E7D32' }}>
                  {uploadingDocx ? 'Uploading...' : 'Upload DOCX'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Add Question Button (when not editing) */}
        {questions.length > 0 && !currentQuestion && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button variant="outlined" startIcon={<Add />} onClick={handleAddQuestion} size="large"
              sx={{ borderColor: '#4CAF50', color: '#2E7D32', fontSize: '1rem', py: 1.5, px: 4 }}>
              Add Another Question
            </Button>
          </Box>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, index: null })}>
          <DialogTitle><Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><Delete sx={{ color: '#C62828' }} /><Typography variant="h6">Delete Question</Typography></Box></DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete Question {deleteDialog.index + 1}? This action cannot be undone.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false, index: null })}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} sx={{ bgcolor: '#C62828', color: '#fff', '&:hover': { bgcolor: '#B71C1C' } }}>Delete</Button>
          </DialogActions>
        </Dialog>

        {/* Upload Format Dialog */}
        <Dialog open={uploadFormatDialog} onClose={() => setUploadFormatDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 600, color: '#2E7D32' }}>Question Upload Format</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2, color: 'rgba(0,0,0,0.7)' }}>Please format your document as follows:</Typography>
            <Box component="pre" sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, fontSize: '0.75rem', overflow: 'auto', color: '#333' }}>
{`General Knowledge
1. What is 2+2?
a) 3
b) 4
c) 5
d) 6
Answer: b
Marks: 2
Explanation: Basic addition

Mathematics
2. Which is a fruit?
a) Carrot
b) Apple
c) Potato
d) Celery
Answer: b
Marks: 1`}
            </Box>
            <Typography variant="body2" sx={{ mt: 2, color: 'rgba(0,0,0,0.7)' }}><strong>Rules:</strong></Typography>
            <ul style={{ margin: '8px 0', paddingLeft: '20px', color: 'rgba(0,0,0,0.7)', fontSize: '0.875rem' }}>
              <li>Put subject/category on its own line before questions (e.g. "Mathematics", "English")</li>
              <li>Each question starts with a number followed by a dot (1., 2., etc.)</li>
              <li>Options use letters followed by a dot or parenthesis (a. or a))</li>
              <li>Specify the correct answer with "Answer: " followed by the option letter</li>
              <li>Add "Marks: " to specify points (default is 1 if not specified)</li>
              <li>Add "Explanation: " for optional explanation</li>
              <li>Maximum 200 questions per upload</li>
            </ul>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setUploadFormatDialog(false)} variant="outlined" sx={{ borderColor: '#4CAF50', color: '#2E7D32' }}>Cancel</Button>
            <Button onClick={handleUploadConfirm} variant="contained" sx={{ bgcolor: '#2E7D32', '&:hover': { bgcolor: '#1B5E20' } }}>OK - Upload File</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default EntranceExamQuestions;
