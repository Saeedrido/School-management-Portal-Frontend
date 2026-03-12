import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  useTheme,
  Chip,
  Grid,
  Avatar,
} from '@mui/material';
import {
  ArrowBack,
  School,
  Person,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';

const ParentStudentResult = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { studentId } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [availableTerms, setAvailableTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState('');
  const [result, setResult] = useState(null);
  const [resultLoading, setResultLoading] = useState(false);
  const [noResult, setNoResult] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAvailableTerms();
  }, [studentId]);

  useEffect(() => {
    if (selectedTerm) {
      fetchResult();
    }
  }, [selectedTerm]);

  const fetchAvailableTerms = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.results.getStudentAvailableTerms(studentId);
      if (response.data && response.data.success) {
        setAvailableTerms(response.data.data.availableTerms || []);
        if (response.data.data.availableTerms && response.data.data.availableTerms.length > 0) {
          setSelectedTerm(response.data.data.availableTerms[0].termId);
        }
      }
    } catch (err) {
      console.error('Error fetching available terms:', err);
      setError('Failed to load available terms');
    } finally {
      setLoading(false);
    }
  };

  const fetchResult = async () => {
    setResultLoading(true);
    setNoResult(false);
    setResult(null);
    try {
      const response = await adminAPI.results.getByStudentAndTerm(studentId, selectedTerm);
      if (response.data && response.data.success && response.data.data) {
        setResult(response.data.data);
      } else {
        setNoResult(true);
      }
    } catch (err) {
      console.error('Error fetching result:', err);
      setNoResult(true);
    } finally {
      setResultLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    const colors = {
      'A': '#4CAF50',
      'B': '#8BC34A',
      'C': '#FFC107',
      'D': '#FF9800',
      'F': '#F44336',
    };
    return colors[grade] || '#9E9E9E';
  };

  const getGradeBgColor = (grade) => {
    const colors = {
      'A': '#E8F5E9',
      'B': '#F1F8E9',
      'C': '#FFF8E1',
      'D': '#FFF3E0',
      'F': '#FFEBEE',
    };
    return colors[grade] || '#F5F5F5';
  };

  const selectedTermData = availableTerms.find(t => t.termId === selectedTerm);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#f5f5f5',
      }}
    >
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/parent-dashboard/children')}
            sx={{ color: '#2E7D32' }}
          >
            Back to Children
          </Button>
        </Box>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: '#2E7D32',
            mb: 3,
          }}
        >
          Student Result
        </Typography>

        {/* Filters */}
        <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Academic Year</InputLabel>
                  <Select
                    value={selectedTermData?.academicYearId || ''}
                    label="Academic Year"
                    disabled
                  >
                    {[...new Set(availableTerms.map(t => t.academicYearId))].map(yearId => {
                      const term = availableTerms.find(t => t.academicYearId === yearId);
                      return (
                        <MenuItem key={yearId} value={yearId}>
                          {term?.academicYearName || ''}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Term</InputLabel>
                  <Select
                    value={selectedTerm}
                    label="Term"
                    onChange={(e) => setSelectedTerm(e.target.value)}
                  >
                    {availableTerms.map((term) => (
                      <MenuItem key={term.termId} value={term.termId}>
                        {term.termName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Result or No Result */}
        {resultLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : noResult ? (
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', bgcolor: '#FFF3E0' }}>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <Cancel sx={{ fontSize: 60, color: '#FF9800', mb: 2 }} />
              <Typography variant="h5" sx={{ color: '#E65100', mb: 2 }}>
                No result available for this child yet.
              </Typography>
              <Typography variant="body1" sx={{ color: '#795548' }}>
                The result for this term has not been published yet. Please check again later.
              </Typography>
            </CardContent>
          </Card>
        ) : result ? (
          <>
            {/* Student Info */}
            <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={3} alignItems="center">
                  <Grid item>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        bgcolor: '#2E7D32',
                        fontSize: '2rem',
                      }}
                    >
                      {result.studentName?.charAt(0) || 'S'}
                    </Avatar>
                  </Grid>
                  <Grid item xs>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: '#1B5E20' }}>
                      {result.studentName || 'Student'}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#4CAF50' }}>
                      Class: {result.className || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        Academic Year: {selectedTermData?.academicYearName || 'N/A'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        Term: {selectedTermData?.termName || 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Results Table */}
            <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <CardContent sx={{ p: 0 }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#2E7D32' }}>
                        <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Subject</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 600, textAlign: 'center' }}>Theory</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 600, textAlign: 'center' }}>Objective</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 600, textAlign: 'center' }}>Total</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 600, textAlign: 'center' }}>Grade</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {result.subjectResults?.map((subject, index) => (
                        <TableRow
                          key={subject.subjectId}
                          sx={{
                            bgcolor: index % 2 === 0 ? '#fff' : '#F5F5F5',
                            '&:hover': { bgcolor: '#E8F5E9' },
                          }}
                        >
                          <TableCell>
                            <Typography sx={{ fontWeight: 500 }}>
                              {subject.subjectName}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>{subject.theoryScore}</TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>{subject.objectiveScore}</TableCell>
                          <TableCell sx={{ textAlign: 'center', fontWeight: 600 }}>
                            {subject.totalScore}/{subject.maximumScore}
                          </TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>
                            <Chip
                              label={subject.gradeLetter}
                              sx={{
                                bgcolor: getGradeBgColor(subject.gradeLetter),
                                color: getGradeColor(subject.gradeLetter),
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#E8F5E9', borderRadius: 2 }}>
                      <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>Total Score</Typography>
                      <Typography variant="h4" sx={{ color: '#2E7D32', fontWeight: 700 }}>
                        {result.totalScore}/{result.maximumScore}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#E3F2FD', borderRadius: 2 }}>
                      <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>Average</Typography>
                      <Typography variant="h4" sx={{ color: '#1565C0', fontWeight: 700 }}>
                        {result.overallPercentage?.toFixed(1)}%
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#FFF3E0', borderRadius: 2 }}>
                      <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>Overall Grade</Typography>
                      <Chip
                        label={result.overallGrade || '-'}
                        sx={{
                          bgcolor: getGradeBgColor(result.overallGrade),
                          color: getGradeColor(result.overallGrade),
                          fontWeight: 700,
                          fontSize: '1.5rem',
                          height: 40,
                        }}
                      />
                    </Box>
                  </Grid>

                  {/* Remarks */}
                  {(result.teacherRemarks || result.headmasterComment) && (
                    <Grid item xs={12}>
                      <Box sx={{ mt: 2, p: 2, bgcolor: '#F5F5F5', borderRadius: 2 }}>
                        {result.teacherRemarks && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#666' }}>
                              Teacher's Remark:
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#333' }}>
                              {result.teacherRemarks}
                            </Typography>
                          </Box>
                        )}
                        {result.headmasterComment && (
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#666' }}>
                              Headmaster's Comment:
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#333' }}>
                              {result.headmasterComment}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </>
        ) : null}
      </Box>
    </Box>
  );
};

export default ParentStudentResult;
