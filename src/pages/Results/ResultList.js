import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Grid,
  Card,
  Avatar,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { Assessment, EmojiEvents, School } from '@mui/icons-material';
import { resultsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ResultList = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      let response;
      if (user?.role === 'Student') {
        response = await resultsAPI.getStudentResults(user.id);
      } else {
        setResults([]);
        setLoading(false);
        return;
      }
      if (response.data?.success) {
        setResults(response.data.data.items || []);
      } else {
        setError(response.data?.message || 'Failed to fetch results');
      }
    } catch (err) {
      setError('Failed to fetch results');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    if (!grade) return { bgcolor: '#F5F5F5', color: '#757575' };
    const firstChar = grade.toUpperCase().charAt(0);
    if (['A', 'B'].includes(firstChar)) return { bgcolor: '#E8F5E9', color: '#2E7D32' };
    if (['C', 'D'].includes(firstChar)) return { bgcolor: '#FFF3E0', color: '#F57C00' };
    return { bgcolor: '#FFEBEE', color: '#C62828' };
  };

  const getPercentageColor = (percentage) => {
    if (percentage >= 70) return { color: '#2E7D32', bgcolor: '#E8F5E9' };
    if (percentage >= 50) return { color: '#F57C00', bgcolor: '#FFF3E0' };
    return { color: '#C62828', bgcolor: '#FFEBEE' };
  };

  const calculateAverage = () => {
    if (!results.length) return 0;
    const percentages = results.map(r => r.totalMarks ? (r.score / r.totalMarks) * 100 : 0);
    const avg = percentages.reduce((sum, p) => sum + p, 0) / percentages.length;
    return avg.toFixed(1);
  };

  return (
    <Container maxWidth="xl">
      {/* Header */}
      <Box
        sx={{
          mb: { xs: 3, md: 4 },
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(171, 71, 188, 0.8) 0%, rgba(123, 31, 162, 0.8) 100%)'
            : 'linear-gradient(135deg, #AB47BC 0%, #7B1FA2 100%)',
          borderRadius: { xs: 2, sm: 3, md: 4 },
          p: { xs: 2, sm: 3, md: 4 },
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
          }}
        />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, sm: 3 }, flexDirection: { xs: 'column', sm: 'row' }, textAlign: { xs: 'center', sm: 'left' } }}>
            <Avatar
              sx={{
                width: { xs: 56, sm: 64 },
                height: { xs: 56, sm: 64 },
                bgcolor: 'rgba(255,255,255,0.2)',
              }}
            >
              <Assessment sx={{ fontSize: { xs: 28, sm: 32 } }} />
            </Avatar>
            <Box>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}>
                🏆 My Results
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Track your academic performance
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress sx={{ color: '#AB47BC' }} />
        </Box>
      ) : results.length === 0 ? (
        <Paper
          sx={{
            p: 8,
            textAlign: 'center',
            borderRadius: 4,
            background: 'linear-gradient(180deg, #FFFFFF 0%, #F5F7FA 100%)',
          }}
        >
          <Assessment sx={{ fontSize: 64, color: '#B0BEC5', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#78909C', mb: 1 }}>
            No results available yet
          </Typography>
          <Typography variant="body2" sx={{ color: '#B0BEC5' }}>
            Complete your exams to see your results here
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  p: 3,
                  borderRadius: 4,
                  background: 'linear-gradient(135deg, #AB47BC 0%, #7B1FA2 100%)',
                  color: 'white',
                }}
              >
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                  Average Score
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {calculateAverage()}%
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  p: 3,
                  borderRadius: 4,
                  background: 'linear-gradient(135deg, #66BB6A 0%, #388E3C 100%)',
                  color: 'white',
                }}
              >
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                  Passed
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {results.filter(r => r.passed).length}/{results.length}
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  p: 3,
                  borderRadius: 4,
                  background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                  color: 'white',
                }}
              >
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                  Highest Score
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {Math.max(...results.map(r => r.totalMarks ? (r.score / r.totalMarks) * 100 : 0)).toFixed(0)}%
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  p: 3,
                  borderRadius: 4,
                  background: 'linear-gradient(135deg, #EF5350 0%, #C62828 100%)',
                  color: 'white',
                }}
              >
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                  Exams Taken
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {results.length}
                </Typography>
              </Card>
            </Grid>
          </Grid>

          {/* Results Table */}
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'linear-gradient(90deg, #AB47BC 0%, #7B1FA2 100%)' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.85rem' }}>
                    Exam
                  </TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.85rem' }}>
                    Subject
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 600, fontSize: '0.85rem' }}>
                    Score
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 600, fontSize: '0.85rem' }}>
                    Total
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 600, fontSize: '0.85rem' }}>
                    Percentage
                  </TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 600, fontSize: '0.85rem' }}>
                    Grade
                  </TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 600, fontSize: '0.85rem' }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.85rem' }}>
                    Date
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.map((result, index) => {
                  const percentage = result.percentage || 0;
                  const percentageColor = getPercentageColor(Number(percentage));
                  const gradeColor = getGradeColor(result.grade);

                  return (
                    <TableRow
                      key={result.id}
                      hover
                      sx={{
                        '&:hover': { background: '#F5F7FA' },
                        background: index % 2 === 0 ? 'white' : '#FAFAFA',
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            sx={{
                              bgcolor: '#AB47BC',
                              width: 32,
                              height: 32,
                              fontSize: 14,
                            }}
                          >
                            <School sx={{ fontSize: 16 }} />
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976D2' }}>
                            {result.examTitle || result.exam?.title || 'Exam'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#546E7A' }}>
                          {result.subjectName || result.subject?.name || 'Subject'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976D2' }}>
                          {result.score}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ color: '#546E7A' }}>
                          {result.totalMarks}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 1,
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {percentage}%
                          </Typography>
                          {result.totalMarks && (
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: percentageColor.color,
                              }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={result.grade || 'N/A'}
                          size="small"
                          sx={{
                            bgcolor: gradeColor.bgcolor,
                            color: gradeColor.color,
                            fontWeight: 700,
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={result.passed ? 'Passed' : 'Failed'}
                          size="small"
                          sx={{
                            bgcolor: result.passed ? '#E8F5E9' : '#FFEBEE',
                            color: result.passed ? '#2E7D32' : '#C62828',
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#78909C' }}>
                          {result.completedAt
                            ? new Date(result.completedAt).toLocaleDateString()
                            : '-'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Performance Summary */}
          <Box
            sx={{
              mt: 4,
              p: 3,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)',
              border: '1px solid #AB47BC',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <EmojiEvents sx={{ color: '#7B1FA2', fontSize: 24 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#4A148C' }}>
                Performance Summary
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#6A1B9A' }}>
              {calculateAverage() >= 70
                ? '🎉 Excellent performance! Keep up the good work!'
                : calculateAverage() >= 50
                  ? '💪 Good effort! There\'s room for improvement.'
                  : '📚 Don\'t give up! With more practice, you can do better.'}
            </Typography>
          </Box>
        </>
      )}
    </Container>
  );
};

export default ResultList;
