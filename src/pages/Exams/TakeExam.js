import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  TextField,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Timer,
  CheckCircle,
  Warning,
  Quiz,
} from '@mui/icons-material';
import { attemptsAPI, sharedAPI, getErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const TakeExam = () => {
  const navigate = useNavigate();
  const { examId } = useParams();
  const { user } = useAuth();
  
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [questionsLoaded, setQuestionsLoaded] = useState(false);
  const [attemptStarted, setAttemptStarted] = useState(false);
  const [attemptId, setAttemptId] = useState(null);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [isAutoSubmitting, setIsAutoSubmitting] = useState(false);
  
  const timerRef = useRef(null);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        setLoading(true);
        setLoading(false);
      } catch (err) {
        setError(getErrorMessage(err));
        console.error('Error fetching exam:', err);
        setLoading(false);
      }
    };

    fetchExamData();
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [examId, user?.id]);

  useEffect(() => {
    if (questionsLoaded && timeRemaining > 0 && !alreadySubmitted) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            if (!isSubmittingRef.current) {
              isSubmittingRef.current = true;
              handleAutoSubmit();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [questionsLoaded, timeRemaining, alreadySubmitted]);

  const startExam = async () => {
    try {
      console.log('=== START EXAM CLICKED ===');
      console.log('examId:', examId);
      setError('');
      
      console.log('Calling attemptsAPI.start...');
      const response = await attemptsAPI.start({ examId });
      console.log('Start exam response:', response);
      
      if (response.data?.success && response.data?.data) {
        const newAttemptId = response.data.data.id || response.data.data.attemptId;
        setAttemptId(newAttemptId);
        setAttemptStarted(true);
        
        try {
          console.log('Fetching questions for examId:', examId);
          const questionsRes = await sharedAPI.questions.getByExam(examId);
          console.log('Questions response:', questionsRes);
          console.log('Questions data:', questionsRes.data);
          
          if (questionsRes.data) {
            let questionsData = questionsRes.data;
            let questionsList = [];
            
            if (questionsData.data?.questions) {
              questionsList = questionsData.data.questions;
            } else if (Array.isArray(questionsData.data)) {
              questionsList = questionsData.data;
            } else if (questionsData.questions) {
              questionsList = questionsData.questions;
            } else if (Array.isArray(questionsData)) {
              questionsList = questionsData;
            }
            
            console.log('Questions list:', questionsList);
            setQuestions(questionsList);
            
            const examData = questionsData.data || questionsData;
            
            if (examData.durationMinutes) {
              setTimeRemaining(examData.durationMinutes * 60);
              setQuestionsLoaded(true);
            } else if (questionsList.length > 0) {
              setTimeRemaining(60 * 60);
              setQuestionsLoaded(true);
            }
            
            setExam({
              title: examData.title || 'Exam',
              durationMinutes: examData.durationMinutes || 60,
              instructions: examData.instructions || '',
            });
          }
        } catch (qErr) {
          console.error('Error fetching questions:', qErr);
          setError(getErrorMessage(qErr));
        }
      } else {
        setError(getErrorMessage(response));
      }
    } catch (err) {
      setError(getErrorMessage(err));
      console.error('Error starting exam:', err);
    }
  };

  const handleAnswerChange = (questionId, optionId) => {
    setAnswers(prev => {
      const currentAnswers = prev[questionId] || [];
      if (currentAnswers.includes(optionId)) {
        return {
          ...prev,
          [questionId]: currentAnswers.filter(id => id !== optionId)
        };
      } else {
        return {
          ...prev,
          [questionId]: [...currentAnswers, optionId]
        };
      }
    });
  };

  const handleAutoSubmit = useCallback(async () => {
    if (isSubmittingRef.current || !attemptId) return;
    
    setIsAutoSubmitting(true);
    setSubmitting(true);
    
    try {
      const questionAnswers = questions.map(q => ({
        questionId: q.id,
        selectedOptionIds: answers[q.id] || []
      }));

      const submitPayload = {
        attemptId: attemptId,
        questionAnswers: questionAnswers,
      };

      await attemptsAPI.submit(submitPayload);
      
      setAlreadySubmitted(true);
      setSuccess('Time expired! Your exam has been automatically submitted.');
      
      setTimeout(() => {
        navigate('/student-dashboard');
      }, 3000);
      
    } catch (err) {
      console.error('Auto-submit error:', err);
      setError(getErrorMessage(err));
      isSubmittingRef.current = false;
    } finally {
      setSubmitting(false);
      setIsAutoSubmitting(false);
    }
  }, [attemptId, answers, questions, navigate]);

  const handleSubmit = async () => {
    if (isSubmittingRef.current) return;
    
    const confirmed = window.confirm('Are you sure you want to submit your exam? You cannot undo this action.');
    if (!confirmed) return;

    isSubmittingRef.current = true;
    setSubmitting(true);
    setError('');

    try {
      const questionAnswers = questions.map(q => ({
        questionId: q.id,
        selectedOptionIds: answers[q.id] || []
      }));

      const submitPayload = {
        attemptId: attemptId,
        questionAnswers: questionAnswers,
      };

      const response = await attemptsAPI.submit(submitPayload);
      
      if (response.data?.success) {
        setAlreadySubmitted(true);
        setSuccess('Exam submitted successfully!');
        
        setTimeout(() => {
          navigate('/student-dashboard');
        }, 2000);
      } else {
        setError(getErrorMessage(response));
        isSubmittingRef.current = false;
      }
    } catch (err) {
      setError(getErrorMessage(err));
      console.error('Submit error:', err);
      isSubmittingRef.current = false;
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!exam && !attemptStarted) {
    return (
      <Container maxWidth="lg" sx={{ pb: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
          <Warning sx={{ fontSize: 64, color: '#FFA726', mb: 2 }} />
          <Typography variant="h6" gutterBottom sx={{ color: '#1F2937' }}>
            Ready to Start?
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, color: '#4B5563' }}>
            Click the button below to start your exam.<br />
            Once started, the timer cannot be paused.<br />
            The exam will auto-submit when time runs out.
          </Typography>
          
          {error && (
            <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3, textAlign: 'left' }}>
              {error}
            </Alert>
          )}
          
          <Button 
            variant="contained" 
            size="large" 
            onClick={startExam}
            sx={{ 
              px: 4, 
              py: 1.5, 
              fontWeight: 600,
              bgcolor: '#5FAF8F',
              '&:hover': { bgcolor: '#2E8B57' }
            }}
          >
            Start Exam Now
          </Button>
        </Paper>
      </Container>
    );
  }

  if (alreadySubmitted) {
    return (
      <Container maxWidth="sm">
        <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
          <CheckCircle sx={{ fontSize: 80, color: '#5FAF8F', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            {isAutoSubmitting ? 'Time Expired!' : 'Exam Submitted'}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {isAutoSubmitting 
              ? 'Your exam has been automatically submitted due to time expiration.' 
              : 'Your exam has been submitted successfully.'}
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/student-dashboard')}
            sx={{ mt: 2, bgcolor: '#5FAF8F', '&:hover': { bgcolor: '#2E8B57' } }}
          >
            Back to Dashboard
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ pb: 4 }}>
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #5FAF8F 0%, #2E8B57 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {exam?.title || 'Exam'}
            </Typography>
            <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip 
                icon={<Quiz />} 
                label={`${questions.length} Questions`} 
                size="small" 
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
            </Box>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Timer />
              <Typography variant="h4" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                {formatTime(timeRemaining)}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Time Remaining
            </Typography>
            {timeRemaining < 60 && (
              <Typography variant="caption" sx={{ display: 'block', color: '#FFEBEE', fontWeight: 600 }}>
                Less than 1 minute left!
              </Typography>
            )}
          </Box>
        </Box>
      </Paper>

      {exam?.instructions && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ color: '#1F2937' }}>
            Instructions
          </Typography>
          <Typography variant="body2" whiteSpace="pre-wrap" sx={{ color: '#4B5563' }}>
            {exam.instructions}
          </Typography>
        </Paper>
      )}

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Box>
        {questions.map((question, index) => (
          <Paper key={question.id} sx={{ p: 3, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1F2937' }}>
                Question {index + 1} of {questions.length}
              </Typography>
              <Chip 
                label={`${question.marks} marks`} 
                size="small" 
                sx={{ bgcolor: '#EAF5F1', color: '#2E8B57' }}
              />
            </Box>
            
            <Typography variant="body1" gutterBottom sx={{ whiteSpace: 'pre-wrap', color: '#1F2937' }}>
              {question.questionText}
            </Typography>

            {question.options && question.options.length > 0 ? (
              <FormControl component="fieldset" sx={{ mt: 2, width: '100%' }}>
                <RadioGroup value={''}>
                  {question.options.map((option) => (
                    <Paper 
                      key={option.id}
                      sx={{ 
                        p: 1.5, 
                        mb: 1, 
                        border: '2px solid',
                        borderColor: (answers[question.id] || []).includes(option.id) ? '#5FAF8F' : '#E5E7EB',
                        borderRadius: 2,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        bgcolor: (answers[question.id] || []).includes(option.id) ? '#EAF5F1' : 'transparent',
                        '&:hover': {
                          borderColor: '#5FAF8F',
                          bgcolor: '#EAF5F1',
                        },
                      }}
                      onClick={() => handleAnswerChange(question.id, option.id)}
                    >
                      <FormControlLabel
                        value={option.id}
                        control={<Radio sx={{ color: '#5FAF8F', '&.Mui-checked': { color: '#5FAF8F' } }} />}
                        label={`${option.key}) ${option.value}`}
                        sx={{ width: '100%', m: 0 }}
                      />
                    </Paper>
                  ))}
                </RadioGroup>
              </FormControl>
            ) : (
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Type your answer here..."
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                sx={{ mt: 2 }}
                variant="outlined"
              />
            )}

            {(answers[question.id] && (answers[question.id].length > 0 || answers[question.id])) && (
              <Chip 
                icon={<CheckCircle />} 
                label="Answered" 
                size="small" 
                sx={{ mt: 2, bgcolor: '#EAF5F1', color: '#2E8B57' }} 
              />
            )}
          </Paper>
        ))}

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/student-dashboard')}
            disabled={submitting}
            sx={{ borderColor: '#5FAF8F', color: '#5FAF8F' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={submitting || isAutoSubmitting}
            sx={{ 
              px: 4, 
              fontWeight: 600,
              bgcolor: '#5FAF8F',
              '&:hover': { bgcolor: '#2E8B57' },
            }}
          >
            {submitting || isAutoSubmitting ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1, color: 'white' }} />
                Submitting...
              </>
            ) : (
              'Submit Exam'
            )}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default TakeExam;
