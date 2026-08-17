import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  Button,
  TextField,
  InputAdornment,
  LinearProgress,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
} from '@mui/material';
import {
  Person,
  Search,
  EmojiEvents,
  TrendingUp,
  School,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { teacherAPI } from '../../services/api';

const TeacherTopStudents = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [myAssignments, setMyAssignments] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [studentResults, setStudentResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch teacher's class assignments
  useEffect(() => {
    const fetchMyAssignments = async () => {
      try {
        setLoading(true);
        const response = await teacherAPI.myAssignments.getAll(1, 50);

        if (response.data?.success && response.data?.data?.items) {
          const assignments = response.data.data.items;
          setMyAssignments(assignments);

          // Auto-select first class if available
          if (assignments.length > 0 && !selectedClass) {
            setSelectedClass(assignments[0].classId);
          }
        } else {
          setMyAssignments([]);
        }
      } catch (err) {
        console.error('Error fetching assignments:', err);
        setError('Failed to load your class assignments');
      } finally {
        setLoading(false);
      }
    };

    fetchMyAssignments();
  }, []);

  // Fetch students when class is selected
  useEffect(() => {
    if (selectedClass) {
      const fetchStudents = async () => {
        try {
          const response = await teacherAPI.students.getByClassPaged(selectedClass, 1, 100);

          if (response.data?.success && response.data?.data?.items) {
            setStudents(response.data.data.items);
          } else {
            setStudents([]);
          }
        } catch (err) {
          console.error('Error fetching students:', err);
        }
      };

      fetchStudents();
    }
  }, [selectedClass]);

  // Fetch results for all students in the selected class
  useEffect(() => {
    if (selectedClass && students.length > 0) {
      const fetchResults = async () => {
        try {
          // Get active term
          const termResponse = await teacherAPI.terms.getActive();
          if (!termResponse.data?.success || !termResponse.data?.data?.id) {
            return;
          }

          const termId = termResponse.data.data.id;

          // Fetch results for each student
          const resultsPromises = students.map(async (student) => {
            try {
              const resultResponse = await teacherAPI.results.getByStudentAndTerm(student.id, termId);
              if (resultResponse.data?.success && resultResponse.data?.data) {
                return {
                  studentId: student.id,
                  student: student,
                  results: resultResponse.data.data,
                  averageScore: calculateAverageScore(resultResponse.data.data),
                };
              }
              return null;
            } catch (err) {
              console.error(`Error fetching results for student ${student.id}:`, err);
              return null;
            }
          });

          const results = await Promise.all(resultsPromises);
          const validResults = results.filter(r => r !== null);

          // Sort by average score descending
          validResults.sort((a, b) => b.averageScore - a.averageScore);

          setStudentResults(validResults);
        } catch (err) {
          console.error('Error fetching results:', err);
        }
      };

      fetchResults();
    }
  }, [selectedClass, students]);

  const calculateAverageScore = (results) => {
    if (!results || results.length === 0) return 0;

    let totalScore = 0;
    let count = 0;

    results.forEach(result => {
      if (result.subjectScores) {
        Object.values(result.subjectScores).forEach(score => {
          if (score.totalScore !== null && score.totalScore !== undefined) {
            totalScore += score.totalScore;
            count++;
          }
        });
      }
    });

    return count > 0 ? Math.round(totalScore / count) : 0;
  };

  const getScoreColor = (score) => {
    if (score >= 90) return '#66BB6A';
    if (score >= 75) return '#2196F3';
    if (score >= 60) return '#FFA726';
    return '#EF5350';
  };

  const getGrade = (score) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  // Filter students based on search
  const filteredResults = studentResults.filter(item =>
    item.student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${item.student.firstName} ${item.student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
      {/* Header */}
      <Box
        sx={{
          mb: { xs: 3, md: 4 },
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(255, 167, 38, 0.8) 0%, rgba(255, 62, 138, 0.8) 100%)'
            : 'linear-gradient(135deg, #FFA726 0%, #FF3E8A 100%)',
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
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}>
            🏆 Top Performing Students
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            View and track student performance across your classes
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} icon={<ErrorIcon />}>
          {error}
        </Alert>
      )}

      {myAssignments.length === 0 ? (
        <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
          <Typography variant="body2">
            No class assignments found. Please contact the administrator to get assigned to classes.
          </Typography>
        </Alert>
      ) : (
        <>
          {/* Class Selector */}
          <Card
            sx={{
              mb: 3,
              background: 'rgba(17, 17, 17, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <FormControl fullWidth sx={{ minWidth: 200 }}>
                <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Select Class</InputLabel>
                <Select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  label="Select Class"
                  sx={{
                    color: '#ffffff',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#FFA726',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#FFA726',
                    },
                  }}
                >
                  {myAssignments.map((assignment) => (
                    <MenuItem key={assignment.id} value={assignment.classId}>
                      {assignment.class?.name || `Class ${assignment.classId}`} - {assignment.subject?.name || 'Subject'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>

          {/* Search */}
          <Card
            sx={{
              mb: 3,
              background: 'rgba(17, 17, 17, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <TextField
                fullWidth
                placeholder="Search by student name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: '#FFA726' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#ffffff',
                    '&:hover fieldset': { borderColor: '#FFA726' },
                    '&.Mui-focused fieldset': { borderColor: '#FFA726', borderWidth: 2 },
                  },
                }}
              />
            </CardContent>
          </Card>

          {/* Top Students List */}
          {filteredResults.length === 0 ? (
            <Card
              sx={{
                background: 'rgba(17, 17, 17, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 3,
                p: 6,
                textAlign: 'center',
              }}
            >
              <EmojiEvents sx={{ fontSize: 60, color: 'rgba(255, 255, 255, 0.2)', mb: 2 }} />
              <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                {searchTerm ? 'No students match your search' : 'No results found yet'}
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                {searchTerm ? 'Try a different search term' : 'Results will appear here once students have taken exams'}
              </Typography>
            </Card>
          ) : (
            <Grid container spacing={2}>
              {filteredResults.map((item, index) => (
                <Grid item xs={12} sm={6} md={4} key={item.studentId}>
                  <Card
                    sx={{
                      background: 'rgba(17, 17, 17, 0.8)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 3,
                      position: 'relative',
                      '&:hover': {
                        boxShadow: '0 0 20px rgba(255, 167, 38, 0.3)',
                        border: '1px solid rgba(255, 167, 38, 0.3)',
                      },
                    }}
                  >
                    {index < 3 && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 16,
                          left: 16,
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: getScoreColor(item.averageScore),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          color: '#ffffff',
                          fontSize: '0.9rem',
                          zIndex: 1,
                        }}
                      >
                        {index + 1}
                      </Box>
                    )}
                    <CardContent sx={{ p: 2, pt: 5 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <Avatar
                          src={item.student.profilePictureUrl}
                          sx={{
                            width: 60,
                            height: 60,
                            border: '2px solid #FFA726',
                            bgcolor: '#111111',
                            mb: 1,
                          }}
                        >
                          <Person sx={{ fontSize: 30 }} />
                        </Avatar>
                        <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 600, mb: 0.5 }}>
                          {item.student.firstName} {item.student.lastName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 1 }}>
                          {item.student.rollNumber || 'No Roll Number'}
                        </Typography>

                        <Grid container spacing={2} sx={{ width: '100%', mb: 1 }}>
                          <Grid item xs={6}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 0.5 }}>
                                Avg Score
                              </Typography>
                              <Typography
                                variant="h6"
                                sx={{ color: getScoreColor(item.averageScore), fontWeight: 700 }}
                              >
                                {item.averageScore}%
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 0.5 }}>
                                Grade
                              </Typography>
                              <Typography
                                variant="h6"
                                sx={{ color: getScoreColor(item.averageScore), fontWeight: 700 }}
                              >
                                {getGrade(item.averageScore)}
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>

                        <Chip
                          icon={<TrendingUp sx={{ fontSize: 16 }} />}
                          label={`${item.results?.length || 0} subjects`}
                          size="small"
                          sx={{
                            background: 'rgba(255, 167, 38, 0.2)',
                            color: '#FFA726',
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
    </Container>
  );
};

export default TeacherTopStudents;
