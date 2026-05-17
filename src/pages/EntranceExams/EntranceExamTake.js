import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Alert, CircularProgress,
  Radio, RadioGroup, FormControlLabel, FormControl, LinearProgress, Grid,
} from '@mui/material';
import { entranceExamTakeAPI } from '../../services/api';
import { useSearchParams } from 'react-router-dom';

const EntranceExamTake = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [phase, setPhase] = useState('loading'); // loading, info, exam, result, error
  const [candidate, setCandidate] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [duration, setDuration] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!token) { setError('No access token provided'); setPhase('error'); return; }
    loadInfo();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [token]);

  const loadInfo = async () => {
    try {
      const res = await entranceExamTakeAPI.getInfo(token);
      if (res.data?.success) {
        setCandidate(res.data.data);
        const status = res.data.data.statusName;
        if (status === 'Passed' || status === 'Failed' || status === 'Completed') {
          setError('This exam has already been submitted');
          setPhase('error');
          return;
        }
        setPhase('info');
      } else setError(res.data?.message || 'Invalid token');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load');
      setPhase('error');
    }
  };

  const startExam = async () => {
    try {
      const res = await entranceExamTakeAPI.getQuestions(token);
      if (res.data?.success) {
        const qs = res.data.data || [];
        if (qs.length === 0) { setError('No questions available for this exam'); setPhase('error'); return; }
        setQuestions(qs);
        setDuration(candidate.durationMinutes * 60);
        setTimeLeft(candidate.durationMinutes * 60);
        setPhase('exam');
      } else setError(res.data?.message || 'Failed to load questions');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load');
    }
  };

  useEffect(() => {
    if (phase !== 'exam' || timeLeft <= 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); handleSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      const answerList = Object.entries(answers).map(([questionId, selectedOptionKey]) => ({
        questionId, selectedOptionKey,
      }));
      const res = await entranceExamTakeAPI.submit({ accessToken: token, answers: answerList });
      if (res.data?.success) {
        setResult(res.data.data);
        setPhase('result');
      } else setError(res.data?.message || 'Failed to submit');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit');
    }
  };

  if (phase === 'loading') return <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F5F5F5' }}><CircularProgress /></Box>;
  if (phase === 'error') return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F5F5F5' }}>
      <Card sx={{ maxWidth: 500, p: 3 }}><Alert severity="error">{error}</Alert></Card>
    </Box>
  );

  if (phase === 'info' && candidate) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#F5F5F5', py: 6 }}>
        <Grid container justifyContent="center">
          <Grid item xs={12} md={6}>
            <Card sx={{ border: '2px solid #4CAF50' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom sx={{ color: '#2E7D32', textAlign: 'center', fontWeight: 700 }}>
                  {candidate.examTitle || 'Entrance Exam'}
                </Typography>
                <Typography variant="body1" sx={{ textAlign: 'center', mb: 3, color: '#666' }}>
                  Welcome, <strong>{candidate.firstName} {candidate.lastName}</strong>
                </Typography>
                <Box sx={{ bgcolor: '#E8F5E9', p: 2, borderRadius: 2, mb: 3 }}>
                  <Typography variant="body2" sx={{ color: '#2E7D32' }}>
                    Duration: <strong>{candidate.durationMinutes} minutes</strong>
                  </Typography>
                </Box>
                <Button fullWidth variant="contained" size="large"
                  sx={{ bgcolor: '#2E7D32', '&:hover': { bgcolor: '#1B5E20' }, py: 1.5 }}
                  onClick={startExam}>Start Exam</Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (phase === 'exam') {
    const progress = ((duration - timeLeft) / duration) * 100;
    const answered = Object.keys(answers).length;

    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#F5F5F5' }}>
        <Box sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: '#fff', borderBottom: '2px solid #4CAF50' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, py: 1 }}>
            <Typography variant="h6" sx={{ color: '#2E7D32' }}>{candidate?.examTitle || 'Entrance Exam'}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" sx={{ color: '#666' }}>{answered}/{questions.length} answered</Typography>
              <Typography variant="h6" sx={{ color: timeLeft < 60 ? '#C62828' : '#2E7D32' }}>{formatTime(timeLeft)}</Typography>
            </Box>
          </Box>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 4, bgcolor: '#E8F5E9', '& .MuiLinearProgress-bar': { bgcolor: '#4CAF50' } }} />
        </Box>

        <Box sx={{ p: 3 }}>
          {questions.map((q, idx) => (
            <Card key={q.id} sx={{ mb: 2, border: '1px solid #C8E6C9' }}>
              <CardContent>
                {q.subject && (
                  <Typography variant="caption" sx={{ color: '#2E7D32', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, mb: 1, display: 'block' }}>
                    {q.subject}
                  </Typography>
                )}
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  {idx + 1}. {q.questionText}
                  <Typography component="span" variant="caption" sx={{ ml: 1, color: '#888' }}>({q.marks} mark{q.marks > 1 ? 's' : ''})</Typography>
                </Typography>
                <FormControl component="fieldset">
                  <RadioGroup value={answers[q.id] || ''} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}>
                    {(q.options || []).map(opt => (
                      <FormControlLabel key={opt.key} value={opt.key}
                        control={<Radio sx={{ '&.Mui-checked': { color: '#2E7D32' } }} />}
                        label={<Typography variant="body2">{opt.key}. {opt.value}</Typography>} />
                    ))}
                  </RadioGroup>
                </FormControl>
              </CardContent>
            </Card>
          ))}

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button variant="contained" size="large"
              sx={{ bgcolor: '#2E7D32', '&:hover': { bgcolor: '#1B5E20' }, px: 6 }}
              onClick={handleSubmit}>Submit Exam</Button>
          </Box>
        </Box>
      </Box>
    );
  }

  if (phase === 'result' && result) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#F5F5F5', py: 6 }}>
        <Grid container justifyContent="center">
          <Grid item xs={12} md={6}>
            <Card sx={{ border: '2px solid #4CAF50' }}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom sx={{ color: '#2E7D32', fontWeight: 700 }}>
                  {result.examTitle}
                </Typography>
                <Typography variant="body1" gutterBottom sx={{ mb: 3 }}>{result.candidateName}</Typography>
                <Alert severity="info" sx={{ mb: 2, bgcolor: '#E8F5E9', '& .MuiAlert-icon': { color: '#2E7D32' } }}>
                  Your exam has been submitted successfully. Please contact the administration to get your result.
                </Alert>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }

  return null;
};

export default EntranceExamTake;
