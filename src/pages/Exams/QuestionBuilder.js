import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  MenuItem,
  IconButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  useTheme,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Add,
  Delete,
  Edit,
  ExpandMore,
  CheckCircle,
  DragIndicator,
  Quiz,
  Description,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { enumToExamType } from '../../utils/dataMapping';

const QUESTION_TYPES = [
  { value: 'Objective', label: 'Multiple Choice', icon: <Quiz /> },
  { value: 'Theory', label: 'Essay/Theory', icon: <Description /> },
];

const DIFFICULTY_LEVELS = ['Easy', 'Medium', 'Hard'];

const QuestionBuilder = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { examId } = useParams();
  const { user } = useAuth();
  const basePath = user?.role === 'Admin' ? '/admin-dashboard' : '/teacher-dashboard';
  const isEditing = Boolean(examId);

  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, index: null });
  const [examInfo, setExamInfo] = useState({
    title: isEditing ? 'Mid-Term Mathematics Examination' : '',
    type: 'Objective',
    status: '',
    hasStarted: false,
  });

  // Load existing questions and exam info
  useEffect(() => {
    const fetchExamInfo = async () => {
      try {
        const response = await api.get(`/api/exams/${examId}`);
        if (response.data?.success && response.data?.data) {
          const exam = response.data.data;
          setExamInfo({
            title: exam.title,
            type: enumToExamType(exam.examType),
            status: exam.status,
            hasStarted: exam.hasStarted || exam.status === 'Started',
          });
          
          // Check if exam has started - if so, show warning
          if (exam.hasStarted || exam.status === 'Started') {
            setError('This exam has already started. Questions cannot be edited while students are taking the exam.');
          }
        }
      } catch (err) {
        console.error('Failed to fetch exam info:', err);
      }
    };

    const fetchQuestions = async () => {
      try {
        const response = await api.get(`/api/questions/exam/${examId}`);
        if (response.data?.success && response.data?.data) {
          // Map backend questions to frontend format
          const mappedQuestions = response.data.data.map(q => {
            const isObjective = (q.options && q.options.length > 0) && (q.options.length > 1 || q.options[0].value !== "True/False");
            const mappedQ = {
              id: q.id,
              type: isObjective ? 'Objective' : 'Theory',
              question: q.questionText,
              marks: q.marks || 1,
              explanation: q.explanation || '',
              difficulty: 'Medium', // We don't have this in DTO, fallback to Medium
              modelAnswer: '',
            };

            if (isObjective) {
              mappedQ.options = q.options.map(opt => opt.value);
              const correctOpt = q.options.find(opt => opt.isCorrect);
              mappedQ.correctAnswer = correctOpt ? correctOpt.value : '';
            } else {
              // Assume theory answers might be in explanation or options if structured differently
              mappedQ.modelAnswer = q.explanation || '';
            }

            return mappedQ;
          });
          setQuestions(mappedQuestions);
        }
      } catch (err) {
        console.error('Failed to fetch questions:', err);
        setError('Failed to load existing questions.');
      }
    };

    if (isEditing) {
      fetchExamInfo();
      fetchQuestions();
    }
  }, [examId, isEditing]);

  const resetCurrentQuestion = () => {
    setCurrentQuestion({
      type: 'Objective',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      marks: 1,
      difficulty: 'Medium',
      explanation: '',
      modelAnswer: '',
    });
    setEditingIndex(null);
  };

  const handleAddQuestion = () => {
    resetCurrentQuestion();
  };

  const handleEditQuestion = (index) => {
    const question = questions[index];
    setCurrentQuestion({ ...question });
    setEditingIndex(index);
  };

  const handleSaveQuestion = async () => {
    // Validate question
    if (!currentQuestion.question.trim()) {
      setError('Question text is required');
      return;
    }

    if (currentQuestion.type === 'Objective') {
      const validOptions = currentQuestion.options.filter((opt) => opt.trim());
      if (validOptions.length < 2) {
        setError('At least 2 options are required for multiple choice questions');
        return;
      }
      if (!currentQuestion.correctAnswer) {
        setError('Please select the correct answer');
        return;
      }
    } else {
      if (!currentQuestion.modelAnswer.trim()) {
        setError('Model answer is required for theory questions');
        return;
      }
    }

    if (currentQuestion.marks < 1) {
      setError('Marks must be at least 1');
      return;
    }

    const dto = {
      questionText: currentQuestion.question,
      marks: currentQuestion.marks,
      questionNumber: (editingIndex !== null ? editingIndex + 1 : questions.length + 1),
      explanation: currentQuestion.type === 'Objective' ? currentQuestion.explanation : currentQuestion.modelAnswer,
      options: currentQuestion.type === 'Objective' ? currentQuestion.options.filter(o => o.trim()).map((opt, i) => ({
        key: String.fromCharCode(65 + i),
        value: opt,
        isCorrect: currentQuestion.correctAnswer === opt
      })) : [
        { key: "A", value: "True/False", isCorrect: true } // Dummy option required by backed for theory, this depends on actual format backend uses for theory but using default true/false
      ]
    };

    try {
      if (editingIndex !== null) {
        // Update existing question
        const questionId = questions[editingIndex].id;
        const response = await api.put(`/api/questions/${questionId}`, dto);
        if (response.data?.success) {
          const updatedQuestions = [...questions];
          updatedQuestions[editingIndex] = {
            ...currentQuestion,
            id: questionId,
          };
          setQuestions(updatedQuestions);
          setSuccess('Question updated successfully!');
        } else {
          setError(response.data?.message || 'Failed to update question');
          return;
        }
      } else {
        // Add new question
        const response = await api.post(`/api/exams/${examId}/questions`, dto);
        if (response.data?.success) {
          setQuestions([
            ...questions,
            {
              ...currentQuestion,
              id: response.data.data.id,
            },
          ]);
          setSuccess('Question added successfully!');
        } else {
          setError(response.data?.message || 'Failed to add question');
          return;
        }
      }

      setCurrentQuestion(null);
      setEditingIndex(null);
      setError('');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save question', err);
      setError('An error occurred while saving the question. Please try again.');
    }
  };

  const handleDeleteClick = (index) => {
    setDeleteDialog({ open: true, index });
  };

  const handleDeleteConfirm = async () => {
    try {
      const questionId = questions[deleteDialog.index].id;
      const response = await api.delete(`/api/questions/${questionId}`);

      if (response.data?.success) {
        const updatedQuestions = questions.filter((_, i) => i !== deleteDialog.index);
        setQuestions(updatedQuestions);
        setSuccess('Question deleted successfully!');
      } else {
        setError(response.data?.message || 'Failed to delete question');
      }
    } catch (err) {
      console.error('Failed to delete question', err);
      setError('An error occurred while deleting the question.');
    } finally {
      setDeleteDialog({ open: false, index: null });
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const handleOptionChange = (optionIndex, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[optionIndex] = value;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const handleAddOption = () => {
    setCurrentQuestion({
      ...currentQuestion,
      options: [...currentQuestion.options, ''],
    });
  };

  const handleRemoveOption = (optionIndex) => {
    const newOptions = currentQuestion.options.filter((_, i) => i !== optionIndex);
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const handleSaveExam = () => {
    if (questions.length === 0) {
      setError('Add at least one question before saving');
      return;
    }

    // Simulate API call
    console.log('Saving exam with questions:', questions);
    setSuccess('Exam saved successfully!');

    setTimeout(() => {
      navigate('/dashboard/exams');
    }, 2000);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return { bgcolor: '#E8F5E9', color: '#2E7D32' };
      case 'Medium':
        return { bgcolor: '#FFF3E0', color: '#F57C00' };
      case 'Hard':
        return { bgcolor: '#FFEBEE', color: '#C62828' };
      default:
        return { bgcolor: '#F5F5F5', color: '#757575' };
    }
  };

  const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(180deg, #0a192f 0%, #0d1b2a 40%, #000000 100%)'
          : 'background.default',
      }}
    >
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 3, md: 4 }, gap: 2, flexDirection: { xs: 'column', sm: 'row' }, textAlign: { xs: 'center', sm: 'left' } }}>
          <IconButton
            onClick={() => navigate('/dashboard/exams')}
            sx={{ color: 'text.primary' }}
          >
            <ArrowBack />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' },
              }}
            >
              {isEditing ? 'Edit Questions' : 'Question Builder'}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary' }}
            >
              {examInfo.title || 'Create and manage exam questions'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            {examInfo.status && (
              <Chip
                label={examInfo.status}
                sx={{
                  background: examInfo.status === 'Started' ? 'rgba(255, 152, 0, 0.2)' : 
                              examInfo.status === 'Completed' ? 'rgba(76, 175, 80, 0.2)' : 
                              'rgba(33, 150, 243, 0.2)',
                  color: examInfo.status === 'Started' ? '#FF9800' : 
                         examInfo.status === 'Completed' ? '#4CAF50' : 
                         '#2196F3',
                  fontWeight: 600,
                }}
              />
            )}
            <Chip
              label={`${questions.length} Questions`}
              sx={{
                background: 'rgba(255, 62, 138, 0.2)',
                color: '#FF3E8A',
                fontWeight: 600,
              }}
            />
            <Chip
              label={`${totalMarks} Total Marks`}
              sx={{
                background: 'rgba(33, 150, 243, 0.2)',
                color: '#2196F3',
                fontWeight: 600,
              }}
            />
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Success Alert */}
        {success && (
          <Alert severity="success" onClose={() => setSuccess(false)} sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {/* Question Editor */}
        {currentQuestion && (
          <Card
            sx={{
              mb: 4,
              background: 'rgba(17, 17, 17, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 62, 138, 0.3)',
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: '#FF3E8A',
                  mb: 3,
                }}
              >
                {editingIndex !== null ? 'Edit Question' : 'Add New Question'}
              </Typography>

              <Grid container spacing={3}>
                {/* Question Type */}
                <Grid item xs={12}>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}
                  >
                    Question Type
                  </Typography>
                  <ToggleButtonGroup
                    value={currentQuestion.type}
                    exclusive
                    onChange={(e, newType) => {
                      if (newType) {
                        setCurrentQuestion({ ...currentQuestion, type: newType });
                      }
                    }}
                    sx={{ mb: 2 }}
                  >
                    {QUESTION_TYPES.map((type) => (
                      <ToggleButton
                        key={type.value}
                        value={type.value}
                        sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          '&.Mui-selected': {
                            background: '#FF3E8A',
                            color: '#ffffff',
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {type.icon}
                          {type.label}
                        </Box>
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                </Grid>

                {/* Question Text */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Question *"
                    multiline
                    rows={3}
                    value={currentQuestion.question}
                    onChange={(e) =>
                      setCurrentQuestion({
                        ...currentQuestion,
                        question: e.target.value,
                      })
                    }
                    placeholder="Enter your question here..."
                    sx={{
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.7)',
                      },
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#FF3E8A',
                        },
                      },
                    }}
                  />
                </Grid>

                {/* Options for Objective Questions */}
                {currentQuestion.type === 'Objective' && (
                  <Grid item xs={12}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        mb: 2,
                        fontWeight: 600,
                      }}
                    >
                      Answer Options
                    </Typography>
                    <Grid container spacing={2}>
                      {currentQuestion.options.map((option, index) => (
                        <Grid item xs={12} sm={6} key={index}>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <TextField
                              fullWidth
                              label={`Option ${String.fromCharCode(65 + index)}`}
                              value={option}
                              onChange={(e) => handleOptionChange(index, e.target.value)}
                              sx={{
                                '& .MuiInputLabel-root': {
                                  color: 'rgba(255, 255, 255, 0.7)',
                                },
                              }}
                            />
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveOption(index)}
                              disabled={currentQuestion.options.length <= 2}
                              sx={{ color: '#ff6b6b' }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                            <Button
                              variant={
                                currentQuestion.correctAnswer === option
                                  ? 'contained'
                                  : 'outlined'
                              }
                              size="small"
                              onClick={() =>
                                setCurrentQuestion({
                                  ...currentQuestion,
                                  correctAnswer: option,
                                })
                              }
                              sx={{
                                ...(currentQuestion.correctAnswer === option && {
                                  background: '#66BB6A',
                                  '&:hover': {
                                    background: '#57A75A',
                                  },
                                }),
                                ...(currentQuestion.correctAnswer !== option && {
                                  borderColor: 'rgba(255, 255, 255, 0.3)',
                                  color: 'rgba(255, 255, 255, 0.7)',
                                }),
                              }}
                            >
                              {currentQuestion.correctAnswer === option ? (
                                <CheckCircle fontSize="small" />
                              ) : (
                                'Mark Correct'
                              )}
                            </Button>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                    <Button
                      startIcon={<Add />}
                      onClick={handleAddOption}
                      disabled={currentQuestion.options.length >= 6}
                      sx={{
                        mt: 2,
                        color: '#FF3E8A',
                        borderColor: '#FF3E8A',
                      }}
                    >
                      Add Option
                    </Button>
                  </Grid>
                )}

                {/* Model Answer for Theory Questions */}
                {currentQuestion.type === 'Theory' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Model Answer *"
                      multiline
                      rows={4}
                      value={currentQuestion.modelAnswer}
                      onChange={(e) =>
                        setCurrentQuestion({
                          ...currentQuestion,
                          modelAnswer: e.target.value,
                        })
                      }
                      placeholder="Enter the ideal/model answer for this question..."
                      helperText="This will be used as reference when grading"
                      sx={{
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255, 255, 255, 0.7)',
                        },
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#FF3E8A',
                          },
                        },
                      }}
                    />
                  </Grid>
                )}

                {/* Marks and Difficulty */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Marks *"
                    value={currentQuestion.marks}
                    onChange={(e) =>
                      setCurrentQuestion({
                        ...currentQuestion,
                        marks: parseInt(e.target.value) || 0,
                      })
                    }
                    inputProps={{ min: 1 }}
                    sx={{
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.7)',
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Difficulty Level"
                    value={currentQuestion.difficulty}
                    onChange={(e) =>
                      setCurrentQuestion({
                        ...currentQuestion,
                        difficulty: e.target.value,
                      })
                    }
                    sx={{
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.7)',
                      },
                    }}
                  >
                    {DIFFICULTY_LEVELS.map((level) => (
                      <MenuItem key={level} value={level}>
                        {level}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Explanation (Optional) */}
                {currentQuestion.type === 'Objective' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Explanation (Optional)"
                      multiline
                      rows={2}
                      value={currentQuestion.explanation}
                      onChange={(e) =>
                        setCurrentQuestion({
                          ...currentQuestion,
                          explanation: e.target.value,
                        })
                      }
                      placeholder="Explain why this is the correct answer..."
                      sx={{
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255, 255, 255, 0.7)',
                        },
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#FF3E8A',
                          },
                        },
                      }}
                    />
                  </Grid>
                )}

                {/* Action Buttons */}
                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 2,
                      justifyContent: 'flex-end',
                      mt: 2,
                    }}
                  >
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setCurrentQuestion(null);
                        setEditingIndex(null);
                      }}
                      sx={{
                        color: '#ffffff',
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleSaveQuestion}
                      sx={{
                        background: '#FF3E8A',
                        '&:hover': {
                          background: '#FF5DA3',
                        },
                      }}
                    >
                      {editingIndex !== null ? 'Update Question' : 'Add Question'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Questions List */}
        {questions.length > 0 && (
          <Card
            sx={{
              background: 'rgba(17, 17, 17, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 3,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: '#ffffff',
                  }}
                >
                  Questions ({questions.length})
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <input
                    accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    style={{ display: 'none' }}
                    id="raised-button-file"
                    type="file"
                    onChange={async (event) => {
                      const file = event.target.files[0];
                      if (!file) return;

                      const formData = new FormData();
                      formData.append('File', file);

                      try {
                        const response = await api.post(`/api/exams/${examId}/questions/upload`, formData, {
                          headers: { 'Content-Type': 'multipart/form-data' },
                        });

                        if (response.data?.success) {
                          // Fetch all questions again to ensure we have the latest list
                          const fetchResponse = await api.get(`/api/questions/exam/${examId}`);
                          if (fetchResponse.data?.success && fetchResponse.data?.data) {
                            const mappedQuestions = fetchResponse.data.data.map(q => {
                              const isObjective = (q.options && q.options.length > 0) && (q.options.length > 1 || q.options[0].value !== "True/False");
                              const mappedQ = {
                                id: q.id,
                                type: isObjective ? 'Objective' : 'Theory',
                                question: q.questionText,
                                marks: q.marks || 1,
                                explanation: q.explanation || '',
                                difficulty: 'Medium',
                                modelAnswer: '',
                              };

                              if (isObjective) {
                                mappedQ.options = q.options.map(opt => opt.value);
                                const correctOpt = q.options.find(opt => opt.isCorrect);
                                mappedQ.correctAnswer = correctOpt ? correctOpt.value : '';
                              } else {
                                mappedQ.modelAnswer = q.explanation || '';
                              }

                              return mappedQ;
                            });
                            setQuestions(mappedQuestions);
                          }
                          setSuccess('Questions uploaded successfully!');
                        } else {
                          setError(response.data?.message || 'Failed to upload questions');
                        }
                      } catch (err) {
                        console.error('Failed to upload document', err);
                        setError('An error occurred during file upload.');
                      }

                      // Reset file input
                      event.target.value = '';
                    }}
                  />
                  <label htmlFor="raised-button-file">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<Description />}
                      disabled={examInfo.hasStarted}
                      sx={{
                        color: examInfo.hasStarted ? '#9e9e9e' : '#FF3E8A',
                        borderColor: examInfo.hasStarted ? '#9e9e9e' : '#FF3E8A',
                      }}
                    >
                      {examInfo.hasStarted ? 'Cannot Upload' : 'Upload DOCX'}
                    </Button>
                  </label>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSaveExam}
                    disabled={examInfo.hasStarted}
                    sx={{
                      background: examInfo.hasStarted ? '#9e9e9e' : '#66BB6A',
                      '&:hover': {
                        background: examInfo.hasStarted ? '#9e9e9e' : '#57A75A',
                      },
                    }}
                  >
                    {examInfo.hasStarted ? 'Cannot Save' : 'Save Exam'}
                  </Button>
                </Box>
              </Box>

              {questions.map((question, index) => (
                <Accordion
                  key={question.id}
                  sx={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    mb: 1,
                    '&:before': {
                      display: 'none',
                    },
                    '&.Mui-expanded': {
                      my: 1,
                    },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMore sx={{ color: '#FF3E8A' }} />}
                    sx={{
                      '& .MuiAccordionSummary-content': {
                        alignItems: 'center',
                      },
                    }}
                  >
                    <DragIndicator
                      sx={{ color: 'rgba(255, 255, 255, 0.3)', mr: 2 }}
                    />
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        flexGrow: 1,
                      }}
                    >
                      <Chip
                        label={`Q${index + 1}`}
                        size="small"
                        sx={{
                          background: '#FF3E8A',
                          color: '#ffffff',
                          fontWeight: 600,
                        }}
                      />
                      <Chip
                        icon={question.type === 'Objective' ? <Quiz fontSize="small" /> : <Description fontSize="small" />}
                        label={question.type}
                        size="small"
                        sx={{
                          background: 'rgba(33, 150, 243, 0.2)',
                          color: '#2196F3',
                        }}
                      />
                      <Chip
                        label={`${question.marks} marks`}
                        size="small"
                        sx={{
                          background: 'rgba(102, 187, 106, 0.2)',
                          color: '#66BB6A',
                        }}
                      />
                      <Chip
                        label={question.difficulty}
                        size="small"
                        {...getDifficultyColor(question.difficulty)}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.8)',
                          flex: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {question.question}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="body1"
                        sx={{
                          color: '#ffffff',
                          fontWeight: 500,
                          mb: 2,
                        }}
                      >
                        {question.question}
                      </Typography>

                      {question.type === 'Objective' && (
                        <Grid container spacing={1} sx={{ mb: 2 }}>
                          {question.options.map(
                            (option, optIndex) =>
                              option.trim() && (
                                <Grid item xs={12} sm={6} key={optIndex}>
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 1,
                                      p: 1,
                                      borderRadius: 1,
                                      background:
                                        option === question.correctAnswer
                                          ? 'rgba(102, 187, 106, 0.1)'
                                          : 'transparent',
                                      border:
                                        option === question.correctAnswer
                                          ? '1px solid #66BB6A'
                                          : '1px solid rgba(255, 255, 255, 0.1)',
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: 'rgba(255, 255, 255, 0.5)',
                                        minWidth: 20,
                                      }}
                                    >
                                      {String.fromCharCode(65 + optIndex)}.
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color:
                                          option === question.correctAnswer
                                            ? '#66BB6A'
                                            : 'rgba(255, 255, 255, 0.7)',
                                        fontWeight:
                                          option === question.correctAnswer
                                            ? 600
                                            : 400,
                                      }}
                                    >
                                      {option}
                                    </Typography>
                                    {option === question.correctAnswer && (
                                      <CheckCircle
                                        sx={{ color: '#66BB6A', ml: 'auto', fontSize: 16 }}
                                      />
                                    )}
                                  </Box>
                                </Grid>
                              )
                          )}
                        </Grid>
                      )}

                      {question.type === 'Theory' && question.modelAnswer && (
                        <Box
                          sx={{
                            p: 2,
                            background: 'rgba(33, 150, 243, 0.05)',
                            border: '1px solid rgba(33, 150, 243, 0.2)',
                            borderRadius: 1,
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{
                              color: '#2196F3',
                              fontWeight: 600,
                              mb: 1,
                            }}
                          >
                            Model Answer:
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                          >
                            {question.modelAnswer}
                          </Typography>
                        </Box>
                      )}

                      {question.explanation && (
                        <Box
                          sx={{
                            mt: 2,
                            p: 2,
                            background: 'rgba(255, 193, 7, 0.05)',
                            border: '1px solid rgba(255, 193, 7, 0.2)',
                            borderRadius: 1,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ color: 'rgba(255, 255, 255, 0.6)' }}
                          >
                            <strong>Explanation:</strong> {question.explanation}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    <Divider sx={{ mb: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button
                        size="small"
                        startIcon={<Edit />}
                        onClick={() => handleEditQuestion(index)}
                        disabled={examInfo.hasStarted}
                        sx={{
                          color: examInfo.hasStarted ? '#9e9e9e' : '#2196F3',
                          borderColor: examInfo.hasStarted ? '#9e9e9e' : '#2196F3',
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        startIcon={<Delete />}
                        onClick={() => handleDeleteClick(index)}
                        disabled={examInfo.hasStarted}
                        sx={{
                          color: examInfo.hasStarted ? '#9e9e9e' : '#ff6b6b',
                          borderColor: examInfo.hasStarted ? '#9e9e9e' : '#ff6b6b',
                        }}
                      >
                        Delete
                      </Button>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {questions.length === 0 && !currentQuestion && (
          <Card
            sx={{
              background: 'rgba(17, 17, 17, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: 6, textAlign: 'center' }}>
              <Quiz sx={{ fontSize: 60, color: 'rgba(255, 255, 255, 0.2)', mb: 2 }} />
              <Typography
                variant="h6"
                sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}
              >
                No Questions Yet
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: 'rgba(255, 255, 255, 0.5)', mb: 3 }}
              >
                Start building your exam by adding questions
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAddQuestion}
                disabled={examInfo.hasStarted}
                sx={{
                  background: examInfo.hasStarted ? '#9e9e9e' : '#FF3E8A',
                  '&:hover': {
                    background: examInfo.hasStarted ? '#9e9e9e' : '#FF5DA3',
                  },
                }}
              >
                {examInfo.hasStarted ? 'Cannot Add - Exam Started' : 'Add First Question'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Add Question Button (when not editing) */}
        {questions.length > 0 && !currentQuestion && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={handleAddQuestion}
              disabled={examInfo.hasStarted}
              size="large"
              sx={{
                color: examInfo.hasStarted ? '#9e9e9e' : '#FF3E8A',
                borderColor: examInfo.hasStarted ? '#9e9e9e' : '#FF3E8A',
                fontSize: '1rem',
                py: 1.5,
                px: 4,
              }}
            >
              {examInfo.hasStarted ? 'Cannot Add - Exam Started' : 'Add Another Question'}
            </Button>
          </Box>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, index: null })}>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Delete sx={{ color: '#ff6b6b' }} />
              <Typography variant="h6">Delete Question</Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete Question {deleteDialog.index + 1}? This action
              cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false, index: null })}>
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              color="error"
              variant="contained"
              autoFocus
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default QuestionBuilder;
