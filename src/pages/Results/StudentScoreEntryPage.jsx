import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Person,
  School,
  Class as ClassIcon,
  Cancel,
} from '@mui/icons-material';
import { adminAPI, teacherAPI, academicYearsAPI, termsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/ui';

const TEST_MAX = 40;
const EXAM_MAX = 60;
const TOTAL_MAX = 100;

const StudentScoreEntryPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { studentId } = useParams();
  const { user, hasRole } = useAuth();
  const basePath = hasRole('Admin') ? '/admin-dashboard' : '/teacher-dashboard';

  const state = location.state || {};
  const [studentIdParam, setStudentIdParam] = useState(studentId || state.studentId);
  const [selectedClass, setSelectedClass] = useState(state.classId || '');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(state.academicYearId || '');
  const [selectedTerm, setSelectedTerm] = useState(state.termId || '');
  const [studentInfo, setStudentInfo] = useState({
    name: state.studentName || '',
    number: state.studentNumber || '',
    className: state.className || '',
    academicYearName: '',
    termName: '',
  });

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [subjectScores, setSubjectScores] = useState({});

  const isTeacher = hasRole('Teacher');

  useEffect(() => {
    if (studentIdParam && selectedClass && selectedAcademicYear && selectedTerm) {
      fetchSubjectScores();
      fetchAcademicYearName();
      fetchTermName();
    }
  }, [studentIdParam, selectedClass, selectedAcademicYear, selectedTerm]);

  const fetchAcademicYearName = async () => {
    try {
      const response = await academicYearsAPI.getById(selectedAcademicYear);
      if (response.data?.data?.name) {
        setStudentInfo((prev) => ({ ...prev, academicYearName: response.data.data.name }));
      }
    } catch (err) {
      console.error('Error fetching academic year:', err);
    }
  };

  const fetchTermName = async () => {
    try {
      const response = await termsAPI.getById(selectedTerm);
      if (response.data?.data?.name) {
        setStudentInfo((prev) => ({ ...prev, termName: response.data.data.name }));
      }
    } catch (err) {
      console.error('Error fetching term:', err);
    }
  };

  const fetchSubjectScores = async () => {
    try {
      setLoading(true);
      setError('');

      const api = hasRole('Admin') ? adminAPI : teacherAPI;
      const response = await api.scores.getStudentSubjectScores(
        studentIdParam,
        selectedClass,
        selectedAcademicYear,
        selectedTerm
      );

      if (response.data?.success) {
        const subjectsData = response.data.data || [];
        setSubjects(subjectsData);

        const initialScores = {};
        subjectsData.forEach((s) => {
          initialScores[s.classSubjectId] = {
            classSubjectId: s.classSubjectId,
            subjectId: s.subjectId,
            subjectName: s.subjectName,
            testScore: s.testScore !== null && s.testScore !== undefined ? s.testScore.toString() : '',
            examScore: s.examScore !== null && s.examScore !== undefined ? s.examScore.toString() : '',
            totalScore: s.totalScore || 0,
          };
        });
        setSubjectScores(initialScores);
      } else {
        setError(response.data?.message || 'Failed to load subjects');
        setSubjects([]);
      }
    } catch (err) {
      console.error('Error fetching subject scores:', err);
      setError(err.response?.data?.message || 'Failed to load subject scores');
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (classSubjectId, field, value) => {
    setSubjectScores((prev) => ({
      ...prev,
      [classSubjectId]: {
        ...prev[classSubjectId],
        [field]: value,
      },
    }));
  };

  const calculateTotal = (testScore, examScore) => {
    const test = parseInt(testScore) || 0;
    const exam = parseInt(examScore) || 0;
    return test + exam;
  };

  const validateAllScores = () => {
    const errors = [];

    Object.values(subjectScores).forEach((score) => {
      const test = parseInt(score.testScore);
      const exam = parseInt(score.examScore);

      if (score.testScore !== '' && (isNaN(test) || test < 0)) {
        errors.push(`${score.subjectName}: Test score must be a number ≥ 0`);
      }
      if (score.testScore !== '' && test > TEST_MAX) {
        errors.push(`${score.subjectName}: Test score cannot exceed ${TEST_MAX}`);
      }
      if (score.examScore !== '' && (isNaN(exam) || exam < 0)) {
        errors.push(`${score.subjectName}: Exam score must be a number ≥ 0`);
      }
      if (score.examScore !== '' && exam > EXAM_MAX) {
        errors.push(`${score.subjectName}: Exam score cannot exceed ${EXAM_MAX}`);
      }
      if (score.testScore !== '' && score.examScore !== '') {
        const total = test + exam;
        if (total > TOTAL_MAX) {
          errors.push(`${score.subjectName}: Total score (${total}) cannot exceed ${TOTAL_MAX}`);
        }
      }
    });

    return errors;
  };

  const handleSaveAll = async () => {
    const validationErrors = validateAllScores();
    if (validationErrors.length > 0) {
      setError(validationErrors.join('; '));
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        studentId: studentIdParam,
        classId: selectedClass,
        academicYearId: selectedAcademicYear,
        termId: selectedTerm,
        subjectScores: Object.values(subjectScores).map((s) => ({
          classSubjectId: s.classSubjectId,
          subjectId: s.subjectId,
          subjectName: s.subjectName,
          testScore: s.testScore !== '' ? parseInt(s.testScore) : null,
          examScore: s.examScore !== '' ? parseInt(s.examScore) : null,
          totalScore: calculateTotal(s.testScore, s.examScore),
        })),
      };

      const api = hasRole('Admin') ? adminAPI : teacherAPI;
      const response = await api.scores.saveSubjectScores(payload);

      if (response.data?.success) {
        setSuccess('All scores saved successfully!');
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } else {
        setError(response.data?.message || 'Failed to save scores');
      }
    } catch (err) {
      console.error('Error saving scores:', err);
      setError(err.response?.data?.message || err.response?.data?.errors?.[0] || 'Failed to save scores');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`${basePath}/score-entry`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#FF3E8A' }} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <IconButton onClick={handleCancel} sx={{ color: '#64748B' }}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1E293B' }}>
            Score Entry
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Enter Test (out of 40) and Exam (out of 60) scores
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Person sx={{ color: '#6FAF8F', fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: '#64748B' }}>Student</Typography>
              </Box>
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#1E293B' }}>
                {studentInfo.name || 'Unknown Student'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B' }}>
                {studentInfo.number || 'No student number'}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <School sx={{ color: '#6FAF8F', fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: '#64748B' }}>Academic Year</Typography>
              </Box>
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#1E293B' }}>
                {studentInfo.academicYearName || '-'}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <ClassIcon sx={{ color: '#6FAF8F', fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: '#64748B' }}>Class</Typography>
              </Box>
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#1E293B' }}>
                {studentInfo.className || '-'}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <School sx={{ color: '#6FAF8F', fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: '#64748B' }}>Term</Typography>
              </Box>
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#1E293B' }}>
                {studentInfo.termName || '-'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {subjects.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <School sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#64748B', mb: 1 }}>
              No subjects found
            </Typography>
            <Typography variant="body2" sx={{ color: '#999' }}>
              No subjects are assigned to this student's class.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Subject</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                      Test<br />
                      <Typography variant="caption" display="block" color="text.secondary">
                        (out of {TEST_MAX})
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                      Exam<br />
                      <Typography variant="caption" display="block" color="text.secondary">
                        (out of {EXAM_MAX})
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                      Total<br />
                      <Typography variant="caption" display="block" color="text.secondary">
                        (out of {TOTAL_MAX})
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subjects.map((subject, index) => {
                    const score = subjectScores[subject.classSubjectId] || {};
                    const testValue = score.testScore !== undefined ? score.testScore : '';
                    const examValue = score.examScore !== undefined ? score.examScore : '';
                    const total = calculateTotal(testValue, examValue);
                    const isTestInvalid = testValue !== '' && (parseInt(testValue) > TEST_MAX || isNaN(parseInt(testValue)));
                    const isExamInvalid = examValue !== '' && (parseInt(examValue) > EXAM_MAX || isNaN(parseInt(examValue)));
                    const isTotalInvalid = testValue !== '' && examValue !== '' && total > TOTAL_MAX;

                    return (
                      <TableRow key={subject.classSubjectId} hover>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {subject.subjectName || subject.SubjectName || 'Unknown Subject'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <TextField
                            type="number"
                            size="small"
                            value={testValue}
                            onChange={(e) => handleScoreChange(subject.classSubjectId, 'testScore', e.target.value)}
                            inputProps={{ min: 0, max: TEST_MAX }}
                            sx={{ width: 100 }}
                            error={isTestInvalid}
                            helperText={isTestInvalid ? `Max ${TEST_MAX}` : ''}
                            FormHelperTextProps={{ style: { fontSize: '0.7rem' } }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <TextField
                            type="number"
                            size="small"
                            value={examValue}
                            onChange={(e) => handleScoreChange(subject.classSubjectId, 'examScore', e.target.value)}
                            inputProps={{ min: 0, max: EXAM_MAX }}
                            sx={{ width: 100 }}
                            error={isExamInvalid}
                            helperText={isExamInvalid ? `Max ${EXAM_MAX}` : ''}
                            FormHelperTextProps={{ style: { fontSize: '0.7rem' } }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 'bold',
                              color: isTotalInvalid ? '#EF4444' : '#1B5E20',
                            }}
                          >
                            {total}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
        <Button
          variant="outlined"
          onClick={handleCancel}
          startIcon={<Cancel />}
          sx={{ borderRadius: 2 }}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSaveAll}
          startIcon={saving ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <Save />}
          sx={{
            backgroundColor: '#FF3E8A',
            '&:hover': { backgroundColor: '#e6337a' },
            borderRadius: 2,
          }}
          disabled={saving || subjects.length === 0}
        >
          {saving ? 'Saving...' : 'Save Scores'}
        </Button>
      </Box>
    </Box>
  );
};

export default StudentScoreEntryPage;
