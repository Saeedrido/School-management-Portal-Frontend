import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  MenuItem,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
} from '@mui/material';
import { PageHeader } from '../../components/ui';
import {
  Edit,
  Save,
  Search,
  Person,
  Close,
} from '@mui/icons-material';
import { teacherAPI, adminAPI, academicYearsAPI, termsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getExamTypeConfig, validateScore, examTypeToEnum } from '../../utils/dataMapping';

const ManualScoreEntry = () => {
  const { user, hasRole } = useAuth();
  const basePath = hasRole('Admin') ? '/admin-dashboard' : '/teacher-dashboard';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [classes, setClasses] = useState([]);
  const [classSubjects, setClassSubjects] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [terms, setTerms] = useState([]);
  const [currentAcademicYear, setCurrentAcademicYear] = useState(null);
  const [currentTerm, setCurrentTerm] = useState(null);

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');

  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [scoreDialogOpen, setScoreDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [examType, setExamType] = useState('ObjectiveOnly');
  const [scoreForm, setScoreForm] = useState({
    objectiveScore: '',
    theoryScore: '',
    testScore: '',
    remarks: '',
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedClass !== '') {
      loadClassSubjects(selectedClass);
      loadStudents(selectedClass);
      setClassSubjects([]);
      setStudents([]);
      setFilteredStudents([]);
    } else {
      setClassSubjects([]);
      setStudents([]);
      setFilteredStudents([]);
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedClass && selectedSubject && selectedAcademicYear && selectedTerm) {
      loadExistingScores();
    }
  }, [selectedClass, selectedSubject, selectedAcademicYear, selectedTerm]);

  useEffect(() => {
    // Filter students based on search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      setFilteredStudents(
        students.filter(
          (s) =>
            s.firstName?.toLowerCase().includes(query) ||
            s.lastName?.toLowerCase().includes(query) ||
            s.studentNumber?.toLowerCase().includes(query)
        )
      );
    } else {
      setFilteredStudents(students);
    }
  }, [searchQuery, students]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [classesRes, academicYearsRes, termsRes] = await Promise.all([
        adminAPI.classes.getAll(),
        academicYearsAPI.getAll(),
        termsAPI.getAll(),
      ]);

      if (classesRes.data?.success) setClasses(classesRes.data.data);
      if (academicYearsRes.data?.success) {
        setAcademicYears(academicYearsRes.data.data);
        const current = academicYearsRes.data.data.find((y) => y.isCurrent);
        if (current) {
          setSelectedAcademicYear(current.id);
          setCurrentAcademicYear(current);
        }
      }
      if (termsRes.data?.success) {
        setTerms(termsRes.data.data);
        const current = termsRes.data.data.find((t) => t.isCurrent);
        if (current) {
          setSelectedTerm(current.id);
          setCurrentTerm(current);
        }
      }
    } catch (err) {
      setError('Failed to load initial data');
    } finally {
      setLoading(false);
    }
  };

  const loadClassSubjects = async (classId) => {
    try {
      setError('');
      const response = await teacherAPI.classSubjects.getByClass(classId);
      console.log('ClassSubjects response:', response.data);
      if (response.data?.success && Array.isArray(response.data.data)) {
        setClassSubjects(response.data.data);
      } else if (response.data?.data?.items && Array.isArray(response.data.data.items)) {
        setClassSubjects(response.data.data.items);
      } else {
        setClassSubjects([]);
      }
    } catch (err) {
      console.error('Failed to load subjects:', err);
      setError('Failed to load subjects');
      setClassSubjects([]);
    }
  };

  const loadStudents = async (classId) => {
    try {
      const response = await teacherAPI.students.getByClass(classId);
      console.log('Students response:', response.data);
      if (response.data?.success && Array.isArray(response.data.data)) {
        const studentsList = response.data.data;
        setStudents(studentsList);
        setFilteredStudents(studentsList);
      } else if (response.data?.data?.items && Array.isArray(response.data.data.items)) {
        setStudents(response.data.data.items);
        setFilteredStudents(response.data.data.items);
      } else {
        setStudents([]);
        setFilteredStudents([]);
      }
    } catch (err) {
      console.error('Failed to load students:', err);
      setError('Failed to load students');
      setStudents([]);
      setFilteredStudents([]);
    }
  };

  const loadExistingScores = async () => {
    // Load existing scores for the selected combination
    try {
      if (!selectedAcademicYear || !selectedTerm) return;

      const yearId = selectedAcademicYear;
      // For each student, check if they have existing scores
      const updatedStudents = await Promise.all(
        students.map(async (student) => {
          try {
            const response = await teacherAPI.scores.getStudentScores(student.id, yearId);
            if (response.data?.success) {
              const scores = response.data.data;
              const existingScore = scores.find(
                (s) =>
                  s.subjectName ===
                    classSubjects.find((cs) => cs.id === selectedSubject)?.subject?.name &&
                  s.termName === terms.find((t) => t.id === selectedTerm)?.name
              );
              return { ...student, existingScore };
            }
          } catch (e) {
            // Ignore errors for individual students
          }
          return student;
        })
      );
      setStudents(updatedStudents);
      setFilteredStudents(updatedStudents);
    } catch (err) {
      console.error('Error loading scores:', err);
    }
  };

  const handleOpenScoreDialog = (student) => {
    setSelectedStudent(student);
    setExamType('ObjectiveOnly');
    setScoreForm({
      objectiveScore: student.existingScore?.objectiveScore?.toString() || '',
      theoryScore: student.existingScore?.theoryScore?.toString() || '',
      testScore: student.existingScore?.testScore?.toString() || '',
      remarks: student.existingScore?.teacherRemarks || '',
    });
    setScoreDialogOpen(true);
    setError('');
    setSuccess('');
  };

  const handleCloseScoreDialog = () => {
    setScoreDialogOpen(false);
    setSelectedStudent(null);
    setExamType('ObjectiveOnly');
    setScoreForm({
      objectiveScore: '',
      theoryScore: '',
      testScore: '',
      remarks: '',
    });
  };

  const handleScoreChange = (e) => {
    const { name, value } = e.target;
    setScoreForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateAndSaveScore = async () => {
    // Use the selected examType instead of auto-determining
    const validation = validateScore(
      examType,
      scoreForm.objectiveScore ? parseInt(scoreForm.objectiveScore) : null,
      scoreForm.theoryScore ? parseInt(scoreForm.theoryScore) : null,
      scoreForm.testScore ? parseInt(scoreForm.testScore) : null
    );

    if (!validation.isValid) {
      setError(validation.errors.join(', '));
      return;
    }

    setSaving(true);
    setError('');

    try {
      const academicYearId = selectedAcademicYear;
      const termId = selectedTerm;
      
      if (!academicYearId || academicYearId === '' || !termId || termId === '') {
        setError('Please select academic year and term');
        return;
      }

      console.log('Saving score with:', {
        studentId: selectedStudent.id,
        classId: selectedClass,
        subjectId: selectedSubject,
        academicYearId: academicYearId,
        termId: termId,
      });

      const dto = {
        studentId: selectedStudent.id,
        classId: selectedClass,
        subjectId: selectedSubject,
        academicYearId: academicYearId,
        termId: termId,
        examType: examTypeToEnum(examType),
        objectiveScore: scoreForm.objectiveScore ? parseInt(scoreForm.objectiveScore) : null,
        theoryScore: scoreForm.theoryScore ? parseInt(scoreForm.theoryScore) : null,
        testScore: scoreForm.testScore ? parseInt(scoreForm.testScore) : null,
        remarks: scoreForm.remarks,
      };

      const response = await teacherAPI.scores.manual(dto);

      if (response.data?.success) {
        setSuccess('Score saved successfully!');
        setTimeout(() => {
          handleCloseScoreDialog();
          loadExistingScores();
        }, 1500);
      } else {
        setError(response.data?.message || 'Failed to save score');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save score');
    } finally {
      setSaving(false);
    }
  };

  const determineExamType = () => {
    return examType;
  };

  const getExamTypeDisplay = () => {
    const config = getExamTypeConfig(examType);
    return config.scoringDescription;
  };

  const calculateTotal = () => {
    const obj = parseInt(scoreForm.objectiveScore) || 0;
    const th = parseInt(scoreForm.theoryScore) || 0;
    const tst = parseInt(scoreForm.testScore) || 0;
    return obj + th + tst;
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
      <PageHeader
        title="Manual Score Entry"
        subtitle="Manually enter student scores without requiring them to take exams"
      />

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
              <TextField
                fullWidth
                select
                label="Class"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <MenuItem value="">Select Class</MenuItem>
                {classes.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                select
                label="Subject"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                disabled={!selectedClass}
              >
                <MenuItem value="">Select Subject</MenuItem>
                {classSubjects.map((cs) => (
                  <MenuItem key={cs.id} value={cs.id}>
                    {cs.subject?.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                select
                label="Academic Year"
                value={selectedAcademicYear}
                onChange={(e) => setSelectedAcademicYear(e.target.value)}
              >
                <MenuItem value="">Select Year</MenuItem>
                {academicYears.map((ay) => (
                  <MenuItem key={ay.id} value={ay.id}>
                    {ay.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                select
                label="Term"
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
              >
                <MenuItem value="">Select Term</MenuItem>
                {terms.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {selectedClass && selectedSubject && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Students ({filteredStudents.length})
              </Typography>
              <TextField
                size="small"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: '#666' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: 250 }}
              />
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Matric No</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Student Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Objective</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Theory</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Test</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3, color: '#666' }}>
                        No students found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student) => (
                      <TableRow key={student.id} hover>
                        <TableCell>{student.studentNumber || '-'}</TableCell>
                        <TableCell>
                          {student.firstName} {student.lastName}
                        </TableCell>
                        <TableCell>{student.existingScore?.objectiveScore || '-'}</TableCell>
                        <TableCell>{student.existingScore?.theoryScore || '-'}</TableCell>
                        <TableCell>{student.existingScore?.testScore || '-'}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#FF3E8A' }}>
                          {student.existingScore?.totalScore || '-'}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenScoreDialog(student)}
                            sx={{
                              backgroundColor: '#FF3E8A',
                              color: '#fff',
                              '&:hover': { backgroundColor: '#e6337a' },
                            }}
                          >
                            <Edit />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Score Entry Dialog */}
      <Dialog open={scoreDialogOpen} onClose={handleCloseScoreDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Enter Score - {selectedStudent?.firstName} {selectedStudent?.lastName}
          <IconButton onClick={handleCloseScoreDialog}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Exam Type"
            value={examType}
            onChange={(e) => setExamType(e.target.value)}
            sx={{ mb: 2 }}
          >
            <MenuItem value="ObjectiveOnly">Objective Only</MenuItem>
            <MenuItem value="ObjectiveAndTheory">Objective + Theory</MenuItem>
            <MenuItem value="ObjectiveAndTest">Objective + Test</MenuItem>
            <MenuItem value="ObjectiveTheoryAndTest">Objective + Theory + Test</MenuItem>
          </TextField>

          <Grid container spacing={2}>
            {/* Objective - always shown */}
            <Grid item xs={12} sm={examType === 'ObjectiveOnly' ? 12 : 4}>
              <TextField
                fullWidth
                label="Objective Score"
                name="objectiveScore"
                type="number"
                value={scoreForm.objectiveScore}
                onChange={handleScoreChange}
                required
                InputProps={{ inputProps: { min: 0, max: 100 } }}
              />
            </Grid>

            {/* Theory - shown for ObjectiveAndTheory and ObjectiveTheoryAndTest */}
            {examType === 'ObjectiveAndTheory' || examType === 'ObjectiveTheoryAndTest' ? (
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Theory Score"
                  name="theoryScore"
                  type="number"
                  value={scoreForm.theoryScore}
                  onChange={handleScoreChange}
                  required
                  InputProps={{ inputProps: { min: 0, max: 100 } }}
                />
              </Grid>
            ) : null}

            {/* Test - shown for ObjectiveAndTest and ObjectiveTheoryAndTest */}
            {examType === 'ObjectiveAndTest' || examType === 'ObjectiveTheoryAndTest' ? (
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Test Score"
                  name="testScore"
                  type="number"
                  value={scoreForm.testScore}
                  onChange={handleScoreChange}
                  required
                  InputProps={{ inputProps: { min: 0, max: 100 } }}
                />
              </Grid>
            ) : null}

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Total"
                value={calculateTotal()}
                disabled
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography sx={{ fontWeight: 'bold' }}>/100</Typography>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Remarks"
                name="remarks"
                multiline
                rows={2}
                value={scoreForm.remarks}
                onChange={handleScoreChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseScoreDialog}>Cancel</Button>
          <Button
            onClick={validateAndSaveScore}
            variant="contained"
            disabled={saving}
            startIcon={<Save />}
            sx={{ backgroundColor: '#FF3E8A', '&:hover': { backgroundColor: '#e6337a' } }}
          >
            {saving ? 'Saving...' : 'Save Score'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManualScoreEntry;