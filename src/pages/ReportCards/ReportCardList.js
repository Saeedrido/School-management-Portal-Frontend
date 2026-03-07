import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  Chip,
  useTheme,
} from '@mui/material';
import {
  Assessment,
  PictureAsPdf,
  School,
  Event,
  Class,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { reportCardsAPI, termsAPI, studentsAPI, adminAPI, teacherAPI } from '../../services/api';

const ReportCardList = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { hasRole, user } = useAuth();

  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(user?.role === 'Student' ? user.id : '');
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [terms, setTerms] = useState([]);
  const [reportCard, setReportCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedClass && (hasRole('Admin', 'Teacher'))) {
      fetchStudents(selectedClass);
    }
  }, [selectedClass]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [termsRes, classesRes] = await Promise.all([
        termsAPI.getAll(),
        hasRole('Admin', 'Teacher') ? (user.role === 'Admin' ? adminAPI.classes.getAll() : teacherAPI.classes.getAll()) : Promise.resolve({ data: { success: true, data: [] } })
      ]);

      if (termsRes.data?.success) setTerms(termsRes.data.data);
      if (classesRes.data?.success) setClasses(classesRes.data.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load initial data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (classId) => {
    try {
      const response = await studentsAPI.getByClass(classId);
      if (response.data?.success) {
        setStudents(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students for selected class');
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedTerm) {
      setError('Please select a term');
      return;
    }
    if (hasRole('Admin', 'Teacher')) {
      if (!selectedClass) {
        setError('Please select a class');
        return;
      }
      if (!selectedStudent) {
        setError('Please select a student');
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      const studentId = hasRole('Admin', 'Teacher') ? selectedStudent : user.id;
      const response = await reportCardsAPI.getByStudentAndTerm(studentId, selectedTerm);

      if (response.data?.success) {
        setReportCard(response.data.data);
      } else {
        setError(response.data?.message || 'Failed to generate report card');
      }
    } catch (err) {
      console.error('Error generating report:', err);
      setError(err.response?.data?.message || 'Failed to generate report card. Please ensure all results are published.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: 3,
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(102, 187, 106, 0.1) 100%)'
            : 'linear-gradient(135deg, #E3F2FD 0%, #F1F8E9 100%)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: { xs: 3, md: 4 },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 2, sm: 0 },
            textAlign: { xs: 'center', sm: 'left' },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Assessment sx={{ fontSize: { xs: 28, sm: 32 }, color: 'primary.main' }} />
            <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700, fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}>
              Report Cards
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!reportCard ? (
          <Box sx={{ mb: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  select
                  label="Select Term"
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  SelectProps={{ native: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                >
                  <option value="">Select Term</option>
                  {terms.map((term) => (
                    <option key={term.id} value={term.id}>
                      {term.name} ({term.academicYearName || term.academicYear?.name || 'Current Year'})
                    </option>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  select
                  label="Select Class"
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setSelectedStudent('');
                  }}
                  disabled={!hasRole('Admin', 'Teacher')}
                  SelectProps={{ native: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                >
                  <option value="">Select Class</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  select
                  label="Select Student"
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  disabled={!hasRole('Admin', 'Teacher') || !selectedClass}
                  SelectProps={{ native: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                >
                  <option value="">Select Student</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.firstName || student.user?.firstName || 'Unknown'} {student.lastName || student.user?.lastName || ''} ({student.studentNumber || 'No ID'})
                    </option>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleGenerateReport}
                disabled={!selectedTerm || !selectedStudent}
                startIcon={<Assessment />}
                sx={{
                  bgcolor: '#66BB6A',
                  '&:hover': { bgcolor: '#81C784' },
                  borderRadius: 2,
                  minWidth: 200,
                }}
              >
                Generate Report Card
              </Button>
            </Box>
          </Box>
        ) : (
          <Box>
            {/* Report Header */}
            <Box
              sx={{
                p: 3,
                mb: 3,
                background: 'linear-gradient(90deg, #2196F3 0%, #1976D2 100%)',
                borderRadius: 2,
                color: 'white',
              }}
            >
              <Typography variant="h5" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
                {reportCard.student?.firstName} {reportCard.student?.lastName}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                Report Card - {reportCard.term?.name} ({reportCard.academicYear?.name})
              </Typography>
            </Box>

            {/* Student Info */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ color: '#78909C' }}>
                  <strong>Class:</strong> {reportCard.class?.name}
                </Typography>
                <Typography variant="body2" sx={{ color: '#78909C' }}>
                  <strong>Roll Number:</strong> {reportCard.student?.rollNumber || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ color: '#78909C' }}>
                  <strong>Position:</strong> {reportCard.summary?.positionInClass || 'N/A'} / {reportCard.summary?.totalStudentsInClass || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#78909C' }}>
                  <strong>Overall Grade:</strong> {reportCard.summary?.overallGrade || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ color: '#78909C' }}>
                  <strong>Generated At:</strong> {reportCard.generatedAt ? new Date(reportCard.generatedAt).toLocaleDateString() : 'N/A'}
                </Typography>
              </Grid>
            </Grid>

            {/* Subjects Table */}
            <Card elevation={2} sx={{ mb: 3 }}>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ bgcolor: '#F5F7FA', p: 2, mb: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: '#1976D2' }}>
                        Subject
                      </Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: '#1976D2' }}>
                        Obj / Theory
                      </Typography>
                    </Grid>
                    <Grid item xs={1}>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: '#1976D2' }}>
                        Total
                      </Typography>
                    </Grid>
                    <Grid item xs={1}>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: '#1976D2' }}>
                        Grade
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: '#1976D2' }}>
                        Remarks
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                {reportCard.subjects?.map((subject, index) => (
                  <Box
                    key={index}
                    sx={{
                      bgcolor: index % 2 === 0 ? 'white' : '#F5F7FA',
                      p: 2,
                    }}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976D2' }}>
                          {subject.subjectName}
                        </Typography>
                      </Grid>
                      <Grid item xs={2}>
                        <Typography variant="body2" sx={{ color: '#78909C' }}>
                          {subject.objectiveScore} / {subject.theoryScore}
                        </Typography>
                      </Grid>
                      <Grid item xs={1}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976D2' }}>
                          {subject.totalScore}
                        </Typography>
                      </Grid>
                      <Grid item xs={1}>
                        <Chip
                          label={subject.grade || 'N/A'}
                          size="small"
                          sx={{
                            bgcolor:
                              subject.grade === 'A' ? '#66BB6A' :
                                subject.grade === 'B' ? '#2196F3' :
                                  subject.grade === 'F' ? '#EF5350' : '#FFC107',
                            color: 'white',
                            fontWeight: 600,
                          }}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" sx={{ color: '#78909C', fontSize: '0.875rem' }}>
                          {subject.teacherRemark || '-'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </CardContent>
            </Card>

            {/* Overall Remarks */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2, height: '100%', bgcolor: '#E8F5E9' }}>
                  <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                    Teacher's Feedback
                  </Typography>
                  <Typography variant="body2">
                    {reportCard.classTeacherComment || reportCard.overallRemark || 'No general remark set.'}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2, height: '100%', bgcolor: '#E3F2FD' }}>
                  <Typography variant="subtitle2" color="secondary" sx={{ fontWeight: 700, mb: 1 }}>
                    Headmaster's Comment
                  </Typography>
                  <Typography variant="body2">
                    {reportCard.headmasterComment || 'No headmaster comment set.'}
                  </Typography>
                </Card>
              </Grid>
            </Grid>

            {/* Summary */}
            <Box
              sx={{
                p: 3,
                background: 'linear-gradient(135deg, #66BB6A 0%, #81C784 100%)',
                borderRadius: 2,
                color: 'white',
              }}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={6}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Overall Average: {reportCard.summary?.percentage}%
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Overall Grade: <span style={{
                      fontSize: '2rem',
                      fontWeight: 700,
                      color: '#66BB6A',
                      background: 'white',
                      padding: '4px 12px',
                      borderRadius: '4px',
                      marginLeft: '8px',
                    }}>{reportCard.summary?.overallGrade}</span>
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
              <Button
                variant="outlined"
                onClick={() => setReportCard(null)}
                sx={{ borderRadius: 2 }}
              >
                Back to Selection
              </Button>
              <Button
                variant="contained"
                startIcon={<PictureAsPdf />}
                sx={{
                  bgcolor: '#EF5350',
                  '&:hover': { bgcolor: '#C62828' },
                  borderRadius: 2,
                }}
              >
                Download PDF
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ReportCardList;
