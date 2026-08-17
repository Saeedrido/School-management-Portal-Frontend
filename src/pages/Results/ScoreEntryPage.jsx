import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  InputAdornment,
} from '@mui/material';
import {
  Search,
  Person,
  Edit,
  School,
} from '@mui/icons-material';
import { PageHeader } from '../../components/ui';
import { adminAPI, teacherAPI, academicYearsAPI, termsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ScoreEntryPage = () => {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const basePath = hasRole('Admin') ? '/admin-dashboard' : '/teacher-dashboard';
  const isTeacher = hasRole('Teacher');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [classes, setClasses] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [terms, setTerms] = useState([]);

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');

  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedAcademicYear) {
      loadTermsByAcademicYear(selectedAcademicYear);
    }
  }, [selectedAcademicYear]);

  useEffect(() => {
    if (selectedClass) {
      loadStudents(selectedClass);
    } else {
      setStudents([]);
      setFilteredStudents([]);
    }
  }, [selectedClass]);

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      setFilteredStudents(
        students.filter(
          (s) =>
            (s.firstName || s.FirstName || '').toLowerCase().includes(query) ||
            (s.lastName || '').toLowerCase().includes(query) ||
            (s.studentNumber || '').toLowerCase().includes(query) ||
            (s.FullName || '').toLowerCase().includes(query)
        )
      );
    } else {
      setFilteredStudents(students);
    }
  }, [searchQuery, students]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError('');

      const api = hasRole('Admin') ? adminAPI : teacherAPI;

      // For Teachers, the class dropdown is populated from API (returns only assigned classes)
      // For Admins, the class dropdown shows all classes
      const classesRes = await api.scores.getAllowedClasses();
      if (classesRes.data?.success) {
        const classesData = classesRes.data.data || [];
        setClasses(classesData);
        if (classesData.length > 0 && !isTeacher) {
          setSelectedClass(classesData[0].id);
        }
      }

      const academicYearsRes = await academicYearsAPI.getAll();
      if (academicYearsRes.data?.success) {
        const years = academicYearsRes.data.data || [];
        setAcademicYears(years);
        const current = years.find((y) => y.isActive) || years[0];
        if (current) {
          setSelectedAcademicYear(current.id);
        }
      }
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Failed to load initial data');
    } finally {
      setLoading(false);
    }
  };

  const loadTermsByAcademicYear = async (academicYearId) => {
    try {
      const termsRes = await termsAPI.getByAcademicYear(academicYearId);
      if (termsRes.data?.success) {
        const termsData = termsRes.data.data || [];
        setTerms(termsData);
        const current = termsData.find((t) => t.isActive) || termsData[0];
        if (current) {
          setSelectedTerm(current.id);
        }
      }
    } catch (err) {
      console.error('Error loading terms:', err);
    }
  };

  const loadStudents = async (classId) => {
    try {
      setError('');
      const api = hasRole('Admin') ? adminAPI : teacherAPI;
      const response = await api.scores.getStudentsByClass(classId);
      if (response.data?.success) {
        setStudents(response.data.data || []);
        setFilteredStudents(response.data.data || []);
      } else {
        setStudents([]);
        setFilteredStudents([]);
        if (response.data?.message) {
          setError(response.data.message);
        }
      }
    } catch (err) {
      console.error('Failed to load students:', err);
      const errMsg = err.response?.data?.message || err.response?.data?.errors?.[0] || 'Failed to load students';
      setError(errMsg);
      setStudents([]);
      setFilteredStudents([]);
    }
  };

  const handleStudentClick = (student) => {
    if (!selectedAcademicYear || !selectedTerm) {
      setError('Please select academic year and term');
      return;
    }
    const firstName = student.firstName || student.FirstName || '';
    const lastName = student.lastName || student.LastName || '';
    const className = classes.find((c) => c.id === selectedClass)?.name || '';
    navigate(`${basePath}/score-entry/${student.id}`, {
      state: {
        studentId: student.id,
        studentName: `${firstName} ${lastName}`,
        studentNumber: student.studentNumber || student.StudentNumber || '',
        classId: selectedClass,
        className: className,
        academicYearId: selectedAcademicYear,
        termId: selectedTerm,
      },
    });
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
        title="Score Entry"
        subtitle={isTeacher ? "Enter scores for your assigned class" : "Enter and manage student scores across all classes"}
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
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                select
                label="Class"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <School sx={{ color: '#666' }} />
                    </InputAdornment>
                  ),
                }}
              >
                <MenuItem value="">Select Class</MenuItem>
                {classes.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                select
                label="Academic Year"
                value={selectedAcademicYear}
                onChange={(e) => setSelectedAcademicYear(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <School sx={{ color: '#666' }} />
                    </InputAdornment>
                  ),
                }}
              >
                <MenuItem value="">Select Year</MenuItem>
                {academicYears.map((ay) => (
                  <MenuItem key={ay.id} value={ay.id}>
                    {ay.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                select
                label="Term"
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
                required
                disabled={!selectedAcademicYear}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <School sx={{ color: '#666' }} />
                    </InputAdornment>
                  ),
                }}
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

      {selectedClass && selectedAcademicYear && selectedTerm && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Students ({students.length})
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

            {students.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4, color: '#666' }}>
                <Person sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                <Typography variant="h6" color="inherit">
                  No students found in this class
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {isTeacher
                    ? 'You have no students assigned to this class.'
                    : 'This class has no enrolled students.'}
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Matric No</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Student Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id} hover>
                        <TableCell>{student.studentNumber || (student.StudentNumber) || '-'}</TableCell>
                        <TableCell>
                          {(student.firstName || student.FirstName || '')} {(student.lastName || student.LastName || '')}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleStudentClick(student)}
                            startIcon={<Edit />}
                            sx={{
                              backgroundColor: '#6FAF8F',
                              '&:hover': { backgroundColor: '#4E8C70' },
                            }}
                          >
                            Enter Scores
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ScoreEntryPage;
